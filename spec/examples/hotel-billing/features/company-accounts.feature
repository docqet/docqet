Feature: Company accounts

  @docket:verifies:rule:company-accounts/credit-limit
  Rule: A company can't go over its credit limit

    Scenario: A bill within the limit moves to the company
      Given Acme owes 800 with a credit limit of 1000
      When a clerk moves a bill of 150 for an Acme guest to Acme's account
      Then Acme owes 950

    Scenario: A bill over the limit stays with the guest
      Given Acme owes 900 with a credit limit of 1000
      When a clerk moves a bill of 150 for an Acme guest to Acme's account
      Then the move is refused
      And Acme owes 900
