Feature: Organizations and members
  A client organization is where a client's people work with Exalynt. Each
  member holds the Admin, Member, or Billing role, and others join when an
  Admin invites them.

  # docket:verifies rule:organizations/logos-stay-within-their-organization
  Rule: A client can't reach another organization's logo

    Background:
      Given Acme and Globex are clients

    Example: Reading the logo
      When Globex reads Acme's logo
      Then it isn't found

    Example: Setting the logo
      When Globex sets Acme's logo
      Then it isn't found

  # docket:verifies rule:organizations/anyone-can-create-an-organization rule:organizations/creators-get-client-access rule:joining/one-account-however-many-hats
  Rule: Creating an organization gives its creator the portal, alongside the applications they already had

    Example: An engineer creates an organization
      Given Theo is an engineer at Exalynt, with the console
      When Theo creates an organization called Ridgeline
      Then Theo belongs to Ridgeline
      And Theo has the portal and the console

  # docket:verifies rule:organizations/newcomers-start-with-no-organization
  Rule: Someone newly signed up belongs to no organization until they create one, and then it's the only one they see

    Background:
      Given Acme and Globex are clients
      And Helen has just signed up

    Example: Before creating one
      When Helen lists the organizations they belong to
      Then Helen sees none

    Example: After creating one
      Given Helen has created Ridgeline
      When Helen lists the organizations they belong to
      Then Helen sees only Ridgeline

  # docket:verifies rule:organizations/members-act-only-in-their-organizations
  Rule: Someone may act only in an organization they belong to

    Example: Another client's organization
      Given Acme and Globex are clients
      And Ada is an Admin of Acme
      When Ada acts in Globex
      Then it's refused

  # docket:verifies rule:organizations/client-admins-run-the-organization
  Rule: A client Admin runs the organization: capacity, billing, and members

    Example: Acting in their organization
      Given Ada is an Admin of Acme
      When Ada acts in Acme
      Then Ada can buy and schedule capacity, see and pay invoices, and manage members

  # docket:verifies rule:organizations/only-admins-purchase-or-manage-members
  Rule: Only a client Admin can purchase capacity or manage members

    Scenario Outline: Anyone else
      Given Ben is <who> of Acme
      When Ben acts in Acme
      Then Ben can't buy capacity or manage members

      Examples:
        | who              |
        | a Member         |
        | a Billing member |

  # docket:verifies rule:organizations/client-members-work-without-billing
  Rule: A client Member schedules capacity, but can't purchase capacity or see billing

    Example: Acting in their organization
      Given Ben is a Member of Acme
      When Ben acts in Acme
      Then Ben can schedule capacity, but can't buy capacity or see invoices

  # docket:verifies rule:organizations/client-members-see-payment-state-not-invoices
  Rule: A client Member can see whether a block is pending payment or its payment failed, but not its invoice

    Example: A block whose payment failed
      Given Acme has a block whose payment failed
      And Ben is a Member of Acme
      When Ben looks at Acme's blocks
      Then Ben sees that the block's payment failed
      And Ben can't read the invoice it was bought on

  # docket:verifies rule:organizations/billing-members-handle-only-billing
  Rule: A client's Billing member sees invoices, pays them, and manages payment methods, and doesn't work with capacity, scheduling, or members

    Example: Acting in their organization
      Given Cara is a Billing member of Acme
      When Cara acts in Acme
      Then Cara can see and pay invoices and manage payment methods, but can't see or schedule capacity or manage members

  # docket:verifies rule:organizations/someone-always-manages-members
  Rule: An organization always has at least one member who can manage members

    Background:
      Given Ada is Acme's only Admin, and Ben is a Member of it

    Scenario Outline: The last one
      When Ada <gives it up>
      Then it's refused
      And Ada is still an Admin of Acme

      Examples:
        | gives it up               |
        | leaves Acme               |
        | makes themselves a Member |

  # docket:verifies rule:organizations/giving-up-member-management
  Rule: Once another member holds a role that can manage members, a member can give up their own ability to manage members

    Example: Two Admins
      Given Ada and Ben are Admins of Acme
      When Ada makes themselves a Member
      Then Ada is a Member of Acme

  # docket:verifies rule:organizations/admins-alone-see-and-revoke-invitations rule:joining/who-sees-and-revokes-pending-invitations
  Rule: Only a client Admin sees or revokes the organization's invitations

    Scenario Outline: Someone who isn't an Admin
      Given Ada is an Admin of Acme
      And Ada has invited helen@example.com to Acme
      And Ben is <who> of Acme
      When Ben tries to <action>
      Then it's refused

      Examples:
        | who              | action                                     |
        | a Member         | see Acme's invitations                     |
        | a Billing member | revoke the invitation to helen@example.com |

  # docket:verifies rule:organizations/invitations-carry-organization-roles-only
  Rule: An organization invitation only goes to an organization role, never a platform role

    Example: A platform role
      Given Ada is an Admin of Acme
      And there is a platform role called Reviewer
      When Ada invites helen@example.com to Acme as Reviewer
      Then it's refused
      And Acme has no invitations

  # docket:verifies rule:organizations/one-pending-invitation-per-person
  Rule: Someone can't be invited to an organization twice while an invitation to them is pending, whatever the case of their email address

    Example: The same address in other capitals
      Given Ada is an Admin of Acme
      And Ada has invited helen@example.com to Acme
      When Ada invites Helen@Example.com to Acme
      Then it's refused
      And Acme has one invitation, to helen@example.com

  # docket:verifies rule:organizations/invitations-are-limited
  Rule: An organization, and each person, can send at most 50 invitations a day, and revoking one doesn't free up another

    Example: The organization's 51st
      Given Ada is an Admin of Acme
      And Ada has invited 50 people to Acme today
      When Ada invites helen@example.com to Acme
      Then it's refused
      And helen@example.com isn't emailed

    Example: Revoking one doesn't free up another
      Given Ada is an Admin of Acme
      And Ada has invited 50 people to Acme today
      And Ada has revoked one of those invitations
      When Ada invites helen@example.com to Acme
      Then it's refused

    Example: The same person, from another organization
      Given Ada is an Admin of Acme and of Ridgeline
      And Ada has invited 50 people to Acme today
      When Ada invites helen@example.com to Ridgeline
      Then it's refused
      And helen@example.com isn't emailed

  # docket:verifies rule:organizations/only-the-invitee-can-accept rule:joining/invitations-go-to-an-email-address
  Rule: An invitation to an organization is accepted only by the person it was sent to, signed in with that address

    Example: Someone else
      Given Ada is an Admin of Acme
      And Ada has invited helen@example.com to Acme
      When Theo tries to accept Helen's invitation
      Then Theo is told there's no such invitation
      And Theo doesn't belong to Acme

  # docket:verifies rule:organizations/accepting-makes-someone-a-member rule:joining/invitations-go-to-an-email-address rule:joining/invitations-stay-pending-until-resolved
  Rule: Accepting an invitation makes the invitee a member, with the role they were invited to, and it's no longer pending

    Example: Accepting
      Given Ada is an Admin of Acme
      And Ada has invited helen@example.com to Acme as a Member
      And Helen has signed up with helen@example.com
      When Helen accepts the invitation
      Then Acme lists Helen as a Member, with helen@example.com
      And Acme is among Helen's organizations
      And Helen has no invitation to accept

  # docket:verifies rule:organizations/new-members-hold-their-roles-permissions
  Rule: Acting in the organization, a new member holds exactly their role's permissions, and has the portal

    Example: A new Billing member
      Given Ada is an Admin of Acme
      And Ada has invited helen@example.com to Acme as a Billing member
      And Helen has accepted the invitation
      When Helen acts in Acme
      Then Helen can do what Billing in Acme can, and no more
      And Helen has the portal

  # docket:verifies rule:organizations/revoked-invitations-cant-be-accepted rule:joining/invitations-stay-pending-until-resolved
  Rule: A revoked invitation is no longer pending for the invitee and can't be accepted

    Example: Revoked before it's accepted
      Given Ada is an Admin of Acme
      And Ada has invited helen@example.com to Acme
      And Ada has revoked the invitation
      When Helen tries to accept it
      Then Helen is told there's no such invitation
      And Helen has no invitation to accept
      And Helen doesn't belong to Acme

  # docket:verifies rule:organizations/anyone-can-leave-not-remove-others
  Rule: A member who can't manage members can't remove anyone else, but can remove themselves, leaving the organization

    Example: Removing someone else
      Given Ada is an Admin of Acme
      And Ben and Cara are Members of Acme
      When Ben removes Cara from Acme
      Then it's refused
      And Cara still belongs to Acme

    Example: Leaving
      Given Ada is an Admin of Acme
      And Ben is a Member of Acme
      When Ben leaves Acme
      Then Ben no longer belongs to Acme

  # docket:verifies rule:organizations/leaving-ends-access
  Rule: Someone who has left an organization can no longer act in it

    Example: After leaving
      Given Ben has left Acme
      When Ben acts in Acme
      Then it's refused

  # docket:verifies rule:organizations/former-members-can-rejoin
  Rule: Someone who left an organization can be invited again and rejoin it

    Example: Invited back
      Given Ada is an Admin of Acme
      And Ben has left Acme
      And Ada has invited Ben to Acme again
      When Ben accepts the invitation
      Then Ben belongs to Acme

  # docket:verifies rule:organizations/outsiders-cant-rename-an-organization
  Rule: Someone outside an organization can't rename it

    Example: Another client
      Given Acme and Globex are clients
      When Globex renames Acme
      Then it isn't found
      And Acme's name is as it was

  # docket:verifies rule:organizations/organizations-start-without-a-logo
  Rule: An organization has no logo until one is set

    Example: A new organization
      When Helen creates an organization called Ridgeline
      Then Ridgeline has no logo

  # docket:verifies rule:organizations/organization-listings-show-logo-status
  Rule: An organization's listing shows whether it has a logo, and a removed logo can no longer be downloaded

    Example: Setting a logo
      Given Acme has no logo
      When Acme sets its logo
      Then Acme's listing shows it has a logo

    Example: Removing it
      Given Acme has a logo
      When Acme removes its logo
      Then Acme's listing shows it has no logo
      And Acme's logo can't be downloaded

  # docket:verifies rule:organizations/logos-must-be-raster-images
  Rule: A logo must be a raster image, so an SVG is refused

    Example: An SVG
      When Acme sets an SVG as its logo
      Then it's refused
      And Acme has no logo

  # Not business rules: unit tests, if the feature's level calls for them.
  #   - An organization needs a name, on one line, of at most 200 characters,
  #     and a name can't be blank when it's changed.
  #   - An organization's name is trimmed, when it's created and when it's
  #     changed.
  #   - A malformed organization ID is refused.
  #   - An invitation needs a real email address.
  #   - A logo sent without a type takes its contents' type.
