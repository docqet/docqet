Feature: Agreements
  A client organization works with Exalynt under its Client Agreement, an
  engineer under their Engineer Agreement, and a partnership under its Partner
  Agreement, whose Commercial Terms an admin sets.

  # docket:verifies rule:agreements/engineer-agreement-follows-the-invitations-terms
  Rule: An engineer is offered the Engineer Agreement on the terms their invitation set

    Example: Invited with an Engineer Share of 62%
      Given an admin has invited Theo to the console with an Engineer Share of 62%
      When Theo accepts the invitation
      Then Theo has an Engineer Agreement to accept, with an Engineer Share of 62%
      And Theo has no Engineer Agreement in effect

  # docket:verifies rule:agreements/an-engineer-agreement-can-have-no-commercial-terms
  Rule: An admin can send an Engineer Agreement with no Commercial Terms

    Example: Invited with no Commercial Terms
      Given an admin has invited Theo to the console with no Commercial Terms
      When Theo accepts the invitation
      Then Theo has an Engineer Agreement to accept, with no Commercial Terms

    Example: Sent with no Commercial Terms
      When an admin sends Theo one with no Commercial Terms
      Then Theo has an Engineer Agreement to accept, with no Commercial Terms

  # docket:verifies rule:agreements/acceptance-puts-an-agreement-in-effect
  Rule: An agreement is in effect only once accepted, and the latest accepted supersedes any before it

    Example: Accepting the one offered
      Given Theo has an Engineer Agreement to accept
      When Theo accepts it
      Then it's Theo's Engineer Agreement in effect

  # docket:verifies rule:agreements/new-terms-wait-for-acceptance
  Rule: New terms hold only once accepted; until then the agreement in effect keeps its own

    Example: Sent, not yet accepted
      Given Theo's Engineer Agreement in effect has an Engineer Share of 60%
      When an admin sends Theo one with an Engineer Share of 65%
      Then Theo's Engineer Agreement in effect still has an Engineer Share of 60%

    Example: Accepted
      Given an admin has sent Theo one with an Engineer Share of 65%
      When Theo accepts it
      Then Theo's Engineer Agreement in effect has an Engineer Share of 65%

  # docket:verifies rule:agreements/a-newer-agreement-replaces-one-waiting
  Rule: A newer agreement replaces one still waiting

    Example: Sent twice before accepting
      Given an admin has sent Theo one with an Engineer Share of 62%
      When an admin sends Theo one with an Engineer Share of 65%
      Then Theo has one Engineer Agreement to accept, with an Engineer Share of 65%

  # docket:verifies rule:agreements/only-the-waiting-agreement-is-accepted-once
  Rule: Only the waiting agreement can be accepted, and only once

    Example: Accepting one that was replaced
      Given an admin has sent Theo one with an Engineer Share of 62%
      And an admin has since sent Theo one with an Engineer Share of 65%
      When Theo tries to accept the one with 62%
      Then they're refused
      And Theo has no Engineer Agreement in effect

    Example: Accepting twice
      Given Theo has accepted an Engineer Agreement
      When Theo tries to accept it again
      Then they're refused
      And it's still Theo's Engineer Agreement in effect

    Example: An organization's Client Agreement accepted twice
      Given an Admin of Acme has accepted its Client Agreement
      When an Admin of Acme tries to accept it again
      Then they're refused
      And it's still Acme's Client Agreement in effect

    Example: A partnership's Partner Agreement accepted twice
      Given Grace has accepted the Partner Agreement of the partnership they manage
      When Grace tries to accept it again
      Then they're refused
      And it's still the partnership's Partner Agreement in effect

  # docket:verifies rule:agreements/accepted-agreements-never-change
  Rule: Accepted agreements never change

    Example: The engineer's name changes after accepting
      Given Theo has accepted an Engineer Agreement
      When Theo changes their name to Theodore
      Then Theo's accepted Engineer Agreement still names Theo

    Example: The organization is renamed after accepting
      Given Acme has accepted its Client Agreement
      When Acme is renamed to Acme Labs
      Then Acme's accepted Client Agreement still names Acme

  # docket:verifies rule:agreements/accepted-agreements-outlive-their-partys-account
  Rule: An accepted agreement outlives its party's account

    Example: An engineer's account is deleted
      Given Theo has accepted an Engineer Agreement
      When Theo's account is deleted
      Then the Engineer Agreement Theo accepted is still kept, naming Theo

  # docket:verifies rule:agreements/agreements-stay-private
  Rule: Agreements stay private

    Example: An engineer sees only their own
      Given Theo and Maya each have an Engineer Agreement to accept
      When Theo looks at their agreements
      Then Theo sees only their own

    Example: An engineer can't accept someone else's
      Given Maya has an Engineer Agreement to accept
      When Theo tries to accept it
      Then they're refused
      And Maya's is still waiting to be accepted

    Example: Another organization can't see an organization's agreements
      Given Acme has a Client Agreement to accept
      When an Admin of Globex tries to look at Acme's agreements
      Then they're refused

    Example: Another organization can't accept an organization's Client Agreement
      Given Acme has a Client Agreement to accept
      When an Admin of Globex tries to accept it
      Then they're refused
      And Acme's is still waiting to be accepted

    Example: Another partner can't see a partnership's agreements
      Given Grace manages a partnership with a Partner Agreement to accept
      And Theo manages another partnership
      When Theo tries to look at the agreements of Grace's partnership
      Then they're refused

    Example: Another partner can't accept a partnership's Partner Agreement
      Given Grace manages a partnership with a Partner Agreement to accept
      And Theo manages another partnership
      When Theo tries to accept it
      Then they're refused
      And Grace's partnership's is still waiting to be accepted

  # docket:verifies rule:agreements/a-new-organization-is-offered-the-client-agreement
  Rule: An organization is offered the Client Agreement when it's created

    Example: A client creates an organization
      Given a client has signed up
      When they create Acme
      Then Acme has a Client Agreement to accept
      And Acme has no Client Agreement in effect

  # docket:verifies rule:agreements/who-accepts-a-client-agreement
  Rule: An organization's Client Agreement is accepted for it by someone whose role can manage it

    Example: An Admin accepts
      Given Acme has no Client Agreement in effect
      When an Admin of Acme accepts it
      Then Acme has a Client Agreement in effect, accepted by that Admin

    Scenario Outline: A <role> can't
      Given Acme has no Client Agreement in effect
      When a <role> of Acme tries to accept it
      Then they're refused
      And Acme still has no Client Agreement in effect

      Examples:
        | role    |
        | Member  |
        | Billing |

  # docket:verifies rule:agreements/manager-accepts-the-partner-agreement
  Rule: A partnership's Partner Agreement is accepted by its manager

    Example: The manager accepts
      Given Grace manages a partnership with a Partner Agreement to accept
      When Grace accepts it
      Then the partnership has a Partner Agreement in effect, accepted by Grace

    Example: An Exalynt admin can't
      Given Grace manages a partnership with a Partner Agreement to accept
      When an admin tries to accept it
      Then they're refused
      And the partnership still has no Partner Agreement in effect

  # docket:verifies rule:agreements/reading-the-partner-agreement-before-accepting
  Rule: An invited partner can read the Partner Agreement before accepting, and only the address invited can

    Example: The person invited
      Given an admin has invited Grace to the Partnership Program
      When Grace reads the Partner Agreement the invitation offers
      Then Grace sees the Partner Agreement

    Example: Someone else
      Given an admin has invited Grace to the Partnership Program
      When Theo tries to read the Partner Agreement the invitation offers
      Then Theo is told there's no such invitation
