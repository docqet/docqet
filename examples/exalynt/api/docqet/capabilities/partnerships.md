---
docqet: capability
id: partnerships
name: Partnerships
description: >-
  Partners Exalynt has enrolled each manage a partnership, and introduce
  people to Exalynt by giving them its referral code or inviting them by
  email.
stability: alpha
within: feature:partner-program
solves:
  - problem:engineering-starts-slowly
  - problem:introductions-take-effort
  - problem:partner-earnings-opaque
  - problem:agreed-terms-applied-by-hand
included-in: [initiative:mvp]
follows:
  - rule:inviting-creates-the-partnership
  - rule:accepting-makes-the-invitee-manager
  - rule:the-manager-names-the-partnership
  - rule:admins-set-terms-at-invitation
  - rule:revoking-removes-the-partnership
  - rule:managers-see-only-their-own-partnership
  - rule:enrolling-is-voluntary
  - rule:a-partnership-stands-apart-from-organizations
  - rule:partnerships-can-change-managers
  - rule:existing-accounts-gain-partner-access
  - rule:partners-invite-clients-by-email
  - rule:invitations-can-be-resent-or-revoked
  - rule:partnership-invitations-are-limited
  - rule:partners-see-only-their-own-invitations
  - rule:one-referral-code-per-partnership
  - rule:the-code-used-decides-the-partnership
  - rule:referral-codes-attribute-only-new-clients
  - rule:one-partnership-per-client
  - rule:no-attribution-to-the-managers-organization
  - rule:admins-can-adjust-attribution
  - rule:no-earnings-on-other-partners
  - rule:referred-clients-work-like-any-other
  - rule:partners-see-only-their-own-clients
  - rule:partners-see-each-clients-earning-window
  - rule:what-partners-can-see
  - rule:clients-see-who-referred-them
  - rule:introductions-dont-affect-engineer-assignment
  - rule:one-account-however-many-hats
  - rule:gaining-a-hat-takes-nothing-away
  - rule:invitations-go-to-an-email-address
  - rule:adding-a-hat-to-an-account
  - rule:invitations-stay-pending-until-resolved
  - rule:who-sees-and-revokes-pending-invitations
uses: [concept:partnership, concept:agreement, concept:capacity-payout-basis]
gaps:
  - id: existing-clients-spotted-by-name-only
    name: Existing clients spotted by name only
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      A company that's already a client can only be spotted by having the
      same name, so one signing up under another name counts as new.
  - id: no-handover-or-new-terms
    name: No handover or new terms for partnerships
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      Nothing hands a partnership to another manager, or sends it new terms.
      That matters once a partnership needs a new manager or new terms.
decisions:
  - topic: Referral codes over time
    question: >-
      Can a partner get a new code, for instance after sharing one too
      widely, and does the old one stop working?
  - topic: Changing terms
    question: >-
      Terms are set when inviting a partnership. Can an admin change them
      afterwards, and if so, does a change reach clients already
      attributed or only those attributed after it?
---

## Includes

- Exalynt enrolls clients, engineers, or established external partners.
- Clients sign up with a partner's referral code or link, and are told when
  signing up that the partner may earn from it.
- Partners accept Exalynt's invitation to the Partnership Program and its
  Partner Agreement in one step, reading the agreement first.
- Partners name the partnership after themselves or the business they partner
  for, and rename it.
- Partners see and copy the partnership's referral code and sign-up link, with a
  reminder to tell the people they share it with that they may earn from it.
- Partners see the partnership's terms: its share, what it's a share of, and how
  long it earns on each client, or that it has no time limit.
- Partners who manage several partnerships switch between them, viewing one at a
  time.
- Admins enroll a partner in the Partnership Program by inviting them by email,
  including someone who already has an account as a client member or engineer,
  and see any partnerships they already manage.
- Admins set a partnership's terms when inviting it, as its Partner Agreement's
  Commercial Terms, the same way as an engineer's: its Referral Share and its
  Earning Window, how long it earns on each client, or no time limit, starting
  from 5% of the engineering capacity referred clients purchase and have
  fulfilled within 12 months. Inviting with no Referral Share, or no terms at
  all, asks the admin to confirm first, since the partnership then earns
  nothing.
- Admins see pending partner invitations, with each one's email address, the
  partnership it's for, and when it was sent, and revoke one.
- Admins see the clients attributed to each partnership, with how each came to
  it and since when.
- Admins attribute a client to a partnership, which moves it from any other, and
  remove a client's attribution.
- Admins see each partnership's terms, and each of its clients' earning windows.
- Admins see what a partnership has earned, in total and on each client, block
  by block, and every payout sent to it.
