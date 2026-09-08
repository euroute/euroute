/**
 * F5B P1 #1 — bokningslänkens avgångstid måste vara etappens EGNA lokala
 * civiltid, alltså exakt samma klocka som Euroute visar för etappen.
 *
 * Tidigare räknades tiden om till Europe/Berlin, vilket flyttade avgången
 * ±1–2 timmar utanför centraleuropeisk tid. Testerna nedan jämför alltid
 * gränssnittets klocka (formatClock + legDepartureZone) med hd-parametern i
 * bokningslänken, så regeln bevisas generiskt och utan land- eller
 * operatörsundantag.
 */
import { describe, expect, it } from "vitest";

import { formatClock, type Leg } from "./journey";
import { bookingTargetForLeg, retailerTargetForLeg } from "./operators";
import { legDepartureZone } from "./station-timezone";

function leg(partial: Partial<Leg> & { departure: string; fromPlace: string }): Leg {
  return {
    kind: "train",
    mode: "TRAIN",
    modeLabel: "Tåg",
    fromName: "A",
    toName: "B",
    arrival: partial.departure,
    durationMinutes: 60,
    realTime: false,
    ...partial,
  } as Leg;
}

/** hd-parametern ur bokningslänken, avkodad. */
function bookingDeparture(l: Leg): string {
  const url = bookingTargetForLeg(l).url;
  const raw = /hd=([^&]+)/.exec(url)?.[1];
  expect(raw, "booking url must carry an hd parameter").toBeTruthy();
  return decodeURIComponent(raw!);
}

/** Klockan så som gränssnittet renderar den för etappen. */
function displayedClock(l: Leg): string {
  return formatClock(l.departure, legDepartureZone(l));
}

/** Datumdelen så som gränssnittet skulle räkna den lokala kalenderdagen. */
function displayedDate(l: Leg): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: legDepartureZone(l),
  }).formatToParts(new Date(l.departure));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Stationskoordinater. Zonen slås upp koordinatbaserat, precis som i
 * gränssnittet – inga hårdkodade zonundantag finns i implementationen.
 */
const PLACES = {
  berlin: "52.525589,13.369545",
  paris: "48.844266,2.373470",
  stockholm: "59.330140,18.058153",
  kobenhavn: "55.672720,12.564617",
  milano: "45.486400,9.204300",
  london: "51.531300,-0.126000",
  lisboa: "38.767100,-9.099300",
  athina: "37.991900,23.720200",
  bucuresti: "44.445000,26.074000",
  helsinki: "60.171800,24.941300",
} as const;

type Case = {
  name: string;
  place: string;
  /** Absolut instant med etappens egen offset, som från tidtabellskällan. */
  departure: string;
  expectedLocal: string;
};

const MATRIX: Case[] = [
  // Centraleuropa (CET/CEST) – oförändrat beteende jämfört med tidigare.
  { name: "Berlin", place: PLACES.berlin, departure: "2026-08-28T08:01:00+02:00", expectedLocal: "2026-08-28T08:01:00" },
  { name: "Paris", place: PLACES.paris, departure: "2026-08-28T08:46:00+02:00", expectedLocal: "2026-08-28T08:46:00" },
  { name: "Stockholm", place: PLACES.stockholm, departure: "2026-08-28T11:20:00+02:00", expectedLocal: "2026-08-28T11:20:00" },
  { name: "København", place: PLACES.kobenhavn, departure: "2026-08-28T08:22:00+02:00", expectedLocal: "2026-08-28T08:22:00" },
  { name: "Milano", place: PLACES.milano, departure: "2026-08-29T13:10:00+02:00", expectedLocal: "2026-08-29T13:10:00" },

  // Väster om centraleuropeisk tid – här uppstod −1 h-felet.
  { name: "London", place: PLACES.london, departure: "2026-08-28T08:01:00+01:00", expectedLocal: "2026-08-28T08:01:00" },
  { name: "Lisboa", place: PLACES.lisboa, departure: "2026-08-28T21:34:00+01:00", expectedLocal: "2026-08-28T21:34:00" },

  // Öster om centraleuropeisk tid – här uppstod +1 h-felet.
  { name: "Athina", place: PLACES.athina, departure: "2026-08-28T07:20:00+03:00", expectedLocal: "2026-08-28T07:20:00" },
  { name: "București", place: PLACES.bucuresti, departure: "2026-08-28T15:45:00+03:00", expectedLocal: "2026-08-28T15:45:00" },
  { name: "Helsinki", place: PLACES.helsinki, departure: "2026-08-28T06:07:00+03:00", expectedLocal: "2026-08-28T06:07:00" },
];

describe("booking deep link departure time", () => {
  for (const c of MATRIX) {
    it(`${c.name}: booking time equals the displayed local departure`, () => {
      const l = leg({ departure: c.departure, fromPlace: c.place });
      const hd = bookingDeparture(l);

      // 1. Exakt förväntad lokal civiltid.
      expect(hd).toBe(c.expectedLocal);
      // 2. Samma klocka som gränssnittet visar.
      expect(hd.slice(11, 16)).toBe(displayedClock(l));
      // 3. Samma lokala kalenderdag som gränssnittet visar.
      expect(hd.slice(0, 10)).toBe(displayedDate(l));
    });
  }

  it("never applies a Berlin conversion to a London departure", () => {
    const l = leg({ departure: "2026-08-28T08:01:00+01:00", fromPlace: PLACES.london });
    expect(bookingDeparture(l)).not.toBe("2026-08-28T09:01:00");
  });

  it("never applies a Berlin conversion to an Athens departure", () => {
    const l = leg({ departure: "2026-08-28T07:20:00+03:00", fromPlace: PLACES.athina });
    expect(bookingDeparture(l)).not.toBe("2026-08-28T06:20:00");
  });
});

describe("booking deep link date boundaries", () => {
  it("keeps the local date at 00:05 in London (Berlin would show the same day but a later hour)", () => {
    const l = leg({ departure: "2026-08-28T00:05:00+01:00", fromPlace: PLACES.london });
    expect(bookingDeparture(l)).toBe("2026-08-28T00:05:00");
  });

  it("does not shift the date backwards for a late London departure", () => {
    const l = leg({ departure: "2026-08-28T23:59:00+01:00", fromPlace: PLACES.london });
    const hd = bookingDeparture(l);
    expect(hd).toBe("2026-08-28T23:59:00");
    // Den gamla Berlin-omräkningen hade gett nästa kalenderdag, 00:59.
    expect(hd.slice(0, 10)).toBe("2026-08-28");
  });

  it("does not shift the date forwards for an early Athens departure", () => {
    const l = leg({ departure: "2026-08-29T00:30:00+03:00", fromPlace: PLACES.athina });
    const hd = bookingDeparture(l);
    expect(hd).toBe("2026-08-29T00:30:00");
    // Den gamla Berlin-omräkningen hade gett föregående kalenderdag, 23:30.
    expect(hd.slice(0, 10)).toBe("2026-08-29");
  });

  it("uses the boarding date for a leg that crosses midnight", () => {
    const l = leg({
      departure: "2026-08-28T22:55:00+02:00",
      arrival: "2026-08-29T08:08:00+02:00",
      fromPlace: PLACES.kobenhavn,
      trainName: "EN 473",
    });
    expect(bookingDeparture(l)).toBe("2026-08-28T22:55:00");
  });

  it("uses the boarding station's local midnight date, not the arrival station's", () => {
    // Avgång 23:40 i London = 00:40 nästa dag i Paris. Bokningen ska visa 23:40 den 28:e.
    const l = leg({
      departure: "2026-08-28T23:40:00+01:00",
      arrival: "2026-08-29T03:00:00+02:00",
      fromPlace: PLACES.london,
      toPlace: PLACES.paris,
    });
    expect(bookingDeparture(l)).toBe("2026-08-28T23:40:00");
  });
});

describe("booking deep link DST behaviour", () => {
  it("uses summer time for a Berlin departure before the October switch", () => {
    // 2026-10-25 03:00 CEST → 02:00 CET är omställningen; 24 okt är fortfarande CEST.
    const l = leg({ departure: "2026-10-24T09:15:00+02:00", fromPlace: PLACES.berlin });
    expect(bookingDeparture(l)).toBe("2026-10-24T09:15:00");
  });

  it("uses winter time for a Berlin departure after the October switch", () => {
    const l = leg({ departure: "2026-10-26T09:15:00+01:00", fromPlace: PLACES.berlin });
    expect(bookingDeparture(l)).toBe("2026-10-26T09:15:00");
  });

  it("keeps London one hour behind Berlin across the same DST week", () => {
    const before = leg({ departure: "2026-10-24T09:15:00+01:00", fromPlace: PLACES.london });
    const after = leg({ departure: "2026-10-26T09:15:00+00:00", fromPlace: PLACES.london });
    expect(bookingDeparture(before)).toBe("2026-10-24T09:15:00");
    expect(bookingDeparture(after)).toBe("2026-10-26T09:15:00");
  });
});

describe("booking deep link structure is unchanged", () => {
  const l = leg({
    departure: "2026-08-28T08:01:00+01:00",
    fromPlace: PLACES.london,
    fromName: "London St Pancras",
    toName: "Paris Nord, France",
  });

  it("is a valid absolute https url to the same booking target as before", () => {
    const url = new URL(bookingTargetForLeg(l).url);
    expect(url.protocol).toBe("https:");
    expect(url.host).toBe("int.bahn.de");
    expect(url.pathname).toBe("/en/buchung/fahrplan/suche");
    expect(bookingTargetForLeg(l).isDeepLink).toBe(true);
  });

  it("still carries origin, destination and class parameters", () => {
    const url = bookingTargetForLeg(l).url;
    expect(url).toContain("so=London%20St%20Pancras");
    expect(url).toContain("zo=Paris%20Nord");
    expect(url).toContain("kl=2");
    expect(url).toContain("sts=true");
  });

  it("leaves the neutral retailer link untouched", () => {
    expect(retailerTargetForLeg(l).url).toBe(
      "https://www.thetrainline.com/train-times/london-st-pancras-to-paris-nord",
    );
  });
});

describe("booking deep link without coordinates", () => {
  it("falls back to the same zone the interface falls back to", () => {
    const l = leg({ departure: "2026-08-28T08:01:00+02:00", fromPlace: "" });
    const hd = bookingDeparture(l);
    // Fallbackzonen är Europe/Stockholm i både klocka och bokningslänk.
    expect(hd.slice(11, 16)).toBe(displayedClock(l));
    expect(hd).toBe("2026-08-28T08:01:00");
  });
});
