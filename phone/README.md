# phone channel: scam vs spam

- **spam evidence** (robocall bulk): volume patterns, identical
  prerecorded scripts across numbers, telemarketing infrastructure.
  volume claims need call-campaign data; the offline core classifies
  what the number *is*, not how often it rings
- **scam evidence** (deception): wangiri (one-ring call-back fraud,
  premium-rate destination ranges), spoofed caller id including
  neighbor spoofing, impersonation of banks/agencies, disconnected or
  reassigned numbers used as dead-ends
- what this channel inherits from the `thephonetell` branch: the
  numbering-plan tables (range allocations, withdrawn ranges, ngn and
  toll-free shapes), carrier line-type evidence via the veriphone
  adapter, line_existence for disconnected-number tricks (once an hlr
  adapter exists)

honest limits stated up front:

- caller-id spoofing is observed at the receiving switch, not from
  numbering tables: a spoofed claim is adapter evidence or nothing
- premium-rate/wangiri destination ranges are shape facts; whether a
  specific missed call was wangiri is a judgment the evidence
  supports, never asserts
- the phonetell core never guesses a line type from fragments, and
  this channel never guesses intent from a number alone
