Feature: Partnerships
  Exalynt enrolls partners in the Partnership Program by giving each a
  partnership: its own record, separate from any client organization, with a
  name its manager gives it, a referral code, the clients attributed to it,
  and what it earns and is paid. Each partnership has one manager, and a user
  can manage several.
  Clients who sign up with its referral code are attributed to it.

  # docket:verifies rule:partnerships/inviting-creates-the-partnership
  Rule: Exalynt enrolls partners by inviting them, and inviting creates the partnership at once

    Example: An admin invites a partner
      When an admin invites grace@example.com to the Partnership Program
      Then there's a new partnership, not named yet, with a referral code
      And grace@example.com has an invitation to manage it

    Example: Only an admin can invite
      When Theo, who isn't an admin, tries to invite grace@example.com to the Partnership Program
      Then they're refused

  # docket:verifies rule:partnerships/accepting-makes-the-invitee-manager
  Rule: Accepting the invitation makes the invitee the partnership's manager, with the Partner Hub

    Example: Accepting
      Given an admin has invited Grace to the Partnership Program
      When Grace accepts the invitation
      Then Grace manages the partnership
      And Grace has the Partner Hub

    Example: Someone else can't accept it
      Given an admin has invited Grace to the Partnership Program
      When Theo tries to accept Grace's invitation
      Then they're refused
      And the partnership has no manager

    Example: Managing several
      Given Grace manages a partnership
      And an admin has invited Grace to start another
      When Grace accepts the invitation
      Then Grace manages both partnerships

  # docket:verifies rule:partnerships/the-manager-names-the-partnership
  Rule: The manager names the partnership, and can rename it

    Example: Naming it
      Given Grace manages a partnership that isn't named yet
      When Grace names it "Holloway Advisory"
      Then the partnership is named "Holloway Advisory"

    Example: Renaming it
      Given Grace manages a partnership named "Grace Holloway"
      When Grace renames it "Holloway Advisory"
      Then the partnership is named "Holloway Advisory"

  # docket:verifies rule:earnings-and-payouts/partnership-terms-set-at-invitation rule:partnerships/admins-set-terms-at-invitation
  Rule: An admin sets a partnership's terms when inviting it, and its Partner Agreement offers them

    Example: A 7% share for 24 months
      When an admin invites Grace with a Referral Share of 7% and an Earning Window of 24 months
      Then Grace's invitation states a Referral Share of 7% and an Earning Window of 24 months
      And the partnership has a Partner Agreement to accept with those terms

    Example: No time limit
      When an admin invites Grace with a Referral Share of 5% and no Earning Window
      Then the partnership's Partner Agreement has a Referral Share of 5% and no Earning Window

    Example: An Earning Window of no months
      When an admin invites Grace with a Referral Share of 5% and an Earning Window of 0 months
      Then the invitation is refused
      And Grace has no invitation to accept

    Example: No Commercial Terms
      When an admin invites Grace with no Commercial Terms
      Then the partnership has a Partner Agreement to accept with no Commercial Terms

  # docket:verifies rule:partnerships/revoking-removes-the-partnership
  Rule: Revoking a partner's invitation removes the partnership it created

    Example: Revoked before it's accepted
      Given an admin has invited Grace to the Partnership Program
      When an admin revokes the invitation
      Then the partnership is gone
      And Grace has no invitation to accept

  # docket:verifies rule:partnerships/managers-see-only-their-own-partnership
  Rule: A partnership's manager never sees or changes another partnership

    Example: Another manager's partnership
      Given Grace manages "Holloway Advisory" and Theo manages "Fieldwork"
      When Theo looks for "Holloway Advisory"
      Then it isn't found

    Example: Renaming another manager's partnership
      Given Grace manages "Holloway Advisory" and Theo manages "Fieldwork"
      When Theo tries to rename "Holloway Advisory"
      Then it isn't found
      And it's still named "Holloway Advisory"

  # docket:verifies rule:partnerships/partners-invite-clients-by-email
  Rule: A partner can invite someone to become a client

    Example: Inviting
      Given Grace manages a partnership named "Holloway Advisory"
      When Grace invites helen@example.com to become a client
      Then helen@example.com is emailed an invitation from "Holloway Advisory"
      And Grace sees the invitation to helen@example.com as sent

    Example: Inviting the same address twice
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client
      When Grace invites helen@example.com to become a client
      Then it's refused

    Example: An address that isn't one
      Given Grace manages a partnership named "Holloway Advisory"
      When Grace invites "helen at example" to become a client
      Then it's refused

    Example: The same address in other capitals
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client
      When Grace invites Helen@Example.com to become a client
      Then it's refused

    Example: Someone who already has an account
      Given Grace manages a partnership named "Holloway Advisory"
      And Helen has created "Ridgeline" with no code
      When Grace invites helen@example.com to become a client
      Then helen@example.com is emailed an invitation from "Holloway Advisory"
      And Grace sees the invitation to helen@example.com as sent

  # docket:verifies rule:partnerships/invitations-are-limited
  Rule: A partnership can send at most 50 new invitations a day

    Example: One more than that
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited 50 people to become clients today
      When Grace invites helen@example.com to become a client
      Then it's refused
      And helen@example.com isn't emailed

  # docket:verifies rule:partnerships/invitations-can-be-resent-or-revoked
  Rule: A partner can resend or revoke an invitation until the client signs up

    Example: Resending
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client two days ago
      When Grace resends the invitation
      Then helen@example.com is emailed again

    Example: Revoking
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client
      When Grace revokes the invitation
      Then Grace no longer sees the invitation
      And when Helen creates "Ridgeline" with no code, it's attributed to nobody

    Example: After signing up
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client
      And Helen has created "Ridgeline" with no code
      When Grace tries to revoke the invitation
      Then it's refused

    Example: Resending after signing up
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client two days ago
      And Helen has created "Ridgeline" with no code
      When Grace tries to resend the invitation
      Then it's refused

  # docket:verifies rule:partnerships/invitations-are-limited
  Rule: An invitation can be resent at most once a day

    Example: Resending again the same day
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client
      And Grace has resent the invitation
      When Grace resends the invitation
      Then it's refused
      And helen@example.com isn't emailed again

  # docket:verifies rule:partnerships/partners-see-only-their-own-invitations
  Rule: A partner only sees and changes their own partnership's invitations

    Example: Another partner's invitations
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Grace has invited helen@example.com to become a client
      When Theo tries to see Grace's invitations
      Then it isn't found

    Example: Resending another partner's invitation
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Grace has invited helen@example.com to become a client
      When Theo tries to resend Grace's invitation
      Then it isn't found
      And helen@example.com isn't emailed again

    Example: Revoking another partner's invitation
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Grace has invited helen@example.com to become a client
      When Theo tries to revoke Grace's invitation
      Then it isn't found
      And Grace still sees the invitation to helen@example.com

  # docket:verifies rule:partnerships/one-referral-code-per-partnership rule:partnerships/no-attribution-to-the-managers-organization
  Rule: A new client who signs up with a referral code is attributed to its partnership

    Example: With a code
      Given Grace manages a partnership named "Holloway Advisory"
      When Helen creates "Ridgeline" with Grace's code
      Then "Ridgeline" is attributed to "Holloway Advisory"

    Example: Without one
      When Helen creates "Ridgeline" with no code
      Then "Ridgeline" is attributed to nobody

    Example: A code that doesn't exist
      When Helen creates "Ridgeline" with an unknown code
      Then it's refused
      And "Ridgeline" doesn't exist

    Example: A manager's own code
      Given Grace manages a partnership named "Holloway Advisory"
      When Grace creates "Holloway Co" with their own code
      Then it's refused
      And "Holloway Co" doesn't exist

  # docket:verifies rule:partnerships/the-code-used-decides-the-partnership
  Rule: An invited address is attributed by the code it uses, or else by the one partner who invited it

    Example: No code, one invitation
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client
      When Helen creates "Ridgeline" with no code
      Then "Ridgeline" is attributed to "Holloway Advisory"
      And Grace sees the invitation to helen@example.com as signed up

    Example: The code of the partner who invited them
      Given Grace manages a partnership named "Holloway Advisory"
      And Grace has invited helen@example.com to become a client
      When Helen creates "Ridgeline" with Grace's code
      Then "Ridgeline" is attributed to "Holloway Advisory"
      And Grace sees "Ridgeline", that it signed up from their invitation, and since when
      And Grace sees the invitation to helen@example.com as signed up

    Example: Two partners invited, and a code decides
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Grace has invited helen@example.com to become a client
      And Theo has invited helen@example.com to become a client
      When Helen creates "Ridgeline" with Theo's code
      Then "Ridgeline" is attributed to "Fieldwork"
      And Grace sees the invitation to helen@example.com as sent

    Example: Two partners invited, and no code
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Grace has invited helen@example.com to become a client
      And Theo has invited helen@example.com to become a client
      When Helen creates "Ridgeline" with no code
      Then "Ridgeline" is attributed to nobody

  # docket:verifies rule:partnerships/referral-codes-attribute-only-new-clients
  Rule: Referral codes attribute only new clients

    Example: Someone already at a client
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Helen has created "Ridgeline" with Grace's code
      When Helen creates "Ridgeline Two" with Theo's code
      Then it's refused
      And "Ridgeline Two" doesn't exist
      And "Ridgeline" is attributed to "Holloway Advisory"

    Example: A company that's already a client
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Helen has created "Ridgeline" with Grace's code
      When Bob creates "ridgeline" with Theo's code
      Then "ridgeline" is attributed to nobody
      And "Ridgeline" is attributed to "Holloway Advisory"

  # docket:verifies rule:partnerships/partners-see-only-their-own-clients
  Rule: A partner sees the clients attributed to their partnership, and no others

    Example: A client who signed up with the code
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Helen has created "Ridgeline" with Grace's code
      Then Grace sees "Ridgeline" among their clients
      And Theo doesn't see "Ridgeline" among theirs

    Example: Another partner's clients
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Helen has created "Ridgeline" with Grace's code
      When Theo tries to see Grace's clients
      Then it isn't found

  # docket:verifies rule:partnerships/partners-see-each-clients-earning-window
  Rule: A partner sees how long their partnership earns on each client

    Example: Before the client's first block
      Given Grace's partnership earns for 12 months on each client
      And Helen has created "Ridgeline" with Grace's code
      Then Grace sees Ridgeline's earning window opens with its first block

    Example: After the client's first block
      Given Grace's partnership earns for 12 months on each client
      And Helen has created "Ridgeline" with Grace's code
      And Ridgeline bought its first block on 2026-03-02
      Then Grace sees Ridgeline's earning window runs until 2027-03-02

    Example: No time limit
      Given Grace's partnership earns on each client with no time limit
      And Helen has created "Ridgeline" with Grace's code
      And Ridgeline has bought a block
      Then Grace sees Ridgeline's earning window has no end

  # docket:verifies rule:partnerships/admins-can-adjust-attribution
  Rule: Admins can adjust attribution

    Example: Attributing a client who signed up without a code
      Given Grace manages a partnership named "Holloway Advisory"
      And Helen has created "Ridgeline" with no code
      When an admin attributes "Ridgeline" to "Holloway Advisory"
      Then "Ridgeline" is attributed to "Holloway Advisory"

    Example: Moving a client
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Helen has created "Ridgeline" with Grace's code
      When an admin moves "Ridgeline" to "Fieldwork"
      Then "Ridgeline" is attributed to "Fieldwork"
      And Grace doesn't see "Ridgeline" among their clients

    Example: Removing an attribution
      Given Grace manages a partnership named "Holloway Advisory"
      And Helen has created "Ridgeline" with Grace's code
      When an admin removes the attribution
      Then "Ridgeline" is attributed to nobody

    Example: Only an admin can
      Given Grace manages a partnership named "Holloway Advisory"
      And Helen has created "Ridgeline" with no code
      When Grace tries to attribute "Ridgeline" to "Holloway Advisory"
      Then it's refused

  # docket:verifies rule:partnerships/one-partnership-per-client
  Rule: A client has at most one partnership

    Example: Attributing a client that already has one
      Given Grace manages a partnership named "Holloway Advisory"
      And Theo manages a partnership named "Fieldwork"
      And Helen has created "Ridgeline" with Grace's code
      When an admin attributes "Ridgeline" to "Fieldwork"
      Then "Ridgeline" has one partnership, "Fieldwork"

  # docket:verifies rule:partnerships/what-partners-can-see
  Rule: A partner sees a client's name, how it came to them, and since when

    Example: Looking at a client
      Given Grace manages a partnership named "Holloway Advisory"
      And Helen has created "Ridgeline" with Grace's code
      When Grace looks at their clients
      Then Grace sees "Ridgeline", that it signed up with their code, and since when

  # docket:verifies rule:partnerships/clients-see-who-referred-them
  Rule: A client sees the partnership that referred it, and only its name

    Example: A referred client
      Given Grace manages a partnership named "Holloway Advisory"
      And Helen has created "Ridgeline" with Grace's code
      Then Helen sees "Ridgeline" was referred by "Holloway Advisory"

    Example: A client nobody referred
      When Helen creates "Ridgeline" with no code
      Then Helen sees "Ridgeline" was referred by nobody

    Example: Another client's partner
      Given Grace manages a partnership named "Holloway Advisory"
      And Helen has created "Ridgeline" with Grace's code
      And Bob has created "Bobco" with no code
      Then Bob can't see who referred "Ridgeline"
