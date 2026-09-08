// Client-safe validation of the public Place contract, shared by the server
// function boundary and its tests. Coordinates stay mandatory; `stopId` is an
// additive, optional field that older payloads simply omit.

import { z } from "zod";

import { MAX_STOP_ID_LENGTH } from "./journey";

export const PlaceSchema = z.object({
  name: z.string().min(1).max(160),
  place: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  country: z.string().max(8).optional(),
  // Purely informational in this phase: routing still uses `place`.
  stopId: z.string().min(1).max(MAX_STOP_ID_LENGTH).optional(),
  // Phase 3B: city vs station intent. Optional so legacy payloads stay valid;
  // an enum so no arbitrary string can reach routing.
  intent: z.enum(["city", "station"]).optional(),
});
