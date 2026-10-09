// eval/corpus.ts — the evaluation corpus harness.
// the contract wants authorized addresses with known shapes and
// contrasting pairs on the same operator, so success cannot be explained
// by recognizing a brand.
//
// honest limitation: these seed cases were written by the same author as
// the intelligence tables, so they can only prove internal consistency —
// fixtures agree with the tables by construction. the errors that matter
// (a carrier changing its format, a false positive on a real customer
// address) are exactly the ones only authorized real addresses with
// verified shapes can expose. put those in data/authorized-corpus.json
// (gitignored) and the runner merges them automatically.

import type { Evidence } from "../core.js";
import type { ShapeFindings } from "../schema.js";

export interface Expectation {
  // signals that must be present at recognized strength
  expect_signals?: string[];
  // signals that must be present at any strength
  expect_signals_any_strength?: string[];
  // signals that must NOT be present at any strength
  forbid_signals?: string[];
  // the required aggregate state
  expect_state?: string;
  // required shape findings, per class
  expect_shape_findings?: Partial<ShapeFindings>;
  // limitations that must be mentioned (substring match)
  expect_limitation?: string;
}

export interface CorpusCase {
  id: string;
  // the known ground-truth shape, written before running anything
  shape: string;
  // the scope the evidence should be resolvable at
  scope: "address" | "carrier" | "market";
  evidence: Evidence;
  expectations: Expectation;
  // when set, the case is additionally evaluated this many days past the
  // table date with default staleness, and must degrade honestly
  staleAfterDays?: number;
  // expectations for the stale re-evaluation (required when staleAfterDays
  // is set): the degraded result, not the fresh one
  stale_expectations?: Expectation;
}

const T0 = "2026-10-08T00:00:00Z";

function ev(
  market: string,
  lines: string[],
  extra: Partial<Evidence["address"]> = {}
): Evidence {
  return {
    address: { market, lines, ...extra },
    observed_at: T0,
  };
}

export const CORPUS: CorpusCase[] = [
  {
    id: "us-po-box",
    shape: "usps po box",
    scope: "address",
    evidence: ev("us", ["PO Box 12345"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_state: "signals_present",
      expect_shape_findings: {
        po_box_equivalent: "evidence_found",
        parcel_locker_or_pickup_point: "no_evidence_found",
        format_validity: "valid",
      },
    },
  },
  {
    id: "us-street-same-operator",
    // contrast pair with us-po-box: the same us market and zip, a genuine
    // street delivery address; success cannot come from the zip alone
    shape: "us street address",
    scope: "address",
    evidence: ev("us", ["1600 Example Parkway"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      forbid_signals: ["po_box_equivalent", "parcel_locker_or_pickup_point", "cmra_or_virtual_mailbox"],
      // no shape evidence found is a statement about the search, not a
      // street-address verdict: the state stays unknown and the limitation
      // says so
      expect_state: "unknown",
      expect_shape_findings: {
        po_box_equivalent: "no_evidence_found",
        parcel_locker_or_pickup_point: "no_evidence_found",
        cmra_or_virtual_mailbox: "no_evidence_found",
        format_validity: "valid",
      },
      expect_limitation: "not a verification of a street address",
    },
  },
  {
    id: "us-pbsa-style-vs-genuine-street",
    // contrast pair: a pbsa-style secondary unit and a genuine street
    // address produce the same local result, and that honesty is asserted
    shape: "street-style secondary unit, indistinguishable from pbsa",
    scope: "address",
    evidence: ev("us", ["123 Main St", "#45678-9012"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      forbid_signals: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "no_evidence_found" },
      expect_limitation: "po box street addressing",
    },
  },
  {
    id: "de-postfach",
    shape: "de postfach",
    scope: "address",
    evidence: ev("de", ["Postfach 12 34 56"], { city: "Bonn", postal_code: "53000" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "de-packstation-with-postnummer",
    shape: "dhl packstation, street field literal packstation, postnummer in company field",
    scope: "carrier",
    evidence: ev("de", ["Packstation 123"], { company: "987654321", city: "Berlin", postal_code: "10115" }),
    expectations: {
      expect_signals_any_strength: ["parcel_locker_or_pickup_point"],
      forbid_signals: ["po_box_equivalent"],
      expect_shape_findings: {
        parcel_locker_or_pickup_point: "evidence_found",
        po_box_equivalent: "no_evidence_found",
      },
      expect_limitation: "postnummer",
    },
  },
  {
    id: "de-street-near-locker",
    // contrast pair with de-packstation: a street near a packstation,
    // nothing locker-shaped in the text
    shape: "de street address near a locker",
    scope: "address",
    evidence: ev("de", ["Musterstraße 1"], { city: "Berlin", postal_code: "10115" }),
    expectations: {
      forbid_signals: ["parcel_locker_or_pickup_point", "po_box_equivalent"],
      expect_shape_findings: { parcel_locker_or_pickup_point: "no_evidence_found" },
    },
  },
  {
    id: "au-locked-bag",
    shape: "au locked bag",
    scope: "address",
    evidence: ev("au", ["Locked Bag 1234"], { city: "Sydney", region: "NSW", postal_code: "2000" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "au-parcel-locker",
    shape: "australia post parcel locker, street-style era format",
    scope: "carrier",
    evidence: ev("au", ["Parcel Locker 12345", "1 Example Street"], { city: "Sydney", region: "NSW", postal_code: "2000" }),
    expectations: {
      expect_signals_any_strength: ["parcel_locker_or_pickup_point"],
      expect_shape_findings: { parcel_locker_or_pickup_point: "evidence_found" },
      expect_limitation: "formats change on the carrier's schedule",
    },
  },
  {
    id: "ca-flexdelivery",
    shape: "canada post flexdelivery, a free staffed po box",
    scope: "carrier",
    evidence: ev("ca", ["FlexDelivery 123456"], { city: "Toronto", region: "ON", postal_code: "M5V 2T6" }),
    expectations: {
      // flexdelivery is both a pickup point and a po box shape; the linked
      // pair shares one source and is one finding, not a mix
      expect_signals_any_strength: ["parcel_locker_or_pickup_point", "po_box_equivalent"],
      expect_state: "signals_present",
      expect_shape_findings: {
        parcel_locker_or_pickup_point: "evidence_found",
        po_box_equivalent: "evidence_found",
      },
    },
  },
  {
    id: "fr-bp",
    shape: "fr boîte postale",
    scope: "address",
    evidence: ev("fr", ["BP 40200"], { city: "Paris", postal_code: "75001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "fr-boite-postale-diacritics",
    shape: "fr boîte postale typed with its accent",
    scope: "address",
    evidence: ev("fr", ["Boîte postale 12"], { city: "Paris", postal_code: "75001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "fr-cedex",
    shape: "fr cedex special distribution scheme",
    scope: "address",
    evidence: ev("fr", ["1 Rue Exemple", "CEDEX 123"], { city: "Lyon", postal_code: "69001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "fr-cedex-as-city",
    shape: "fr cedex written on the city line, where french addressing puts it",
    scope: "address",
    evidence: ev("fr", ["1 Rue Exemple"], { city: "Paris Cedex 07", postal_code: "75007" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "fr-street-plain-city",
    shape: "fr genuine street address with a plain city line, the contrast pair for cedex",
    scope: "address",
    evidence: ev("fr", ["1 Rue Exemple"], { city: "Paris", postal_code: "75007" }),
    expectations: {
      forbid_signals: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "no_evidence_found" },
    },
  },
  {
    id: "us-po-box-as-city",
    shape: "us po box written in the city field by a checkout that maps it wrong",
    scope: "address",
    evidence: ev("us", ["123 Main St"], { city: "PO Box 123", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "ch-case-postale-as-city",
    shape: "ch case postale written on the city line",
    scope: "address",
    evidence: ev("ch", ["Musterstrasse 1"], { city: "Case postale 123", postal_code: "8000" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "ch-street-plain-city",
    shape: "ch genuine street address with a plain city line, the contrast pair for case postale",
    scope: "address",
    evidence: ev("ch", ["Musterstrasse 1"], { city: "Zürich", postal_code: "8000" }),
    expectations: {
      forbid_signals: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "no_evidence_found" },
    },
  },
  {
    id: "gb-forward2me-c-o",
    shape: "gb parcel forwarder, brand in a c/o line, the reshipping shape class",
    scope: "address",
    evidence: ev("gb", ["c/o Forward2me Ltd", "York House, Green Lane West"], {
      city: "Preston",
      postal_code: "PR3 1NJ",
    }),
    expectations: {
      expect_signals: ["mail_forwarding_or_reshipping"],
      expect_state: "signals_present",
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
      forbid_signals: ["cmra_or_virtual_mailbox"],
    },
  },
  {
    id: "gb-myukmailbox-unbranded-suite",
    shape: "gb forwarder facility with no brand token, an unbranded suite at the known facility street",
    scope: "address",
    evidence: ev("gb", ["Unit F, Winston Business Park Churchill Way", "Suite 543"], {
      city: "Sheffield",
      postal_code: "S35 2PS",
    }),
    expectations: {
      expect_signals: ["mail_forwarding_or_reshipping"],
      expect_state: "signals_present",
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "gb-sheffield-clean-street",
    shape: "gb ordinary street a few doors from the forwarder facility, the contrast pair",
    scope: "address",
    evidence: ev("gb", ["Winston Business Park Churchill Way 12"], {
      city: "Sheffield",
      postal_code: "S35 2PR",
    }),
    expectations: {
      forbid_signals: ["mail_forwarding_or_reshipping", "cmra_or_virtual_mailbox"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "no_evidence_found" },
      expect_limitation: "never evidence of a private residence",
    },
  },
  {
    id: "fr-colisexpat-cxp",
    shape: "fr reshipper, the cxp recipient reference token in the address",
    scope: "address",
    evidence: ev("fr", ["CXP0021632", "110bis, Avenue du Général Leclerc"], {
      city: "Pantin",
      postal_code: "93500",
    }),
    expectations: {
      expect_signals: ["mail_forwarding_or_reshipping"],
      expect_state: "signals_present",
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "de-mygermany-facility",
    shape: "de reshipper facility street with the c/o brand form, forward2me gmbh c/o mygermany",
    scope: "address",
    evidence: ev("de", ["Forward2me GmbH c/o myGermany", "Schwedter Allee 23D"], {
      city: "Schwedt",
      postal_code: "16303",
    }),
    expectations: {
      expect_signals_any_strength: ["mail_forwarding_or_reshipping"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "us-plain-suite-not-forwarder",
    shape: "us ordinary suite address in a market with a forwarder row, the cmra contrast for the new class",
    scope: "address",
    evidence: ev("us", ["123 Main St", "Ste 7"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      forbid_signals: ["mail_forwarding_or_reshipping"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "no_evidence_found" },
    },
  },
  {
    id: "us-myus-suite-at-facility",
    shape: "us forwarder, unbranded suite at the known myus facility street",
    scope: "address",
    evidence: ev("us", ["4299 Express Lane", "Suite 1189"], { city: "Sarasota", region: "FL", postal_code: "34249" }),
    expectations: {
      expect_signals: ["mail_forwarding_or_reshipping"],
      expect_state: "signals_present",
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "us-planet-express-suite-at-facility",
    shape: "us forwarder, the verbatim planet express customer form, suite #b1234 at the facility street",
    scope: "address",
    evidence: ev("us", ["17224 S. Figueroa Street", "Suite #B1234"], { city: "Gardena", region: "CA", postal_code: "90248" }),
    expectations: {
      expect_signals: ["mail_forwarding_or_reshipping"],
      expect_state: "signals_present",
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "us-stackry-unit-at-facility",
    shape: "us forwarder, unbranded locker/unit number in line 2 at the known stackry facility street",
    scope: "address",
    evidence: ev("us", ["472 Amherst St", "Unit 12345678"], { city: "Nashua", region: "NH", postal_code: "03063" }),
    expectations: {
      expect_signals: ["mail_forwarding_or_reshipping"],
      expect_state: "signals_present",
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "us-sarasota-clean-street",
    shape: "us ordinary street on the same block as the myus facility, the near-facility contrast pair",
    scope: "address",
    evidence: ev("us", ["4297 Express Lane"], { city: "Sarasota", region: "FL", postal_code: "34249" }),
    expectations: {
      forbid_signals: ["mail_forwarding_or_reshipping"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "no_evidence_found" },
      expect_limitation: "never evidence of a private residence",
    },
  },
  {
    id: "us-facility-wrong-postal-code",
    shape: "us same street text but a different postal code, the postal-code contrast for facility matching",
    scope: "address",
    evidence: ev("us", ["4299 Express Lane", "Suite 1189"], { city: "Sarasota", region: "FL", postal_code: "34231" }),
    expectations: {
      forbid_signals: ["mail_forwarding_or_reshipping"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "no_evidence_found" },
    },
  },
  {
    id: "us-davinci-bayonne-unbranded-suite",
    shape: "us virtual office, no brand token, an unbranded suite at the known davinci bayonne facility",
    scope: "address",
    evidence: ev("us", ["418 Broadway", "Suite 210"], { city: "Bayonne", region: "NJ", postal_code: "07002" }),
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_state: "signals_present",
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
      forbid_signals: ["mail_forwarding_or_reshipping"],
    },
  },
  {
    id: "us-davinci-bayonne-other-suite",
    shape: "us same facility street with a different suite number, still the provider's space",
    scope: "address",
    evidence: ev("us", ["418 Broadway, Suite 305"], { city: "Bayonne", region: "NJ", postal_code: "07002" }),
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
    },
  },
  {
    id: "us-anytime-carson-city-suite",
    shape: "us virtual mailbox network location, unbranded # designator at the known anytime mailbox carson city facility",
    scope: "address",
    evidence: ev("us", ["3827 S Carson St", "#112"], { city: "Carson City", region: "NV", postal_code: "89701" }),
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_state: "signals_present",
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
    },
  },
  {
    id: "us-carson-city-nearby-street-number",
    shape: "us address one number away from the anytime mailbox facility, the near-facility contrast pair",
    scope: "address",
    evidence: ev("us", ["3829 S Carson St"], { city: "Carson City", region: "NV", postal_code: "89701" }),
    expectations: {
      forbid_signals: ["cmra_or_virtual_mailbox", "mail_forwarding_or_reshipping"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "no_evidence_found" },
      expect_limitation: "never evidence of a private residence",
    },
  },
  {
    id: "us-usglobalmail-suite-at-facility",
    shape: "us virtual mailbox, unbranded suite at the known us global mail houston facility",
    scope: "address",
    evidence: ev("us", ["1321 Upland Drive", "Suite 4012"], { city: "Houston", region: "TX", postal_code: "77043" }),
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_state: "signals_present",
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
    },
  },
  {
    id: "us-postscan-suite-at-facility",
    shape: "us virtual mailbox, the verbatim postscan phoenix form with the customer mailbox appended",
    scope: "address",
    evidence: ev("us", ["2345 E Thomas Rd Ste 100", "# 242"], { city: "Phoenix", region: "AZ", postal_code: "85016" }),
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_state: "signals_present",
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
    },
  },
  {
    id: "us-houston-nearby-street-number",
    shape: "us address one number away from the us global mail facility, the near-facility contrast pair",
    scope: "address",
    evidence: ev("us", ["1323 Upland Drive"], { city: "Houston", region: "TX", postal_code: "77043" }),
    expectations: {
      forbid_signals: ["cmra_or_virtual_mailbox", "mail_forwarding_or_reshipping"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "no_evidence_found" },
      expect_limitation: "never evidence of a private residence",
    },
  },
  {
    id: "us-dakota-apt-f-disconfirmed",
    shape: "us the apartment-f case, live-recorded: a real building with a valid unit (apt 7) and a given unit f; smarty dpv returns match code S, footnote C1, secondary invalid",
    scope: "address",
    evidence: {
      address: { market: "us", lines: ["1 W 72nd St", "Apt F"], city: "New York", region: "NY", postal_code: "10023" },
      observed_at: T0,
      adapter_signals: [
        {
          name: "delivery_point_validation",
          scope: "address",
          source: "recorded live response: smarty us street address api, lookup 2026-10-08 (data/recorded/smarty-1-w-72nd-st-apt-f.json)",
          observed_at: "2026-10-08T15:52:55.697Z",
          strength: "recognized",
          coverage: "full",
          existence: "disconfirmed",
          detail: "smarty dpv confirmed the primary but reports the given secondary is invalid (footnote C1): the address as given does not exist (dpv_match_code S, dpv footnotes AAC1)",
        },
      ],
    },
    expectations: {
      expect_signals_any_strength: ["delivery_point_validation"],
      expect_state: "signals_present",
      expect_shape_findings: { address_existence: "disconfirmed", cmra_or_virtual_mailbox: "no_evidence_found" },
    },
  },
  {
    id: "us-dakota-apt-7-confirmed",
    shape: "us a real unit on the same building, live-recorded: smarty dpv match code Y, the address as given is a confirmed delivery point",
    scope: "address",
    evidence: {
      address: { market: "us", lines: ["1 W 72nd St", "Apt 7"], city: "New York", region: "NY", postal_code: "10023" },
      observed_at: T0,
      adapter_signals: [
        {
          name: "delivery_point_validation",
          scope: "address",
          source: "recorded live response: smarty us street address api, lookup 2026-10-08 (data/recorded/smarty-1-w-72nd-st-apt-7.json)",
          observed_at: "2026-10-08T15:52:55.514Z",
          strength: "recognized",
          coverage: "full",
          existence: "confirmed_exists",
          detail: "smarty dpv confirmed the address as given (dpv_match_code Y, dpv footnotes AABB)",
        },
      ],
    },
    expectations: {
      expect_state: "signals_present",
      expect_shape_findings: { address_existence: "confirmed_exists" },
    },
  },
  {
    id: "us-dakota-missing-unit-unknown",
    shape: "us the same building with no unit given, live-recorded: dpv match code D, footnote N1, highrise missing secondary; the finding must stay unknown, neither confirmed nor disconfirmed",
    scope: "address",
    evidence: {
      address: { market: "us", lines: ["1 W 72nd St"], city: "New York", region: "NY", postal_code: "10023" },
      observed_at: T0,
      adapter_signals: [
        {
          name: "delivery_point_validation",
          scope: "address",
          source: "recorded live response: smarty us street address api, lookup 2026-10-08 (data/recorded/smarty-1-w-72nd-st.json)",
          observed_at: "2026-10-08T15:52:55.343Z",
          strength: "recognized",
          coverage: "full",
          detail: "smarty dpv confirmed the primary only; the secondary was missing or not confirmed, so the delivery point for the address as given is unknown, not confirmed and not disconfirmed (dpv_match_code D, dpv footnotes AAN1)",
        },
      ],
    },
    expectations: {
      expect_state: "signals_present",
      expect_shape_findings: { address_existence: "unknown" },
    },
  },
  {
    id: "us-bogus-street-disconfirmed",
    shape: "us a street number that does not exist on a real street, live-recorded: smarty returns no candidates at all",
    scope: "address",
    evidence: {
      address: { market: "us", lines: ["9999 W 80th St"], city: "New York", region: "NY", postal_code: "10024" },
      observed_at: T0,
      adapter_signals: [
        {
          name: "delivery_point_validation",
          scope: "address",
          source: "recorded live response: smarty us street address api, lookup 2026-10-08 (data/recorded/smarty-9999-w-80th-st.json)",
          observed_at: "2026-10-08T15:52:50.664Z",
          strength: "recognized",
          coverage: "full",
          existence: "disconfirmed",
          detail: "smarty returned no candidates for the address as given (dpv could not confirm it)",
        },
      ],
    },
    expectations: {
      expect_state: "signals_present",
      expect_shape_findings: { address_existence: "disconfirmed" },
    },
  },
  {
    id: "us-existence-evidence-stale",
    shape: "us a recorded confirmation, observation re-dated far past the staleness horizon: the finding must decay to unknown",
    scope: "address",
    evidence: {
      address: { market: "us", lines: ["1 W 72nd St", "Apt 7"], city: "New York", region: "NY", postal_code: "10023" },
      observed_at: T0,
      adapter_signals: [
        {
          name: "delivery_point_validation",
          scope: "address",
          source: "recorded live response: smarty us street address api, lookup 2026-10-08 (data/recorded/smarty-1-w-72nd-st-apt-7.json), observation re-dated for the staleness fixture",
          observed_at: "2026-01-01T00:00:00Z",
          strength: "recognized",
          coverage: "full",
          existence: "confirmed_exists",
          detail: "a validation confirmation old enough to be stale intelligence",
        },
      ],
    },
    expectations: {
      expect_shape_findings: { address_existence: "unknown" },
      expect_limitation: "stale intelligence",
    },
  },
  {
    id: "us-myus-facility-suite-unbranded",
    // stage 4b: the address is the published myus facility, suite only,
    // no brand token anywhere: the facility table catches it
    shape: "unbranded suite at the myus sarasota facility",
    scope: "address",
    evidence: ev("us", ["4299 Express Lane", "Suite 212"], { city: "Sarasota", region: "FL", postal_code: "34249" }),
    expectations: {
      expect_signals_any_strength: ["mail_forwarding_or_reshipping"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "us-planet-express-facility-suite",
    // stage 4b, the provider's own published format verbatim:
    // street, suite inline, no c/o token
    shape: "planet express gardena facility, published suite format",
    scope: "address",
    evidence: ev("us", ["17224 S. Figueroa Street, Suite #B1234"], { city: "Gardena", region: "CA", postal_code: "90248" }),
    expectations: {
      expect_signals_any_strength: ["mail_forwarding_or_reshipping"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "evidence_found" },
    },
  },
  {
    id: "us-facility-street-wrong-postal",
    // contrast pair with the two above: the facility street but a
    // postal code the provider does not publish: no match, and the
    // enumerated-snapshot limitation explains why absence is never
    // evidence of a private residence
    shape: "facility street with a postal mismatch, no facility claim",
    scope: "address",
    evidence: ev("us", ["4299 Express Lane", "Suite 212"], { city: "Sarasota", region: "FL", postal_code: "34238" }),
    expectations: {
      forbid_signals: ["mail_forwarding_or_reshipping"],
      expect_shape_findings: { mail_forwarding_or_reshipping: "no_evidence_found" },
      expect_limitation: "enumerated snapshot",
    },
  },
  {
    id: "us-pmb-marker",
    shape: "us cmra private mailbox disclosure, the legally mandated pmb token",
    scope: "address",
    evidence: ev("us", ["123 Main St", "PMB 7"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
    },
  },
  {
    id: "us-pmb-dot-form",
    shape: "us cmra disclosure written P.M.B. 7, the dotted form of the same token",
    scope: "address",
    evidence: ev("us", ["123 Main St P.M.B. 7"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
    },
  },
  {
    id: "us-plain-suite",
    shape: "us ordinary suite address, the contrast pair for the pmb marker",
    scope: "address",
    evidence: ev("us", ["123 Main St", "Ste 7"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      forbid_signals: ["cmra_or_virtual_mailbox"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "no_evidence_found" },
    },
  },
  {
    id: "us-pob-not-a-usps-standard",
    shape:
      "us pob abbreviation, not a usps standard (pub28 281/283, dmm 602 all standardize PO BOX): " +
      "the address stays unmatched rather than guessed from an unverified abbreviation",
    scope: "address",
    evidence: ev("us", ["POB 55"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      forbid_signals: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "no_evidence_found" },
    },
  },
  {
    id: "it-cp",
    shape: "it casella postale",
    scope: "address",
    evidence: ev("it", ["C.P. 12345"], { city: "Roma", postal_code: "00100" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "nl-postbus",
    shape: "nl postbus",
    scope: "address",
    evidence: ev("nl", ["Postbus 123"], { city: "Amsterdam", postal_code: "1234 AB" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "es-apartado",
    shape: "es apartado de correos",
    scope: "address",
    evidence: ev("es", ["Apartado de correos 1234"], { city: "Madrid", postal_code: "28001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "be-postbus-multilingual",
    shape: "be postbus, dutch-language label",
    scope: "address",
    evidence: ev("be", ["Postbus 45"], { city: "Brussel", postal_code: "1000" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "ch-case-postale-multilingual",
    shape: "ch case postale, french-language label in a multilingual market",
    scope: "address",
    evidence: ev("ch", ["Case postale 123"], { city: "Genève", postal_code: "1200" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "dk-postboks",
    shape: "dk postboks",
    scope: "address",
    evidence: ev("dk", ["Postboks 123"], { city: "København", postal_code: "1000" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "se-box",
    shape: "se box (boxadress)",
    scope: "address",
    evidence: ev("se", ["Box 1234"], { city: "Stockholm", postal_code: "111 22" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "gb-bfpo",
    shape: "gb bfpo forces post",
    scope: "address",
    evidence: ev("gb", ["BFPO 123"], { city: "London", postal_code: "BFPO 123" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "nz-private-bag",
    shape: "nz private bag",
    scope: "address",
    evidence: ev("nz", ["Private Bag 12345"], { city: "Wellington", postal_code: "6011" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
  },
  {
    id: "us-ups-store-cmra",
    shape: "the ups store, a us cmra chain that puts its brand in the lines",
    scope: "address",
    evidence: ev("us", ["The UPS Store #123"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_signals_any_strength: ["cmra_or_virtual_mailbox"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
    },
  },
  {
    id: "us-virtual-mailbox-undetectable",
    shape: "a virtual mailbox provider's street-style suite address; no local token exists",
    scope: "address",
    evidence: ev("us", ["123 Main St", "Suite 100"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      forbid_signals: ["cmra_or_virtual_mailbox"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "no_evidence_found" },
      expect_limitation: "no local token exists",
    },
  },
  {
    id: "format-missing-postal-code",
    shape: "us street address missing its postal code",
    scope: "market",
    evidence: ev("us", ["123 Main St"], { city: "Anytown", region: "NY" }),
    expectations: {
      expect_signals_any_strength: ["format_issue"],
      expect_shape_findings: { format_validity: "issues_found" },
    },
  },
  {
    id: "format-missing-street",
    shape: "address with no street line at all",
    scope: "market",
    evidence: ev("gb", [], { city: "London", postal_code: "SW1A 1AA" }),
    expectations: {
      expect_signals_any_strength: ["format_issue"],
      expect_shape_findings: { format_validity: "issues_found" },
    },
  },
  {
    id: "format-malformed-postal-code",
    shape: "gb address with a malformed postcode",
    scope: "market",
    evidence: ev("gb", ["1 Example Road"], { city: "London", postal_code: "12345" }),
    expectations: {
      expect_signals_any_strength: ["format_issue"],
      expect_shape_findings: { format_validity: "issues_found" },
    },
  },
  {
    id: "unknown-market",
    shape: "a market with no seeded tables",
    scope: "market",
    evidence: ev("jp", ["1-2-3 Shibuya"], { city: "Tokyo", postal_code: "150-0002" }),
    expectations: {
      expect_state: "unknown",
      expect_shape_findings: {
        po_box_equivalent: "unknown",
        parcel_locker_or_pickup_point: "unknown",
        cmra_or_virtual_mailbox: "unknown",
        mail_forwarding_or_reshipping: "unknown",
        format_validity: "unknown",
      },
      expect_limitation: "no local tables",
    },
  },
  {
    id: "mixed-evidence",
    shape: "a po box written at a cmra chain: two shape classes, two sources",
    scope: "address",
    evidence: ev("us", ["The UPS Store", "PO Box 123"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent", "cmra_or_virtual_mailbox"],
      expect_state: "mixed_evidence",
      expect_shape_findings: {
        po_box_equivalent: "evidence_found",
        cmra_or_virtual_mailbox: "evidence_found",
      },
    },
  },
  {
    id: "contradictory-adapter",
    shape: "po box evidence contradicted by a carrier-confirmed street delivery point",
    scope: "address",
    evidence: {
      address: { market: "us", lines: ["PO Box 12345"], city: "Anytown", region: "NY", postal_code: "10001" },
      adapter_signals: [
        {
          name: "street_delivery_point_confirmed",
          scope: "address",
          source: "adapter:example-dpv/1.0",
          observed_at: T0,
          strength: "recognized",
          coverage: "full",
          detail: "dpv confirmed a street delivery point for this address",
        },
      ],
      observed_at: T0,
    },
    expectations: {
      expect_state: "contradictory",
      expect_limitation: "neither wins",
    },
  },
  {
    id: "adapter-cmra-indicator",
    shape: "a cmra flag from a carrier validation adapter, coverage full",
    scope: "address",
    evidence: {
      address: { market: "us", lines: ["123 Main St", "Suite 100"], city: "Anytown", region: "NY", postal_code: "10001" },
      adapter_signals: [
        {
          name: "cmra_or_virtual_mailbox",
          scope: "address",
          source: "adapter:example-dpv/1.0",
          observed_at: T0,
          strength: "recognized",
          coverage: "full",
          detail: "dpv cmra indicator: this delivery point is a commercial mail receiving agency",
        },
      ],
      observed_at: T0,
    },
    expectations: {
      expect_signals: ["cmra_or_virtual_mailbox"],
      expect_shape_findings: { cmra_or_virtual_mailbox: "evidence_found" },
      // the adapter check ran, so the honest limitation about coverage none
      // must not claim no external check ran
      // (the clean-result limitation only appears when nothing was found)
    },
  },
  {
    id: "adapter-unevaluated-is-coverage-none",
    shape: "no adapter ran; local signals keep coverage none and the limitation says so",
    scope: "address",
    evidence: ev("us", ["PO Box 12345"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_state: "signals_present",
      expect_limitation: "no carrier validation adapter ran",
    },
  },
  {
    id: "stale-table",
    shape: "unmaintained tables stop producing claims on their own",
    scope: "address",
    evidence: ev("us", ["PO Box 12345"], { city: "Anytown", region: "NY", postal_code: "10001" }),
    expectations: {
      expect_signals_any_strength: ["po_box_equivalent"],
      expect_shape_findings: { po_box_equivalent: "evidence_found" },
    },
    // the same case re-evaluated 180 days later with default 90-day
    // staleness: every local signal must downgrade and the finding
    // becomes unknown, never silently trusted
    staleAfterDays: 90,
    stale_expectations: {
      expect_state: "unknown",
      expect_shape_findings: { po_box_equivalent: "unknown" },
      expect_limitation: "stale intelligence",
    },
  },
];
