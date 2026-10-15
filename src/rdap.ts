// pure parser for rdap registry responses. the network adapter lives
// in scripts/rdap-lookup.mjs; this module turns a recorded or live
// response into an age finding with coverage semantics, and never
// invents a date the registry did not serve.
import type { AgeFinding } from "./schema.js";

export function parseRdapRegistration(
  raw: unknown,
  fetchedAt: string,
): AgeFinding {
  if (raw === null || typeof raw !== "object") {
    return unknown("rdap response was not an object");
  }
  const obj = raw as Record<string, unknown>;
  if (obj.objectClassName === "error") {
    return unknown("rdap bootstrap or registry returned an error object: this lookup served no creation date, which is not evidence of a young domain");
  }
  const events = obj.events;
  if (!Array.isArray(events)) {
    return unknown("no events array in the rdap response");
  }
  for (const e of events) {
    if (
      e &&
      typeof e === "object" &&
      (e as Record<string, unknown>).eventAction === "registration"
    ) {
      const date = (e as Record<string, unknown>).eventDate;
      if (typeof date === "string" && date.length >= 10) {
        return {
          source: "rdap",
          created_on: date,
          fetched_at: fetchedAt,
          coverage: "read",
        };
      }
    }
  }
  return unknown("no registration event in the rdap response");
}

function unknown(note: string): AgeFinding {
  return {
    source: "rdap",
    created_on: null,
    fetched_at: "",
    coverage: "unknown",
    coverage_note: note,
  };
}
