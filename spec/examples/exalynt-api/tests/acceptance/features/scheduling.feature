Feature: Scheduling
  Clients schedule each purchased block for a
  preferred week, chosen from the availability of engineers on the teams
  assigned to their organization.

  Background:
    Given Acme and Globex are clients

  # docket:verifies rule:scheduling/scheduling-comes-before-work
  Rule: A block must be scheduled before it can be worked on

    Example: Putting an engineer on an unscheduled block
      Given Acme has a block
      When Exalynt puts an engineer on it
      Then it's refused as not scheduled

    Example: Starting an unscheduled block
      Given Acme has a block
      When Exalynt starts it
      Then it's refused as not scheduled

  # docket:verifies rule:scheduling/unscheduled-blocks-reserve-no-room
  Rule: An unscheduled block reserves no room

    Example: Bought but not scheduled
      Given Acme's team offers 4 units in a week
      When Acme buys a block
      Then the week still has 4 units free

  # docket:verifies rule:scheduling/room-comes-from-assigned-teams
  Rule: A client's room comes only from the engineers on its assigned teams

    Example: Another team's engineers don't count
      Given Acme's team offers 2 units in a week
      And a team not assigned to Acme offers 4 units that week
      When Acme looks at that week
      Then the week holds 2 units

    Example: Every assigned team counts
      Given two teams assigned to Acme offer 2 units each in a week
      When Acme looks at that week
      Then the week holds 4 units

    Example: An engineer's offer for that week wins over their usual one
      Given an engineer on Acme's team usually offers 4 units
      And they offer 1 unit in a particular week
      When Acme looks at that week
      Then the week holds 1 unit

    Example: A client with no team
      Given Acme has no team assigned
      And Acme has a block
      When Acme schedules it into a week
      Then the week is full

  # docket:verifies rule:scheduling/clients-of-a-team-share-room
  Rule: Clients of the same team share its room

    Example: Scheduling counts for each client
      Given Acme and Globex are clients of the same team
      When Acme schedules a Flex block into a week
      Then Acme sees 1 unit of its own in that week
      And Globex sees 1 unit booked by someone else

    Example: A client of another team takes none of it
      Given Globex is a client of a different team
      And Globex has booked a block in a week
      When Acme looks at that week
      Then nothing is booked in it

    Example: A shared client's block on an engineer from elsewhere
      Given Acme and Globex are clients of the same team
      And Globex's block in a week has an engineer from Globex's other team
      When Acme looks at that week
      Then nothing is booked in it

    Example: Another client's block on one of Acme's engineers
      Given Globex is a client of a different team
      And Globex's block in a week has an engineer from Acme's team
      When Acme looks at that week
      Then 1 unit is booked by someone else

  # docket:verifies rule:scheduling/no-scheduling-into-a-full-week
  Rule: A week without room for a block can't be scheduled into

    Example: The last of a week's room
      Given Acme's team offers 2 units in a week
      And Acme has scheduled 2 Flex blocks into that week
      When Acme schedules a third into it
      Then the week is full

  # docket:verifies rule:scheduling/clients-move-blocks-until-the-week-starts
  Rule: A client can move a scheduled block until its week starts

    Example: To a week with room
      Given Acme has a block scheduled in one week
      And another week has room
      When Acme moves it to the other week
      Then the block is in the other week
      And the first week has that room free again

    Example: To a full week
      Given Acme has a block scheduled in one week
      And another week is full
      When Acme moves it to the other week
      Then the week is full
      And the block stays where it was

    Example: Its engineer comes off
      Given Acme has a scheduled block with an engineer on it
      When Acme moves it to another week
      Then the block has no engineer

    Example: Its week has started
      Given Acme has a block whose week has started, with no work begun
      When Acme moves it to another week
      Then it's refused as locked

  # docket:verifies rule:scheduling/clients-unschedule-blocks-until-the-week-starts
  Rule: A client can take a scheduled block out of its week until that week starts

    Example: Back to waiting for a week
      Given Acme has a block scheduled in one week
      When Acme takes it out of its week
      Then the block is waiting to be scheduled
      And the first week has that room free again

    Example: Its engineer comes off
      Given Acme has a scheduled block with an engineer on it
      When Acme takes it out of its week
      Then the block has no engineer

    Example: Its week has started
      Given Acme has a block whose week has started, with no work begun
      When Acme takes it out of its week
      Then it's refused as locked

  # docket:verifies rule:scheduling/last-in-first-out-with-an-exact-fit-first
  Rule: Blocks come out last in, first out, with an exact fit first

    Scenario Outline: Which blocks come out
      Given an engineer is the only one on their team, offering 4 units a week
      And a client of the team scheduled a Flex, then a Flex, then a Core block for next week
      When the engineer sets next week to <units> units
      Then <taken out> come out of the week

      Examples:
        | units | taken out                      |
        | 3     | the second Flex                |
        | 1     | the Core, then the second Flex |
        | 2     | the Core                       |

  # docket:verifies rule:scheduling/only-what-cant-fit-comes-out
  Rule: Only blocks the teams can't fit come out

    Example: A client with a second team keeps a block that team has room for
      Given an engineer is the only one on their team, offering 4 units a week
      And a client of the team also has a second team, offering 4 units a week
      And that client has a Core block scheduled for next week, with nobody on it
      And another client, of the first team only, has a Core block scheduled for next week, with nobody on it
      When the engineer sets next week to 2 units
      Then nothing comes out of the week

  # docket:verifies rule:scheduling/exalynt-can-move-lapsed-blocks
  Rule: Exalynt can move a block whose week ended with no work begun

    Example: An admin rebooks it
      Given Acme has a scheduled block whose week has ended, with no work begun
      When an Exalynt admin moves it to a coming week
      Then the block is in that week

    Example: The client can't
      Given Acme has a scheduled block whose week has ended, with no work begun
      When Acme moves it to another week
      Then it's refused as locked

  # docket:verifies rule:scheduling/the-preferred-week-is-a-target
  Rule: The preferred week is a target, and a missed week doesn't cancel the block

    Example: The week passes unworked
      Given Acme has a scheduled block
      When its week ends with no work begun
      Then the block is still scheduled and still Acme's
