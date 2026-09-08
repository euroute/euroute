/**
 * Reference station pairs for station-complex work.
 *
 * Reference data only. Expectations reflect the hardened Phase-2B classifier. Nothing here is wired into production logic; Phase 2
 * will implement and verify classification against this table.
 */

import type { StationIdentityInput } from "../station-identity";

/** Categories Phase 2 will implement. Not used by production code yet. */
export type StationPairCategory =
  | "SAME_COMPLEX"
  | "CONNECTED_COMPLEX"
  | "SAME_STATION"
  | "REAL_STATION_CHANGE"
  | "UNCERTAIN";

export type StationPairFixture = {
  label: string;
  a: StationIdentityInput;
  b: StationIdentityInput;
  /** Reference expectation for Phase 2 – NOT asserted against production yet. */
  expected: StationPairCategory;
};

export const STATION_PAIR_FIXTURES: StationPairFixture[] = [
  {
    label: "Paris-Nord / Gare du Nord",
    a: { name: "Paris-Nord", lat: 48.880959, lon: 2.35519 },
    b: { name: "Gare du Nord", lat: 48.880337, lon: 2.354979 },
    expected: "SAME_COMPLEX",
  },
  {
    label: "Paris Gare du Nord / Paris Gare de Lyon",
    a: { name: "Paris Gare du Nord", lat: 48.880337, lon: 2.354979 },
    b: { name: "Paris Gare de Lyon", lat: 48.844922, lon: 2.373464 },
    expected: "REAL_STATION_CHANGE",
  },
  {
    label: "London St Pancras / London King's Cross",
    a: { name: "London St Pancras International", lat: 51.5319, lon: -0.1264 },
    b: { name: "London King's Cross", lat: 51.5308, lon: -0.1238 },
    expected: "UNCERTAIN",
  },
  {
    label: "Stockholm C / Stockholm City",
    a: { name: "Stockholm Centralstation", lat: 59.3300, lon: 18.0585 },
    b: { name: "Stockholm City", lat: 59.3312, lon: 18.0592 },
    expected: "UNCERTAIN",
  },
  {
    label: "Stockholm C / T-Centralen",
    a: { name: "Stockholm C", lat: 59.3300, lon: 18.0585 },
    b: { name: "T-Centralen", lat: 59.3316, lon: 18.0596 },
    expected: "UNCERTAIN",
  },
  {
    label: "Hamburg Hbf / Hamburg Hauptbahnhof",
    a: { name: "Hamburg Hbf", lat: 53.5528, lon: 10.0064 },
    b: { name: "Hamburg Hauptbahnhof", lat: 53.5528, lon: 10.0064 },
    expected: "SAME_STATION",
  },
  {
    label: "Basel SBB naming variants",
    a: { name: "Basel SBB", lat: 47.5474, lon: 7.5896 },
    b: { name: "Basel CFF/FFS", lat: 47.5474, lon: 7.5896 },
    expected: "UNCERTAIN",
  },
  {
    label: "Wien Hbf / Wien Hauptbahnhof",
    a: { name: "Wien Hbf", lat: 48.1852, lon: 16.3766 },
    b: { name: "Wien Hauptbahnhof", lat: 48.1852, lon: 16.3766 },
    expected: "SAME_STATION",
  },
  {
    label: "Roma Termini variants",
    a: { name: "ROMA TERMINI", lat: 41.9010, lon: 12.5019 },
    b: { name: "Roma Termini", lat: 41.9010, lon: 12.5019 },
    expected: "SAME_STATION",
  },
  {
    label: "Firenze S.M.N. / Firenze Santa Maria Novella",
    a: { name: "Firenze S.M.N.", lat: 43.7765, lon: 11.2480 },
    b: { name: "FIRENZE S.MARIA NOVELLA", lat: 43.7765, lon: 11.2480 },
    expected: "SAME_STATION",
  },
];
