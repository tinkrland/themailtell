// stage 1: input handling.
// preserves the address. validates syntax with no product-specific acceptance
// rules and never rewrites the local part: no plus-tag stripping, no dot
// removal, no case folding.
//
// domain policy: the domain is lowercased for dns purposes, and a unicode
// domain is converted to its punycode (ascii) form, because dns matching
// and the intelligence lists are ascii-only. this is a deliberate policy
// choice: the domain is normalized (like lowercasing), the local part is
// never rewritten. a domain that cannot be converted is rejected as invalid
// rather than silently mangled. punycode conversion uses node:url's
// domainToASCII (deterministic, offline); a browser build swaps this one
// call for url.domainToASCII, which is the same whatwg algorithm.

export interface InputHandle {
  valid: boolean;
  invalid_reason?: string;
  // verbatim local part, exactly as given
  local_part?: string;
  // lowercased (and punycoded, if the input was unicode) for dns lookups only
  domain?: string;
  // true when a unicode domain was converted to its punycode form
  domain_converted_to_ascii?: boolean;
  syntax_facts: {
    has_plus: boolean;
    has_dot_in_local_part: boolean;
    has_uppercase_in_local_part: boolean;
  };
}

const MAX_ADDRESS = 254;
const MAX_LOCAL = 64;
import { domainToASCII } from "node:url";

const LABEL_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function handleInput(address: string): InputHandle {
  const facts = { has_plus: false, has_dot_in_local_part: false, has_uppercase_in_local_part: false };
  const base: InputHandle = { valid: false, syntax_facts: facts };

  if (typeof address !== "string" || address.length === 0) {
    return { ...base, invalid_reason: "empty input" };
  }
  if (address.length > MAX_ADDRESS) {
    return { ...base, invalid_reason: "address exceeds maximum length" };
  }
  const at = address.lastIndexOf("@");
  if (at <= 0 || at === address.length - 1) {
    return { ...base, invalid_reason: "address is not local@domain" };
  }
  const local = address.slice(0, at);
  const domainRaw = address.slice(at + 1);

  if (local.length > MAX_LOCAL) {
    return { ...base, invalid_reason: "local part exceeds maximum length" };
  }
  // a quoted local part is legal; its contents are not interpreted here
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/i.test(local) && !isQuoted(local)) {
    return { ...base, invalid_reason: "local part contains unsupported characters" };
  }

  let domain = domainRaw.toLowerCase().replace(/\.$/, "");
  let converted = false;
  // dns and the intelligence lists are ascii-only; convert idn to punycode.
  // policy: normalize the domain like lowercasing, never the local part.
  if (/[^a-z0-9.-]/.test(domain)) {
    const ascii = domainToAscii(domain);
    if (!ascii) {
      return { ...base, invalid_reason: "non-ascii domain could not be converted to punycode" };
    }
    domain = ascii;
    converted = true;
  }
  if (domain.includes("..") || domain.startsWith(".") || domain.endsWith(".")) {
    return { ...base, invalid_reason: "domain has empty labels" };
  }
  if (domain.includes("@") || !domain.includes(".")) {
    return { ...base, invalid_reason: "domain is not a valid hostname" };
  }
  const labels = domain.split(".");
  for (const label of labels) {
    if (label.length === 0 || !LABEL_RE.test(label)) {
      return { ...base, invalid_reason: "domain has an invalid label" };
    }
  }

  return {
    valid: true,
    local_part: local,
    domain,
    domain_converted_to_ascii: converted,
    syntax_facts: {
      has_plus: local.includes("+"),
      has_dot_in_local_part: local.includes("."),
      has_uppercase_in_local_part: local.toLowerCase() !== local,
    },
  };
}

function isQuoted(local: string): boolean {
  return local.length >= 2 && local.startsWith('"') && local.endsWith('"');
}

// punycode conversion via the whatwg url algorithm as implemented by
// node:url. deterministic and offline; see the domain policy note above.
function domainToAscii(domain: string): string {
  return domainToASCII(domain) ?? "";
}
