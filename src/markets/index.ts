// markets/index.ts — the market table registry.
// adding a market is one new file here and one line in this map: additive
// rows, never code changes in the matching stages.

import type { MarketTables } from "../tables.js";
import { US } from "./us.js";
import { CA } from "./ca.js";
import { GB } from "./gb.js";
import { AU } from "./au.js";
import { DE } from "./de.js";
import { FR } from "./fr.js";
import { IT } from "./it.js";
import { NL } from "./nl.js";
import { ES } from "./es.js";
import { BE } from "./be.js";
import { AT } from "./at.js";
import { CH } from "./ch.js";
import { SE } from "./se.js";
import { DK } from "./dk.js";
import { IE } from "./ie.js";
import { NZ } from "./nz.js";

export const MARKET_TABLES: Record<string, MarketTables> = {
  us: US,
  ca: CA,
  gb: GB,
  au: AU,
  de: DE,
  fr: FR,
  it: IT,
  nl: NL,
  es: ES,
  be: BE,
  at: AT,
  ch: CH,
  se: SE,
  dk: DK,
  ie: IE,
  nz: NZ,
};

// providers are a cross-market table: a chain like "the ups store" operates
// in more than one market, so its row carries its markets itself.
import { MAILBOX_PROVIDERS } from "./providers.js";
export { MAILBOX_PROVIDERS };
