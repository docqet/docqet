Feature: Onboarding and eligibility
  Engineers join Exalynt by an admin's invitation. A payout account is what gets
  them paid, and they can be assigned capacity without one.

  # docket:verifies rule:onboarding/invited-engineers-join-their-team
  Rule: An engineer invited onto a team joins it on accepting

    Example: Joining the team they were invited to
      Given an admin has invited Theo on the Logistics team
      When Theo accepts the invitation
      Then Theo is on the Logistics team

    Example: Invited without a team
      Given an admin has invited Theo with no team
      When Theo accepts the invitation
      Then Theo is on no team

    Example: The team is gone by the time they accept
      Given an admin has invited Theo on the Logistics team
      And the Logistics team has since been deleted
      When Theo accepts the invitation
      Then Theo works with Exalynt
      And Theo is on no team

    Example: Already on another team
      Given Theo is on the Mobile team
      And an admin has invited Theo on the Logistics team
      When Theo accepts the invitation
      Then Theo is on the Logistics team
      And Theo is no longer on the Mobile team
