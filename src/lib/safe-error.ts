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
  return new Error("EUROUTE_UPSTREAM_FAILED");
}
