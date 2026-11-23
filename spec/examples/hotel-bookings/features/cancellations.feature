Feature: Cancellations

  # docket:verifies rule:free-cancellation-window@guest-stays
  Rule: Cancelling 48 hours ahead is free

    Scenario: Cancelling three days ahead is refunded in full
      Given a booking checking in on 10 December at 15:00, paid 300
      When the clerk cancels it on 7 December at 15:00
      Then the guest is refunded 300

    Scenario: Cancelling exactly 48 hours ahead is refunded in full
      Given a booking checking in on 10 December at 15:00, paid 300
      When the clerk cancels it on 8 December at 15:00
      Then the guest is refunded 300
