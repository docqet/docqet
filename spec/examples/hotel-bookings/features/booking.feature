Feature: Room booking

  # docket:verifies rule:no-double-booking@guest-stays
  Rule: A room can't be double-booked

    Scenario: A stay that overlaps an existing booking is refused
      Given room 12 is booked from 1 December to 4 December
      When a clerk books room 12 from 3 December to 5 December
      Then the booking is refused

    Scenario: A cancelled booking frees its nights
      Given room 12 was booked from 1 December to 4 December, then cancelled
      When a clerk books room 12 from 2 December to 3 December
      Then the booking is confirmed
