/**
 * Server-only abuse protection and short-lived caching for Euroute's public
 * endpoints (station search, journey search, Smart Overnight, booking clicks).
 *
 * Scope and honest limitations:
 * - State lives in the memory of the serverless isolate handling the request.
 *   That is enough to stop trivial floods from a single client, and it costs
 *   nothing. It is deliberately not a distributed quota system.
 * - The client key is a salted SHA-256 hash of IP + User-Agent. No raw IP is
 *   ever stored or logged.
 */

import { getRequestHeader } from "@tanstack/react-start/server";

/* ------------------------------------------------------------------ client */

function clientIp(): string {
  return (
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-real-ip") ??
    (getRequestHeader("x-forwarded-for") ?? "").split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Salted, truncated hash of IP + User-Agent. Pseudonymous, not personal data.
 *
 * The salt is a dedicated server-only secret (EUROUTE_RATE_LIMIT_SALT). It is
 * never sent to the browser and has no predictable fallback: if it is missing,
 * a random per-isolate value is used, so keys stay unguessable (rate limiting
 * then simply scopes to that isolate).
 */
let ephemeralSalt: string | null = null;

export async function clientKey(): Promise<string> {
  const configured = process.env["EUROUTE_RATE_LIMIT_SALT"];
  if (!configured && !ephemeralSalt) {
    ephemeralSalt = crypto.randomUUID();
    console.warn("[abuse] EUROUTE_RATE_LIMIT_SALT is not configured; using an ephemeral salt.");
  }
  const salt = configured ?? ephemeralSalt!;
  const raw = `${salt}|${clientIp()}|${getRequestHeader("user-agent") ?? ""}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* --------------------------------------------------------------- rate limit */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

/** Fixed-window counter. Returns ok:false once `limit` is exceeded. */
export function rateLimit(
  name: string,
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const id = `${name}:${key}`;
  const existing = buckets.get(id);

  if (!existing || existing.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/* ------------------------------------------------------- upstream budget */

/**
 * Hard ceiling on real upstream timetable routing calls for one logical
 * journey-planning operation (initial search + the Smart Overnight follow-up
 * that belongs to it). Cache hits and coalesced in-flight joins never count,
 * because they cause no upstream traffic.
 *
 * Like the rate limiter, the ledger lives in the memory of the isolate that
 * happens to serve the request: best-effort, not globally durable.
 */
export type UpstreamBudget = {
  /** Reserve one upstream call. False when the budget is exhausted. */
  consume: () => boolean;
  used: () => number;
  remaining: () => number;
  limit: number;
};

/**
 * Hard upstream routing budget for one logical journey-planning operation
 * (initial search plus the Smart Overnight follow-up that belongs to it).
 *
 * Structural worst case today: 12 chained /plan calls for an A -> B search
 * with the maximum of 3 via points, plus 10 for a full Smart Overnight
 * evaluation (2 extra day-1 searches, 6 onward searches, 2 second-night
 * searches) = 22. The budget keeps a small margin for the case where the 90 s
 * routing cache expires between the two requests of the same search.
 */
export const UPSTREAM_PLAN_BUDGET = 24;
export const UPSTREAM_BUDGET_WINDOW_MS = 180_000;

/** Same id for the initial search and its Smart Overnight follow-up. */
export function searchBudgetId(key: string, from: string, to: string, departAt: string): string {
  return `plan-budget:${key}:${from}>${to}@${departAt}`;
}

type Ledger = { used: number; expiresAt: number };
const ledgers = new Map<string, Ledger>();

export function upstreamBudget(id: string, limit: number, windowMs: number): UpstreamBudget {
  const now = Date.now();
  let ledger = ledgers.get(id);
  if (!ledger || ledger.expiresAt <= now) {
    ledger = { used: 0, expiresAt: now + windowMs };
    ledgers.set(id, ledger);
    if (ledgers.size > 5000) {
      for (const [k, v] of ledgers) if (v.expiresAt <= now) ledgers.delete(k);
    }
  }
  const entry = ledger;
  return {
    limit,
    used: () => entry.used,
    remaining: () => Math.max(limit - entry.used, 0),
    consume: () => {
      if (entry.used >= limit) return false;
      entry.used += 1;
      return true;
    },
  };
}

/* -------------------------------------------------------------------- cache */

type Entry = { value: unknown; expiresAt: number };
const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

/** Thrown when a gated upstream call is refused by the budget. */
export class BudgetExhausted extends Error {
  constructor() {
    super("upstream budget exhausted");
    this.name = "BudgetExhausted";
  }
}

/**
 * Short-lived cache with in-flight deduplication. Identical concurrent or
 * rapidly repeated requests share one upstream call; anything beyond the TTL
 * is fetched fresh so timetable quality is preserved.
 *
 * `gate` runs only when a real upstream fetch is about to start – never on a
 * cache hit or a coalesced join – and throws `BudgetExhausted` when refused.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  gate?: () => boolean,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const pending = inflight.get(key);
  if (pending) return (await pending) as T;

  if (gate && !gate()) throw new BudgetExhausted();

  const promise = load()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      if (cache.size > 500) {
        for (const [k, v] of cache) if (v.expiresAt <= Date.now()) cache.delete(k);
      }
      return value;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

