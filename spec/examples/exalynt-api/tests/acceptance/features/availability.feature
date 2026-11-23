Feature: Availability
  Engineers set a recurring weekly baseline and one-off adjustments for
  particular weeks, which together make their effective availability.

  # docket:verifies rule:availability/how-a-weeks-availability-is-decided
  Rule: A week's availability is the engineer's adjustment for it, otherwise their baseline once it has started, otherwise nothing

    Example: The baseline applies
      Given an engineer offers 4 units a week from this week
      When they look at next week
      Then next week offers 4 units

    Example: An adjustment wins over the baseline
      Given an engineer offers 4 units a week from this week
      And they have adjusted next week to 1 unit
      When they look at next week
      Then next week offers 1 unit

    Example: Before the baseline starts
      Given an engineer offers 4 units a week from next week
      When they look at this week
      Then this week offers nothing

    Example: No baseline yet
      Given an engineer has not set a baseline
      When they look at this week
      Then this week offers nothing

  # docket:verifies rule:availability/reductions-need-no-approval
  Rule: An engineer's reduction of their availability takes effect without approval

    Example: Taking a week off
      Given an engineer offers 4 units a week from this week
      When they set next week to unavailable
      Then next week offers nothing

    Example: Lowering the baseline leaves adjusted weeks alone
      Given an engineer offers 4 units a week from this week
      And they have adjusted next week to 3 units
      When they lower their baseline to 2 units
      Then next week offers 3 units
      And the week after offers 2 units

  # docket:verifies rule:availability/only-its-owner-sets-availability
  Rule: Nobody sets anyone else's availability

    Example: A teammate tries
      Given two engineers with baselines
      When one tries to change the other's baseline
      Then it's refused

    Example: An admin tries
      Given an engineer with a baseline
      When an admin tries to adjust a week of theirs
      Then it's refused

  # docket:verifies rule:availability/admins-set-their-own-availability
  Rule: Admins set their own availability, as engineers do

    Example: An admin sets their baseline
      Given an admin has not set a baseline
      When they set a baseline of 2 units a week
      Then this week offers 2 units

  # docket:verifies rule:availability/who-sees-an-engineers-availability
  Rule: An engineer's availability is seen by them, their team, and admins

    Example: A lead sees their team
      Given a lead and an engineer on the same team
      When the lead looks at the engineer's weeks
      Then they see them

    Example: An admin sees anyone's
      Given an engineer with a baseline
      When an admin looks at the engineer's weeks
      Then they see them

    Example: A lead of another team can't
      Given a lead and an engineer on different teams
      When the lead looks at the engineer's weeks
      Then it's as if there's no such engineer

    Example: A teammate sees them
      Given two engineers on the same team, neither of them its lead
      When one looks at the other's weeks
      Then they see them

  # docket:verifies rule:availability/one-baseline-per-engineer
  Rule: An engineer has one baseline

    Example: Setting a second
      Given an engineer has a baseline
      When they set another
      Then it's refused, and their baseline is unchanged

  # docket:verifies rule:availability/adjustments-never-overlap
  Rule: An engineer's adjustments never cover the same week

    Example: Overlapping
      Given an engineer has adjusted 2 weeks from next week
      When they adjust the second of those weeks again as a separate adjustment
      Then it's refused

    Example: Back to back
      Given an engineer has adjusted 2 weeks from next week
      When they adjust the week right after
      Then both adjustments stand

  # docket:verifies rule:availability/removing-an-adjustment-restores-the-baseline
  Rule: Removing an adjustment returns its weeks to the baseline

    Example: Removing one
      Given an engineer offers 4 units a week and has adjusted next week to 0 units
      When they remove the adjustment
      Then next week offers 4 units

  # docket:verifies rule:availability/availability-comes-in-quarter-weeks
  Rule: Availability is offered in whole weeks, in quarters of a week

    Scenario Outline: What's refused
      When an engineer adjusts <weeks> weeks from a <day> to <units> units
      Then it's refused

      Examples:
        | weeks | day     | units |
        | 1     | Tuesday | 2     |
        | 1     | Monday  | 5     |
        | 53    | Monday  | 2     |

  # docket:verifies rule:availability/reductions-make-room-by-taking-blocks-out
  Rule: A reduction that leaves too little room takes blocks out

    Example: The engineer comes off their own block, and it stays for a teammate
      Given an engineer and a teammate each offer 4 units a week
      And the engineer is on a Core block scheduled for next week
      When the engineer sets next week to unavailable
      Then the block is still scheduled for next week, with nobody on it

    Example: A block the team can't fit goes back to its client
      Given an engineer is the only one on their team, offering 4 units a week
      And a client of the team has a Core block scheduled for next week, with nobody on it
      When the engineer sets next week to 1 unit
      Then the block is no longer scheduled

    Example: Checking first changes nothing
      Given an engineer is the only one on their team, offering 4 units a week
      And a client of the team has a Core block scheduled for next week, with nobody on it
      When the engineer checks what setting next week to unavailable would take out
      Then they're told the block would go back to its client
      And next week still offers 4 units

  # docket:verifies rule:availability/reductions-never-touch-started-work
  Rule: A reduction never takes out work that has started

    Example: A block in progress
      Given an engineer is on a block in progress next week
      When they set next week to unavailable
      Then it's refused

  # docket:verifies rule:availability/past-weeks-cant-change
  Rule: Weeks that have gone by can't be changed

    Example: Changing the baseline leaves past weeks as they were
      Given an engineer has offered 4 units a week since 2 weeks ago
      When they lower their baseline to 2 units
      Then last week offers 4 units
      And this week offers 2 units

    Example: Adjusting a past week
      Given an engineer has offered 4 units a week since 2 weeks ago
      When they adjust last week to 1 unit
      Then it's refused

    Example: Starting a baseline in the past
      Given an engineer has not set a baseline
      When they set one starting last week
      Then it's refused

    Example: Removing an adjustment that has begun
      Given an engineer has adjusted 3 weeks from last week to 1 unit
      When they remove the adjustment
      Then it's refused

    Example: Cutting back an adjustment under way
      Given an engineer offers 4 units a week
      And they have adjusted 3 weeks from last week to 1 unit
      When they end the adjustment after last week
      Then last week offers 1 unit
      And this week offers 4 units

    Example: Changing what an adjustment under way offers
      Given an engineer has adjusted 3 weeks from last week to 1 unit
      When they change the adjustment to 2 units
      Then it's refused

    Example: Carrying on an adjustment under way
      Given an engineer offers 4 units a week
      And they have adjusted 2 weeks from last week to 1 unit
      When they carry the adjustment on through next week
      Then next week offers 1 unit

    Example: Moving a baseline's start into the past
      Given an engineer offers 4 units a week from next week
      When they move its start to last week
      Then it's refused
