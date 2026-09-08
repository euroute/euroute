/**
 * Stabila felkoder för tidtabellsanropen (station- och resesökning).
 *
 * Serverfunktionerna returnerade tidigare färdiga svenska meningar, som visades
 * ordagrant även när gränssnittet var på engelska. Servern skickar därför en
 * neutral kod och webbläsaren översätter den. Koden innehåller aldrig
 * tekniska detaljer om uppströmstjänsten.
 *
 * Klientsäker modul: inga serverberoenden, ingen språkinformation skickas till
 * servern, och sökningens semantik, cachenycklar och uppströmsanrop påverkas
 * inte.
 */
export type RailErrorCode = "rate_limited" | "timetable_unavailable" | "station_search_failed";

const KEYS: Record<RailErrorCode, string> = {
  rate_limited: "railError.rateLimited",
  timetable_unavailable: "railError.timetableUnavailable",
  station_search_failed: "railError.stationSearchFailed",
};

/**
 * Översättningsnyckel för en felkod. Okända värden (t.ex. en gammal cachad
 * sträng i webbläsaren) faller tillbaka på det neutrala tidtabellsfelet, så att
 * resenären aldrig ser en rå nyckel eller en teknisk text.
 */
export function railErrorMessageKey(code: string | null | undefined): string {
  if (code && code in KEYS) return KEYS[code as RailErrorCode];
  return KEYS.timetable_unavailable;
}
