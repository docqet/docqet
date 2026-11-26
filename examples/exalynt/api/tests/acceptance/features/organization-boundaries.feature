Feature: Organization boundaries
  Each organization is kept apart from every other, but some things don't belong
  to one: what's a person's goes with them wherever they act, and a team's room
  is shared by every client it supports.

  # docqet:verifies rule:only-the-invitee-can-accept@accounts rule:personal-things-follow-the-person@accounts
  Rule: What belongs to a person works wherever they act

    Background:
      Given Dana acts in Acme

    Example: Dana sees every organization they belong to
      Given Dana also belongs to Globex
      When Dana lists the organizations they belong to
      Then Dana sees Acme and Globex

    Example: Dana creates another organization
      When Dana creates another organization
      Then Dana belongs to the new organization

    Example: Dana sees and accepts an invitation to Globex
      Given Globex invited Dana
      When Dana accepts the invitation waiting for them
      Then Dana belongs to Globex

  # docqet:verifies rule:team-rooms-are-shared-across-clients@accounts
  Rule: A team's room is shared by the clients it supports

    Background:
      Given Acme and Globex are clients of the same team
      And Acme has a block

    Example: Acme can't book the week Globex filled
      Given Globex has filled a week
      When Acme books its block into that week
      Then the week is full

    Example: Acme's week counts Globex's bookings, without naming Globex
      Given Globex has booked a block in a week
      When Acme looks at that week
      Then Acme has nothing of its own booked, and Globex's block counts as someone else's
