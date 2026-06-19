// Single source of truth: the registry UI is generated directly from the seed files.
// No hand-maintained duplicate data lives in the app.
import enforcersJson from "../../seed/enforcers.json";
import composabilityJson from "../../seed/composability.json";
import type { Seed, Composability, Enforcer } from "./types";

export const seed = enforcersJson as unknown as Seed;
export const composability = composabilityJson as unknown as Composability;
export const enforcers: Enforcer[] = seed.enforcers;

export const sourceUrl = (name: string) => `${seed.sourceBase}${name}.sol`;

// Distinct restriction categories across the seed (drives the Browse filter).
export const allRestrictions = Array.from(
  new Set(enforcers.flatMap((e) => e.restricts)),
).sort();

// Composability relationships that involve a given type (either side).
export const relationsFor = (name: string) =>
  composability.relationships.filter((r) => r.subject === name || r.object === name);
