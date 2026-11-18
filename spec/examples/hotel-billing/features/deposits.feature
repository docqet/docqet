Feature: Deposits

  @docket:verifies:rule:payments/deposit-is-the-first-night
  Rule: A deposit is the first night

    Scenario: The deposit for a three-night stay
      Given room 12 costs 150 a night, with city tax of 3
      When a guest books room 12 for three nights
      Then they're asked for a deposit of 153

  @docket:verifies:rule:payments/card-numbers-are-never-kept
  Rule: Card numbers are never kept

    Scenario: A deposit paid by card leaves no card number behind
      When a guest pays a deposit by card
      Then the hotel's records hold the provider's reference for the payment
      And no card number
