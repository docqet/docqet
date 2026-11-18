Feature: City tax

  @docket:verifies:rule:tax/city-tax-per-guest-night
  Rule: City tax is charged per guest, per night

    Scenario: Two guests staying three nights
      Given the city tax is 3 per guest per night
      When two guests stay from 1 December to 4 December
      Then their bill has city tax of 6 on each of 3 nights
