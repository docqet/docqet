Feature: Guest bills

  # docqet:verifies rule:charges-are-never-changed
  Rule: A charge is never changed or deleted

    Scenario: A mistaken charge is corrected with the opposite amount
      Given a guest's bill has a breakfast charged at 18
      When a clerk corrects the breakfast
      Then the bill has the breakfast at 18 and a correction at -18
      And the bill's balance is 0
