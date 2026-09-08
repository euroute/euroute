/**
 * Neutral felhantering för serverfunktioner.
 *
 * Tekniska detaljer (databasmeddelanden, tabellnamn, tredjeparts-svar) ska
 * aldrig nå webbläsaren – de kan avslöja hur systemet är byggt. Vi loggar
 * därför bara en felkod och ett scope på servern, aldrig innehåll som kan
 * innehålla resenärens data, och kastar ett neutralt fel vidare.
 */
export function dbError(error: { code?: string | null } | null, scope = "db"): Error {
  console.error(`[euroute:${scope}] database error${error?.code ? ` (${error.code})` : ""}`);
  return new Error("EUROUTE_REQUEST_FAILED");
}

/** Neutralt fel för externa tjänster (tidtabellsdata m.m.). */
export function upstreamError(scope: string, status?: number): Error {
  console.error(`[euroute:${scope}] upstream request failed${status ? ` (${status})` : ""}`);
  const error = new Error("EUROUTE_UPSTREAM_FAILED");
  // Statusen stannar på servern: den läcker aldrig till klienten, men låter
  // routingen skilja ett okänt stations-id från en driftstörning.
  if (typeof status === "number") Object.assign(error, { upstreamStatus: status });
  return error;
}

/**
 * HTTP-status för ett uppströmsfel, när det finns. Används internt för att
 * skilja endpoint-relaterade fel (okänt hållplats-id) från driftstörningar.
 */
export function upstreamStatus(error: unknown): number | undefined {
  const status = (error as { upstreamStatus?: unknown } | null)?.upstreamStatus;
  return typeof status === "number" ? status : undefined;
}
