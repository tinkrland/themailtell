# apple relay domains

verified: 2026-10-08 (live developer news pages, scraped)

- "new domain for sign in with apple and icloud+ hide my email",
  developer.apple.com/news/?id=sus6t6ab, 2026-06-15.
  apple's june plan: unify siwa and hide my email addresses on
  private.icloud.com. the page now carries a note that it is outdated;
  see the update below.
- "update: new domain for sign in with apple",
  developer.apple.com/news/?id=1ptvdtcm, 2026-08-24.
  final state after user feedback: new siwa addresses move to
  private.icloud.com (rollout "later this year" as of that date); existing
  privaterelay.appleid.com addresses keep working; icloud+ hide my email
  addresses remain on icloud.com.
- "communicating using the private email relay service",
  developer.apple.com/documentation/signinwithapple/communicating-using-the-private-email-relay-service
  — the standing doc for the privaterelay.appleid.com relay.

license/update terms: apple developer documentation, copyright apple inc.
guidance pages, not licensed for copying; facts used (domain names,
announcement dates) are not copyrightable. update terms: dated
announcements stay historically valid but superseded; recheck the
developer news on every table refresh.

what this backs in the code:
- RELAY_DOMAINS: privaterelay.appleid.com (legacy, active) and
  private.icloud.com (new siwa addresses).
- the documented uncovered case: hide my email aliases live at icloud.com,
  shared with real icloud mailboxes, so icloud.com is never classified as
  a relay domain from domain evidence (see readme "limits that matter").
