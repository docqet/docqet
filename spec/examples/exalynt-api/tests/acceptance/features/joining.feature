Feature: Joining Exalynt
  Clients sign up on their own, while engineers and partners join by an
  admin's invitation. A person keeps one account, however many hats they wear.

  # docket:verifies rule:one-account-however-many-hats@accounts rule:adding-a-hat-to-an-account@accounts
  Rule: Someone who takes on another hat keeps their one account, and gains what the new hat needs alongside what they had

    Example: A client member becomes an engineer
      Given Dana is a Member of Acme
      And an admin has invited Dana to the console
      When Dana accepts the invitation
      Then Dana works with Exalynt and has the console
      And Dana still belongs to Acme, with the portal

    Example: An engineer becomes a partner
      Given Theo is an engineer at Exalynt, with the console
      And an admin has invited Theo to the Partnership Program
      When Theo accepts the invitation
      Then Theo manages the partnership and has the Partner Hub
      And Theo still has the console

  # docket:verifies rule:gaining-a-hat-takes-nothing-away@accounts
  Rule: Gaining a hat never takes another away

    Example: An engineer becomes a partner
      Given Theo is an engineer on the Logistics team, with an Engineer Share of 70% in effect
      And an admin has invited Theo to the Partnership Program
      When Theo accepts the invitation
      Then Theo is still on the Logistics team
      And Theo's Engineer Agreement in effect still has an Engineer Share of 70%

  # docket:verifies rule:invitations-stay-pending-until-resolved@accounts
  Rule: An invitation stays pending until it's accepted or revoked, and doesn't expire

    Example: An invitation sent long ago
      Given Acme invited helen@example.com a year ago
      And Helen has signed up with helen@example.com
      When Helen looks at the invitations waiting for them
      Then Helen sees the invitation to Acme
