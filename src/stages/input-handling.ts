// stage 1: input handling.
// preserves the address. validates syntax with no product-specific acceptance
// rules and never rewrites the local part: no plus-tag stripping, no dot
// removal, no case folding. the domain is lowercased for dns purposes only.

export interface InputHandle {
  valid: boolean;
  invalid_reason?: string;
  // verbatim local part, exactly as given
  local_part?: string;
  // lowercased for dns lookups only
  domain?: string;
  syntax_facts: {
    has_plus: boolean;
    has_dot_in_local_part: boolean;
    has_uppercase_in_local_part: boolean;
  };
}

const MAX_ADDRESS = 254;
const MAX_LOCAL = 64;
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

  const domain = domainRaw.toLowerCase().replace(/\.$/, "");
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
