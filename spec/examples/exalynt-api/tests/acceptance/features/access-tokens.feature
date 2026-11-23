Feature: Access tokens
  Clients, engineers, team leads, admins, and partners can each create
  personal access tokens that call the API as themselves, with the same
  access they have, or less where a token is limited to some organizations.

  Background:
    Given Acme and Globex are clients

  # docket:verifies rule:access-tokens/tokens-carry-their-creators-access
  Rule: A token has its creator's access when it's used, within any limit it has

    Example: In an organization, it has their role there
      Given Ada is an Admin of Acme and has a token
      When the token is used in Acme
      Then it can do what an Admin of Acme can

    Example: In no organization, it has their platform role
      Given Erin is an engineer at Exalynt and has a token
      When the token is used in no organization
      Then it can do what an engineer at Exalynt can

  # docket:verifies rule:access-tokens/role-changes-apply-at-once
  Rule: A change to its creator's roles or memberships applies at once

    Example: Their role changes
      Given Ada is an Admin of Acme and has a token
      When Ada is made Billing in Acme
      Then the token can do what Billing in Acme can, and no more

    Example: They leave the organization
      Given Ada is a Member of Acme and has a token
      When Ada is removed from Acme
      Then the token can't act in Acme

  # docket:verifies rule:access-tokens/tokens-stay-in-their-creators-organizations
  Rule: A token can't act in an organization its creator doesn't belong to

    Example: Another client's organization
      Given Ada is a Member of Acme and has a token
      When the token is used in Globex
      Then it's refused

  # docket:verifies rule:access-tokens/secret-shown-only-once
  Rule: The secret is shown once, when the token is created

    Example: Creating a token
      When Ada creates a token
      Then Ada is shown its secret

    Example: Listing tokens afterwards
      Given Ada has a token
      When Ada lists their tokens
      Then Ada sees the token
      And its secret isn't shown

  # docket:verifies rule:access-tokens/managing-tokens-requires-a-session
  Rule: Managing tokens needs a signed-in session

    Scenario Outline: A token can't manage tokens
      Given Ada has a token
      When the token is used to <action>
      Then it's refused

      Examples:
        | action         |
        | create a token |
        | list tokens    |
        | revoke a token |

  # docket:verifies rule:access-tokens/tokens-are-private-to-their-owner
  Rule: A token is only its owner's to see or revoke

    Example: Someone else doesn't see it
      Given Ada has a token
      When Bea lists their tokens
      Then Bea doesn't see Ada's token

    Example: Someone else can't revoke it
      Given Ada has a token
      When Bea tries to revoke it
      Then Bea finds no such token
      And Ada's token still works

  # docket:verifies rule:access-tokens/revoked-tokens-stop-working
  Rule: A revoked token can no longer sign anyone in

    Example: Revoking a token
      Given Ada has a token
      When Ada revokes it
      Then the token doesn't sign anyone in

  # docket:verifies rule:access-tokens/tokens-cover-all-organizations-by-default
  Rule: A token works in all of its creator's organizations unless they limit it when creating it

    Example: Choosing some organizations
      Given Ada is a Member of Acme and Globex
      When Ada creates a token limited to Acme
      Then the token works in Acme
      And the token is refused in Globex

    Example: Not choosing any
      Given Ada is a Member of Acme and Globex
      When Ada creates a token
      Then the token works in Acme
      And the token works in Globex

    Example: A token made before limits existed
      Given Ada is a Member of Acme and has a token made before limits existed
      When the token is used in Acme
      Then it can do what a Member of Acme can

  # docket:verifies rule:access-tokens/limited-tokens-work-only-where-limited
  Rule: A limited token works only in its organizations, with its creator's role in each

    Example: With their role in each
      Given Ada is an Admin of Acme and a Member of Globex
      And Ada has a token limited to Acme and Globex
      When the token is used in Globex
      Then it can do what a Member of Globex can

    Example: Another organization its creator belongs to
      Given Ada is a Member of Acme and Globex
      And Ada has a token limited to Acme
      When the token is used in Globex
      Then it's refused

  # docket:verifies rule:access-tokens/limited-tokens-must-name-an-organization
  Rule: A limited token has to name one of its organizations

    Example: Naming none
      Given Erin is an engineer at Exalynt and a Member of Acme
      And Erin has a token limited to Acme
      When the token is used in no organization
      Then it's refused

  # docket:verifies rule:access-tokens/unlimited-tokens-follow-their-creator
  Rule: A token that works in all organizations follows its creator

    Example: An organization they join later
      Given Ada is a Member of Acme and has a token
      When Ada joins Globex as a Member
      And the token is used in Globex
      Then it can do what a Member of Globex can

  # docket:verifies rule:access-tokens/limits-need-the-creators-membership
  Rule: A token can only be limited to organizations its creator belongs to

    Scenario Outline: Choosing somewhere else
      Given Ada is a Member of Acme
      When Ada creates a token limited to <organization>
      Then no token is created
      And Ada is told the same thing either way

      Examples:
        | organization                       |
        | Globex                             |
        | an organization that doesn't exist |

    Example: Someone who belongs to none
      When Bea creates a token limited to Acme
      Then no token is created

    Example: Exalynt staff who reach a client but don't belong to it
      Given Erin is an engineer at Exalynt on a team assigned to Acme
      When Erin creates a token limited to Acme
      Then no token is created

  # docket:verifies rule:access-tokens/limited-tokens-reveal-only-their-organizations
  Rule: A limited token reveals only its own organizations

    Example: Asking where its creator belongs
      Given Ada is a Member of Acme and Globex
      And Ada has a token limited to Acme
      When the token is used in Acme to list Ada's organizations
      Then it sees Acme
      And it doesn't see Globex

    Example: Trying organizations to find out
      Given Ada is a Member of Acme and Globex
      And Ada has a token limited to Acme
      When the token is used in Globex and in an organization Ada isn't in
      Then it's refused the same way in both

  # docket:verifies rule:access-tokens/a-tokens-organizations-are-fixed
  Rule: A token's organizations are fixed when it's created

    Example: Joining another organization doesn't add it
      Given Ada is a Member of Acme and has a token limited to Acme
      When Ada joins Globex as a Member
      And the token is used in Globex
      Then it's refused

  # docket:verifies rule:access-tokens/limited-tokens-cant-act-elsewhere
  Rule: A limited token can't act for its creator outside its organizations

    Scenario Outline: Things that aren't in any of its organizations
      Given Ada is a Member of Acme and has a token limited to Acme
      When the token is used in Acme to <action>
      Then it's refused

      Examples:
        | action                 |
        | create an organization |
        | list Ada's invitations |
        | accept an invitation   |

    Scenario Outline: Reaching another organization from one of its own
      Given Ada is an Admin of Acme and a Member of Globex
      And Globex has a logo
      And Ada has a token limited to Acme
      When the token is used in Acme to <action>
      Then it finds no such organization

      Examples:
        | action                |
        | list Globex's members |
        | see Globex's logo     |

  # Edge rules

  # docket:verifies rule:access-tokens/unknown-tokens-sign-no-one-in
  Rule: An unknown token doesn't sign anyone in

    Example: A token no one created
      When a token no one created is used
      Then it's refused

  # docket:verifies rule:access-tokens/expired-tokens-sign-no-one-in
  Rule: An expired token doesn't sign anyone in

    Example: Past its expiry
      Given Ada has a token that expired yesterday
      When the token is used
      Then it's refused

  # docket:verifies rule:access-tokens/expired-tokens-stay-listed
  Rule: An expired token stays listed until it's revoked

    Example: Listing an expired token
      Given Ada has a token that expired yesterday
      When Ada lists their tokens
      Then Ada sees the token

  # docket:verifies rule:access-tokens/deleting-someone-deletes-their-tokens
  Rule: Deleting someone deletes their tokens

    Example: Their account is deleted
      Given Ada has a token
      When Ada's account is deleted
      Then the token doesn't sign anyone in

  # docket:verifies rule:access-tokens/bans-suspend-a-persons-tokens
  Rule: A banned person's tokens don't work until the ban is lifted

    Example: They're banned
      Given Ada has a token
      When Ada is banned
      Then the token doesn't sign anyone in

    Example: The ban is lifted
      Given Ada has a token
      And Ada is banned
      When Ada's ban is lifted
      Then Ada's token still works

  # docket:verifies rule:access-tokens/last-use-is-recorded
  Rule: Using a token records when it was last used

    Example: First use
      Given Ada has a token that has never been used
      When the token is used
      Then Ada sees when it was last used

  # docket:verifies rule:access-tokens/limited-tokens-keep-an-organization
  Rule: A limited token has at least one organization

    Example: Choosing none
      Given Ada is a Member of Acme
      When Ada creates a token limited to no organizations
      Then no token is created

  # docket:verifies rule:access-tokens/limits-never-widen
  Rule: A limit never widens

    Example: Leaving one of its organizations
      Given Ada is a Member of Acme and Globex
      And Ada has a token limited to Acme and Globex
      When Ada is removed from Acme
      Then the token is refused in Acme
      And the token works in Globex

    Example: Leaving all of them
      Given Ada is a Member of Acme and has a token limited to Acme
      When Ada is removed from Acme
      Then the token is refused in Acme
      And the token is refused when it names no organization

    Example: Rejoining
      Given Ada is a Member of Acme and has a token limited to Acme
      And Ada is removed from Acme
      When Ada joins Acme as a Member
      Then the token works in Acme

  # docket:verifies rule:access-tokens/owners-see-a-tokens-limits
  Rule: A token's owner sees which organizations it's limited to

    Example: Listing a limited token
      Given Ada is a Member of Acme and has a token limited to Acme
      When Ada lists their tokens
      Then Ada sees the token is limited to Acme

  # Not business rules: unit tests cover them.
  #   - A token can't be created already expired.
  #   - A token must have a name that isn't blank.
