// seeded market tables. adding a market is one new file plus one line
// here: additive table rows, never code changes in the stages. dk is
// unseeded by design; do not add it.

import { AR } from "./ar.js";
import { AT } from "./at.js";
import { AU } from "./au.js";
import { BD } from "./bd.js";
import { BE } from "./be.js";
import { BR } from "./br.js";
import { CA } from "./ca.js";
import { CH } from "./ch.js";
import { CL } from "./cl.js";
import { CO } from "./co.js";
import { CY } from "./cy.js";
import { DE } from "./de.js";
import { EG } from "./eg.js";
import { ES } from "./es.js";
import { FR } from "./fr.js";
import { GB } from "./gb.js";
import { GH } from "./gh.js";
import { ID } from "./id.js";
import { IE } from "./ie.js";
import { IL } from "./il.js";
import { IN } from "./in.js";
import { IT } from "./it.js";
import { JO } from "./jo.js";
import { MA } from "./ma.js";
import { MX } from "./mx.js";
import { MY } from "./my.js";
import { NG } from "./ng.js";
import { NL } from "./nl.js";
import { NZ } from "./nz.js";
import { PE } from "./pe.js";
import { PH } from "./ph.js";
import { PK } from "./pk.js";
import { PT } from "./pt.js";
import { TR } from "./tr.js";
import { US } from "./us.js";
import { ZA } from "./za.js";

import type { MarketTables } from "../tables.js";

export const MARKETS: Record<string, MarketTables> = {
  "ar": AR,
  "at": AT,
  "au": AU,
  "bd": BD,
  "be": BE,
  "br": BR,
  "ca": CA,
  "ch": CH,
  "cl": CL,
  "co": CO,
  "cy": CY,
  "de": DE,
  "eg": EG,
  "es": ES,
  "fr": FR,
  "gb": GB,
  "gh": GH,
  "id": ID,
  "ie": IE,
  "il": IL,
  "in": IN,
  "it": IT,
  "jo": JO,
  "ma": MA,
  "mx": MX,
  "my": MY,
  "ng": NG,
  "nl": NL,
  "nz": NZ,
  "pe": PE,
  "ph": PH,
  "pk": PK,
  "pt": PT,
  "tr": TR,
  "us": US,
  "za": ZA,
};
