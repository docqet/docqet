Feature: Staffing
  Each scheduled block gets one engineer: an eligible engineer claims it from
  the client's shared queue, or an admin assigns it.

  # docqet:verifies rule:listing-an-engineers-blocks
  Rule: The blocks an engineer is on can be listed across every client, and narrowed to a range of weeks

    Background:
      Given Ada is on a block of Acme's in the week of June 1
      And Ada is on a block of Globex's in the week of June 15
      And Ben is on another block of Acme's

    Example: Every block they're on
      When Exalynt lists the blocks Ada is on
      Then Ada's two blocks are listed
      And Ben's isn't

    Example: A range of weeks
      When Exalynt lists the blocks Ada is on from the week of June 1 to the week of June 7
      Then only Ada's block for Acme is listed

  # docqet:verifies rule:claiming-staffs-the-block-directly
  Rule: Claiming puts the engineer straight on the block, with no team-held step in between

    Example: Claiming an open block
      Given Ada is on a team assigned to Acme, offering 2 units in the week of June 1
      And Acme has a 1-unit block in the week of June 1 that nobody's on
      When Ada claims the block
      Then Ada is on the block
      And it's among the blocks Ada is on

  # docqet:verifies rule:claiming-requires-eligibility
  Rule: An engineer must be eligible to claim a block: on a team assigned to its client

    Example: A team that doesn't support the client
      Given Ben is on a team that isn't assigned to Acme
      And Acme has a 1-unit block in the week of June 1 that nobody's on
      When Ben tries to claim the block
      Then the claim is refused
      And nobody is on the block

  # docqet:verifies rule:claims-must-fit-availability
  Rule: A block can't be claimed by an engineer whose availability that week can't fit it alongside what they already have

    Example: Their week is full
      Given Ada is on a team assigned to Acme, offering 1 unit in the week of June 1
      And Ada is on a 1-unit block of Acme's in the week of June 1
      And Acme has another 1-unit block in the week of June 1 that nobody's on
      When Ada tries to claim the block
      Then the claim is refused
      And nobody is on the block

    Example: Another client's blocks count too
      Given Ada is on a team assigned to Acme, offering 2 units in the week of June 1
      And Ada is on a 1-unit block of Globex's in the week of June 1
      And Acme has a 2-unit block in the week of June 1 that nobody's on
      When Ada tries to claim the block
      Then the claim is refused

  # docqet:verifies rule:no-claiming-an-assigned-block
  Rule: An engineer can't claim a block someone else is on

    Example: Another engineer is on it
      Given Ada is on a team assigned to Acme, offering 2 units in the week of June 1
      And another engineer is on Acme's 1-unit block in the week of June 1
      When Ada tries to claim the block
      Then the claim is refused
      And the other engineer is on the block

  # docqet:verifies rule:late-claims-during-the-preferred-week
  Rule: A block nobody's on can still be claimed during its week

    Example: Claiming late
      Given Ada is on a team assigned to Acme, offering 2 units a week
      And Acme has a 1-unit block this week that nobody's on
      When Ada claims the block
      Then Ada is on the block

  # docqet:verifies rule:lapsed-blocks-must-be-moved-first
  Rule: Once its week ends, a block nobody's on can't be claimed until it's moved

    Example: Its week has ended
      Given Ada is on a team assigned to Acme, offering 2 units a week
      And Acme has a 1-unit block last week that nobody's on
      When Ada tries to claim the block
      Then the claim is refused
      And nobody is on the block

  # docqet:verifies rule:unclaiming-before-the-week-starts
  Rule: An engineer can unclaim a block they're on until its week starts

    Example: Unclaiming before the week starts
      Given Ada is on a team assigned to Acme, offering 2 units in the week of June 1
      And Ada is on a 1-unit block of Acme's in the week of June 1
      When Ada unclaims the block
      Then nobody is on the block
      And it's no longer among the blocks Ada is on

    Example: Its week has started
      Given Ada is on a team assigned to Acme, offering 2 units a week
      And Ada is on a 1-unit block of Acme's this week
      When Ada tries to unclaim the block
      Then the unclaim is refused
      And Ada is on the block

    Example: Someone else's block
      Given Ada is on a team assigned to Acme, offering 2 units in the week of June 1
      And another engineer is on Acme's 1-unit block in the week of June 1
      When Ada tries to unclaim the block
      Then the unclaim is refused
      And the other engineer is on the block

  # docqet:verifies rule:warned-before-stranding-another-block
  Rule: An engineer is told before claiming a block that leaves another of that week's blocks with nobody who can take it

    Background:
      Given Ada's team supports Acme and Globex, and Ben's team supports only Globex
      And Acme has a 4-unit block next week that nobody's on
      And Globex has a 4-unit block next week that nobody's on

    Example: Checking first
      When Ada checks what claiming Globex's block would leave
      Then she's told Acme's block would have nobody who can take it
      And nobody is on Globex's block

    Example: Claiming it anyway
      When Ada claims Globex's block
      Then Ada is on Globex's block
      And Acme's block is still scheduled next week, with nobody on it

  # docqet:verifies rule:leaving-a-clients-teams-releases-its-upcoming-blocks
  Rule: An engineer who leaves a client's teams comes off its blocks whose week hasn't started

    Example: Removed from the team
      Given Ada is on a team assigned to Acme, offering 2 units a week
      And Ada is on a 1-unit block of Acme's next week
      When Ada is taken off her team
      Then nobody is on the block
      And it's still scheduled next week

    Example: Moved to a team that doesn't support the client
      Given Ada is on a team assigned to Acme, offering 2 units a week
      And Ada is on a 1-unit block of Acme's next week
      When Ada is moved to a team that isn't assigned to Acme
      Then nobody is on the block

    Example: The client leaves the team
      Given Ada is on a team assigned to Acme, offering 2 units a week
      And Ada is on a 1-unit block of Acme's next week
      When Acme is unassigned from Ada's team
      Then nobody is on the block

    Example: Its week has started
      Given Ada is on a team assigned to Acme, offering 2 units a week
      And Ada is on a 1-unit block of Acme's this week
      When Ada is taken off her team
      Then Ada is on the block
