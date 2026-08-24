// Bokningslänkar per etapp. Client-safe.
//
// Pre-Launch Fix 2 (operatörsintegritet):
// Tidigare matchades operatörer med fuzzy delsträngs-/ordmatchning på korta
// koder ("sj", "ns", "vr", "sl", "cd", "vy", "db"). Det kan kollidera med helt
// andra bolag internationellt och skicka resenären till fel järnvägsföretag.
//
// Nu gäller:
//   1. Endast EXAKT matchning mot en normaliserad, explicit alias-lista. Ingen
//      delsträngsmatchning och ingen gissning från tvåbokstavsfragment.
//   2. Om namnet inte finns i listan används tågbolagets egen adress från
//      tidtabellsdatan (agencyUrl) – aldrig en påhittad URL.
//   3. Är även den okänd förblir operatören okänd: vi visar ingen
//      "Boka hos X"-knapp, bara den neutrala reseplaneraren och Trainline.
//
// Vi använder agencyName (normaliserat) och inte agencyId, eftersom agencyId i
// Transitous/MOTIS är lokalt per datakälla (GTFS-flöde) och inte ett stabilt
// globalt operatörs-ID.

import type { Leg } from "./journey";

type OperatorConfig = {
  label: string;
  /** Verifierad startsida/bokningssida hos operatören */
  home: string;
};

/** Ta bort landsdel ("Berlin, Tyskland" → "Berlin") och spårinfo. */
function cleanName(name: string): string {
  return name.split(",")[0]!.trim();
}

const e = encodeURIComponent;
/** Transkriberar nordiska/tyska tecken så att URL-slugar inte tappar bokstäver. */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** ISO-tid (utan sekunder) i Europe/Berlin, formatet DB:s planerare vill ha. */
function berlinLocalIso(iso: string): string {
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).formatToParts(new Date(iso));
  const get = (t: string) => fmt.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:00`;
}

/** Bolagsformer som aldrig ska påverka identifieringen. */
const LEGAL_SUFFIXES = new Set([
  "ab",
  "as",
  "asa",
  "a/s",
  "ag",
  "gmbh",
  "sa",
  "sas",
  "spa",
  "srl",
  "plc",
  "nv",
  "bv",
  "oy",
  "oyj",
  "kft",
  "zrt",
  "sp",
  "zoo",
  "inc",
  "ltd",
]);

/**
 * Normaliserar ett operatörsnamn till en jämförbar nyckel: gemener, utan
 * diakritiska tecken, utan skiljetecken och utan bolagsform.
 */
export function normalizeOperatorName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const words = base.split(" ").filter((word) => word && !LEGAL_SUFFIXES.has(word));
  return words.join(" ");
}

/**
 * Explicit alias-lista. Nycklarna är normaliserade fullständiga namn exakt så
 * som de förekommer i tidtabellsdatan (eller som operatörens officiella namn).
 * Ingen nyckel matchas som delsträng – bara som hel sträng.
 */
const OPERATOR_ALIASES: Record<string, OperatorConfig> = {};

function register(config: OperatorConfig, aliases: string[]) {
  for (const alias of aliases) {
    OPERATOR_ALIASES[normalizeOperatorName(alias)] = config;
  }
}

// Sverige
register({ label: "SJ", home: "https://www.sj.se/" }, [
  "SJ",
  "SJ AB",
  "SJ Norrland",
  "Statens Järnvägar",
]);
register({ label: "Snälltåget", home: "https://www.snalltaget.se/" }, [
  "Snälltåget",
  "Snalltaget",
]);
register({ label: "Skånetrafiken", home: "https://www.skanetrafiken.se/" }, [
  "Skånetrafiken",
  "Skanetrafiken",
]);
register({ label: "Öresundståg", home: "https://www.oresundstag.se/" }, [
  "Öresundståg",
  "Oresundstag",
]);
register({ label: "Västtrafik", home: "https://www.vasttrafik.se/" }, [
  "Västtrafik",
  "Vasttrafik",
]);
register({ label: "SL", home: "https://sl.se/" }, [
  "SL",
  "Storstockholms Lokaltrafik",
  "AB Storstockholms Lokaltrafik",
]);
register({ label: "Vy Tåg", home: "https://www.vy.se/" }, ["Vy Tåg", "Vy Tag", "Vy Tåg AB"]);
register({ label: "Mälartåg", home: "https://www.malartag.se/" }, ["Mälartåg", "Malartag"]);
register({ label: "Norrtåg", home: "https://www.norrtag.se/" }, ["Norrtåg", "Norrtag"]);

// Norge / Danmark / Finland
register({ label: "Vy", home: "https://www.vy.no/en" }, ["Vy", "Vygruppen", "NSB"]);
register({ label: "SJ Norge", home: "https://www.sj.no/" }, ["SJ Norge", "SJ Norge AS"]);
register({ label: "DSB", home: "https://www.dsb.dk/en/" }, [
  "DSB",
  "Danske Statsbaner",
  "Dänische Staatsbahnen",
  "Danish State Railways",
]);
register({ label: "VR", home: "https://www.vr.fi/en" }, ["VR", "VR Group", "VR-Yhtymä"]);

// Tyskland / Österrike / Schweiz
register({ label: "Deutsche Bahn", home: "https://int.bahn.de/en" }, [
  "DB",
  "Deutsche Bahn",
  "DB Fernverkehr",
  "DB Fernverkehr AG",
  "DB Regio",
  "DB Regio AG",
  "DB InterCity",
]);
register({ label: "S-Bahn Hamburg", home: "https://www.s-bahn-hamburg.de/" }, ["S-Bahn Hamburg"]);
register({ label: "S-Bahn Berlin", home: "https://sbahn.berlin/" }, ["S-Bahn Berlin"]);
register({ label: "FlixTrain", home: "https://www.flixtrain.com/" }, [
  "FlixTrain",
  "FlixTrain-de",
  "FlixTrain GmbH",
]);
register({ label: "ÖBB", home: "https://www.oebb.at/en/" }, [
  "ÖBB",
  "OEBB",
  "OBB",
  "ÖBB Personenverkehr",
  "OEBB Personenverkehr",
  "OEBB Personenverkehr AG Kundenservice",
  "ÖBB Personenverkehr AG Kundenservice",
  "Österreichische Bundesbahnen",
]);
register({ label: "SBB", home: "https://www.sbb.ch/en" }, [
  "SBB",
  "CFF",
  "FFS",
  "SBB CFF FFS",
  "Schweizerische Bundesbahnen",
  "Schweizerische Bundesbahnen SBB",
  "SBB GmbH (Grenzverkehr)",
  "SBB Deutschland",
]);
register({ label: "Thurbo", home: "https://www.thurbo.ch/" }, ["Thurbo"]);
register({ label: "BLS", home: "https://www.bls.ch/en" }, ["BLS", "BLS AG"]);
register({ label: "Rhätische Bahn", home: "https://www.rhb.ch/en" }, [
  "Rhätische Bahn",
  "Rhaetische Bahn",
  "RhB",
]);

// Benelux / Frankrike / Storbritannien
register({ label: "NS", home: "https://www.nsinternational.com/en" }, [
  "NS",
  "NS International",
  "Nederlandse Spoorwegen",
]);
register({ label: "SNCB", home: "https://www.belgiantrain.be/en" }, [
  "SNCB",
  "NMBS",
  "SNCB/NMBS",
]);
register({ label: "CFL", home: "https://www.cfl.lu/" }, ["CFL"]);
register({ label: "SNCF Connect", home: "https://www.sncf-connect.com/en-en/" }, [
  "SNCF",
  "SNCF Voyageurs",
  "SNCF Voyages",
  "TER",
  "TGV INOUI",
  "OUIGO",
]);
register({ label: "RATP", home: "https://www.ratp.fr/en" }, ["RATP"]);
register({ label: "Eurostar", home: "https://www.eurostar.com/" }, [
  "Eurostar",
  "Eurostar International",
  "Thalys",
]);

// Italien / Spanien / Portugal
register({ label: "Trenitalia", home: "https://www.trenitalia.com/en.html" }, [
  "Trenitalia",
  "Trenitalia SpA",
  "Le Frecce",
  "Frecciarossa",
]);
register({ label: "Trenord", home: "https://www.trenord.it/en/" }, ["Trenord"]);
register({ label: "Italo", home: "https://www.italotreno.com/en" }, ["Italo", "NTV Italo"]);
register({ label: "Renfe", home: "https://www.renfe.com/es/en" }, ["Renfe", "Renfe Viajeros"]);
register({ label: "CP", home: "https://www.cp.pt/passageiros/en" }, [
  "CP",
  "Comboios de Portugal",
]);

// Central- och Östeuropa
register({ label: "PKP Intercity", home: "https://www.intercity.pl/en/" }, [
  "PKP Intercity",
  "PKP IC",
]);
register({ label: "České dráhy", home: "https://www.cd.cz/en/" }, [
  "České dráhy",
  "Ceske drahy",
  "ČD",
  "CD",
]);
register({ label: "ZSSK", home: "https://www.zssk.sk/en/" }, ["ZSSK", "Železničná spoločnosť Slovensko"]);
register({ label: "MÁV", home: "https://www.mavcsoport.hu/en" }, [
  "MÁV",
  "MAV",
  "MÁV-START",
  "MAV-START",
]);
register({ label: "RegioJet", home: "https://www.regiojet.com/" }, ["RegioJet"]);

// Nattågsoperatörer
register({ label: "European Sleeper", home: "https://www.europeansleeper.eu/en" }, [
  "European Sleeper",
]);
register({ label: "Nightjet", home: "https://www.nightjet.com/en" }, ["Nightjet"]);

export type BookingTarget = {
  label: string;
  url: string;
  isDeepLink: boolean;
};

/**
 * Slår upp operatören på exakt normaliserat namn. Okända namn ger `undefined`
 * – vi gissar aldrig utifrån fragment.
 */
export function findOperator(operator: string | undefined): OperatorConfig | undefined {
  if (!operator) return undefined;
  const key = normalizeOperatorName(operator);
  if (!key) return undefined;
  return OPERATOR_ALIASES[key];
}

/**
 * Förifylld sökning i DB:s europeiska reseplanerare – går direkt till rätt
 * sträcka, datum och tid. Neutral: fungerar oavsett vilket bolag som kör.
 */
export function bookingTargetForLeg(leg: Leg): BookingTarget {
  const from = cleanName(leg.fromName);
  const to = cleanName(leg.toName);
  const hd = berlinLocalIso(leg.departure);
  const url = `https://int.bahn.de/en/buchung/fahrplan/suche#sts=true&so=${e(from)}&zo=${e(to)}&hd=${e(hd)}&kl=2&r=13:16:KLASSENLOS:1&soid=A%3D1%40O%3D${e(from)}&zoid=A%3D1%40O%3D${e(to)}`;
  return {
    label: "Se tider & boka etappen",
    url,
    isDeepLink: true,
  };
}

/** Bara http(s)-adresser från datakällan får användas. */
function safeHttpUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Tågbolagets egen sida. Returnerar null när operatören inte kan identifieras
 * säkert – hellre ingen knapp än en knapp till fel järnvägsföretag.
 */
export function operatorTargetForLeg(leg: Leg): BookingTarget | null {
  const config = findOperator(leg.operator);
  if (config) {
    return { label: config.label, url: config.home, isDeepLink: false };
  }
  // Ingen alias-träff: använd bolagets egen adress ur tidtabellsdatan om den
  // finns. Den kommer från datakällan, inte från en gissning.
  const feedUrl = safeHttpUrl(leg.operatorUrl);
  if (feedUrl && leg.operator) {
    return { label: leg.operator, url: feedUrl, isDeepLink: false };
  }
  return null;
}

/** Trainline-sida som neutral reserv. */
export function retailerTargetForLeg(leg: Leg): BookingTarget {
  return {
    label: "Trainline",
    url: `https://www.thetrainline.com/train-times/${slug(cleanName(leg.fromName))}-to-${slug(cleanName(leg.toName))}`,
    isDeepLink: false,
  };
}
