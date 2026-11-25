Feature: Night audit

  # docket:verifies rule:one-room-charge-per-night@finance
  Rule: A guest is charged once a night for their room

    Scenario: Every guest in the hotel is charged for the night
      Given guests are staying in rooms 12 and 14 on 1 December
      When the night audit runs for 1 December
      Then each of their bills has one room charge for the night of 1 December

    Scenario: Starting the audit twice charges each guest once
      Given a guest is staying in room 12 on 1 December
      When the night audit is started twice for 1 December
      Then their bill has one room charge for the night of 1 December

  # docket:verifies rule:closed-days-dont-change@finance
  Rule: A closed day can't change

    Scenario: A late breakfast goes on the next day
      Given 1 December has been closed
      When a clerk adds a breakfast for a guest at 03:30
      Then the breakfast is on 2 December
