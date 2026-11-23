Feature: Roles and platform access
  What someone may do depends on where they act: inside an organization, their
  role there decides it; acting in none, their platform role does. Exalynt's
  people also have the applications they've been given.

  # docket:verifies rule:organizations/organization-only-actions-need-an-organization rule:roles-and-access/permissions-follow-where-someone-acts
  Rule: What someone may do follows where they act

    Example: Inside an organization, their organization role decides
      Given Ada is an Admin of Acme, with a platform role that reads capacity
      When Ada buys capacity for Acme
      Then the capacity is bought

    Example: Acting in no organization, their platform role decides
      Given Ada is an Admin of Acme, with a platform role that reads capacity
      When Ada buys capacity, acting in no organization
      Then it's refused

  # docket:verifies rule:roles-and-access/no-platform-role-means-no-permissions
  Rule: Acting in no organization, someone with no platform role holds no permissions

    Example: A client's Admin outside their organization
      Given Ada is an Admin of Acme, with no platform role
      When Ada looks at capacity, acting in no organization
      Then it's refused

  # docket:verifies rule:organizations/anyone-can-create-an-organization rule:roles-and-access/creators-get-the-creator-role
  Rule: A new organization's creator holds the role given to creators

    Example: Creating an organization
      When Ada creates an organization called Acme
      Then Ada holds the role given to creators in Acme
      And Ada can buy capacity for Acme

  # docket:verifies rule:roles-and-access/member-permissions-follow-their-role
  Rule: A member's permissions follow their role

    Background:
      Given Ben is an Admin of Acme
      And Ben is changed to a role that only reads capacity

    Example: Changing roles
      When Ben changes another member's role
      Then it's refused

  # docket:verifies rule:roles-and-access/outsiders-cant-change-organization-roles
  Rule: Someone can't change roles in an organization they don't belong to

    Example: An Admin of another organization
      Given Ada is an Admin of Globex, and Ben is a member of Acme
      When Ada changes Ben's role in Acme
      Then it's refused
      And Ben's role is as it was

  # docket:verifies rule:roles-and-access/acting-as-engineer-or-client-never-both
  Rule: Someone who is both an engineer and a client member acts as one or the other, never both

    Background:
      Given Ada is an Admin of Acme and on Platform, which supports Globex
      And Acme and Globex each have a block

    Example: Acting in their organization
      When Ada looks at capacity, acting in Acme
      Then Ada sees Acme's block and not Globex's

    Example: Acting in no organization
      When Ada looks at capacity, acting in no organization
      Then Ada sees Globex's block and not Acme's

  # docket:verifies rule:roles-and-access/team-scoped-capacity-access rule:teams/engineers-work-only-with-supported-clients
  Rule: An engineer allowed to read capacity at team scope sees only what their team supports

    Background:
      Given Ada is allowed to read capacity at team scope
      And Acme and Globex each have a block

    Example: On no team
      When Ada looks at capacity
      Then Ada sees no capacity

    Example: On a team
      Given Ada is on Platform, which supports Acme
      When Ada looks at capacity
      Then Ada sees Acme's block and not Globex's

    Example: Naming another client's block
      Given Ada is on Platform, which supports Acme
      When Ada reads Globex's block, naming Globex's organization
      Then it isn't found

    Example: Listing clients
      Given Ada is on Platform, which supports Acme
      When Ada lists clients
      Then Ada finds exactly Acme

  # docket:verifies rule:roles-and-access/own-scoped-capacity-access
  Rule: An engineer allowed to read capacity only at their own scope sees only the blocks they're staffed on

    Example: Two blocks
      Given Ada is allowed to read capacity at own scope
      And Ada is staffed on one of Acme's blocks and not the other
      When Ada looks at capacity
      Then Ada sees only the block Ada is staffed on

  # docket:verifies rule:roles-and-access/read-only-engineers-cant-staff-blocks
  Rule: An engineer who can only read can't staff a block

    Example: Staffing
      Given Ada is allowed only to read capacity
      And Acme has a block
      When Ada puts an engineer on the block
      Then it's refused

  # docket:verifies rule:roles-and-access/only-exalynt-lists-its-clients
  Rule: Only Exalynt lists its clients

    Scenario Outline: A client tries
      When an Admin of Acme tries to list <what>
      Then it's refused

      Examples:
        | what    |
        | clients |

  # docket:verifies rule:roles-and-access/what-each-role-kind-may-grant
  Rule: What each kind of role may grant

    Scenario Outline: The permissions on offer
      When someone who manages roles reads the permissions roles can grant
      Then <permission> can be granted by <kinds>

      Examples:
        | permission       | kinds                                                                |
        | buying capacity  | organization roles only                                              |
        | managing roles   | platform roles only                                                  |
        | reading capacity | organization roles, and platform roles at global, team, or own scope |

  # docket:verifies rule:roles-and-access/exalynt-only-permissions-cant-be-granted
  Rule: Nobody can grant what only Exalynt's own systems hold

    Example: Syncing identities
      When someone who manages roles reads the permissions roles can grant
      Then syncing identities isn't among them

  # docket:verifies rule:roles-and-access/roles-grant-only-what-their-kind-allows
  Rule: A role only grants what its kind may grant

    Scenario Outline: Refused grants
      When Exalynt makes a <kind> role granting <grant>
      Then it's refused

      Examples:
        | kind         | grant                                  |
        | platform     | an unknown permission                  |
        | platform     | buying capacity                        |
        | platform     | reading capacity at organization scope |
        | platform     | managing roles at team scope           |
        | organization | an unknown permission                  |
        | organization | managing roles                         |
        | organization | syncing identities                     |

  # docket:verifies rule:roles-and-access/who-reads-permissions-and-makes-roles
  Rule: Only someone who manages roles reads the permissions roles can grant, or makes roles

    Scenario Outline: A client tries
      When an Admin of Acme tries to <action>
      Then it's refused

      Examples:
        | action                               |
        | read the permissions roles can grant |
        | make a platform role                 |
        | make an organization role            |

  # docket:verifies rule:roles-and-access/deleted-roles-cant-be-found
  Rule: Once a role is deleted, it can't be found

    Scenario Outline: Deleting a role nobody holds
      Given there is a <kind> role nobody holds
      When Exalynt deletes it
      Then it can't be found

      Examples:
        | kind         |
        | platform     |
        | organization |

  # docket:verifies rule:roles-and-access/held-platform-roles-cant-be-deleted
  Rule: A platform role someone holds can't be deleted

    Example: Held
      Given Ada holds the Reviewer platform role
      When Exalynt deletes Reviewer
      Then it's refused

    Example: No longer held
      Given Ada held the Reviewer platform role and has been given another
      When Exalynt deletes Reviewer
      Then Reviewer can't be found

  # docket:verifies rule:roles-and-access/invited-roles-cant-be-deleted
  Rule: A role someone has been invited to can't be deleted

    Example: A pending invitation
      Given Ada has been invited to Acme with the Reviewer role
      When Exalynt deletes Reviewer
      Then it's refused

  # docket:verifies rule:roles-and-access/who-gives-out-platform-roles
  Rule: Only someone who manages people's roles gives out platform roles

    Example: Giving a role to someone else
      Given Ada doesn't manage people's roles
      When Ada gives Ben a platform role
      Then it's refused

    Example: Giving a role to themselves
      Given Ada doesn't manage people's roles
      When Ada gives Ada a platform role
      Then it's refused

  # docket:verifies rule:roles-and-access/role-names-are-unique-within-their-kind
  Rule: Role names are unique among their kind, ignoring case

    Scenario Outline: A name already taken
      Given there is a <kind> role called Reviewer
      When Exalynt makes a <kind> role called "reviewer"
      Then it's refused

      Examples:
        | kind         |
        | platform     |
        | organization |

  # docket:verifies rule:roles-and-access/only-one-creator-role
  Rule: Only one organization role is given to creators

    Example: Marking another role
      Given Admin is given to creators
      When Exalynt marks Owner to be given to creators
      Then Owner is given to creators
      And Admin isn't

  # docket:verifies rule:roles-and-access/the-creator-role-can-manage-members
  Rule: The role given to creators can manage members

    Example: Marking a role that can't
      Given Viewer can't manage members
      When Exalynt marks Viewer to be given to creators
      Then it's refused

  # docket:verifies rule:roles-and-access/held-organization-roles-cant-be-deleted
  Rule: An organization role someone holds can't be deleted

    Example: Held
      Given Ben holds the Reviewer role in Acme
      When Exalynt deletes Reviewer
      Then it's refused

  # docket:verifies rule:roles-and-access/held-roles-keep-member-management
  Rule: An organization role someone holds keeps the ability to manage members

    Example: Taking it away
      Given Ada holds the Admin role in Acme
      When Exalynt takes managing members away from Admin
      Then it's refused
      And Admin can still manage members

  # docket:verifies rule:roles-and-access/people-lists-exclude-clients
  Rule: Acting in no organization, the people listed are only those who work with Exalynt, holding a platform role, never clients

    Example: Exalynt lists its people
      Given Ada works with Exalynt
      And Gina is a member of Acme
      When an administrator lists people, acting in no organization
      Then Ada is listed
      And Gina isn't listed

  # docket:verifies rule:roles-and-access/listing-people-requires-a-platform-role
  Rule: Someone with no platform role can't list people

    Example: A client's member
      Given Gina is a member of Acme
      When Gina tries to list people, acting in no organization
      Then it's refused

  # Not business rules: unit tests, if the feature's level calls for them.
  #   - Every permission is named area:action and described, and says what
  #     each kind of role can grant it at: platform grants at global, team, or
  #     own scope, each described, and organization grants. Every permission
  #     can be granted by at least one kind of role.
  #   - A role's grants come with the permission's description and a
  #     description of the grant at its scope.
  #   - The applications on an invitation to work with Exalynt are kept once
  #     each, in order.
  #   - Applications must be ones that exist.
