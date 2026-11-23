Feature: Payout schedule
  Earnings wait to be released, then go to each payee's payout account.

  # docket:verifies rule:payout-schedule/expected-pay-visible-from-assignment
  Rule: From assignment, people can see what a block will pay them

    Example: The engineer
      Given Ada is on a Core block of Acme's
      When Ada reads her earnings
      Then she sees $2,100 to come as the block's engineer

    Example: The lead and an available teammate
      Given Lena leads Ada's team, with Ben on it
      And Ben has availability in the block's week
      And Ada is on a Core block of Acme's
      Then Lena sees $175 to come as team lead on Ada's block
      And Ben sees $105 to come as team support on Ada's block

  # docket:verifies rule:payout-schedule/people-see-only-their-own-earnings
  Rule: People see only their own earnings

    Example: A lead reads their earnings
      Given Lena leads Ada's team
      And Ada's Core block of Acme's has been fulfilled
      When Lena reads her earnings
      Then she sees her team-lead share and not Ada's engineer share

  # docket:verifies rule:payout-schedule/each-earning-shows-where-it-stands
  Rule: Each earning shows where it stands, and earnings on hold say what to fix

    Example: Not yet fulfilled
      Given Ada is on a Core block of Acme's
      When Ada reads her earnings
      Then her earnings from the block aren't earned yet

    Example: Earned, with an account that can be paid
      Given Ada's payout account can be paid
      And Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then her earnings from the block are earned and waiting to be sent

    Example: Earned, with no payout account
      Given Ada has no payout account
      And Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then her earnings from the block are on hold until she adds a payout account

    Example: Earned, with an account that needs attention
      Given Ada's payout account needs something fixed
      And Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then her earnings from the block are on hold, saying what needs fixing

  # docket:verifies rule:payout-schedule/earnings-are-paid-out-when-approved
  Rule: Exalynt aims for weekly payouts, each covering all unsent earnings fulfilled by the end of the previous Sunday, UTC

    Example: Fulfilled in time
      Given it's Wednesday 11 November
      And Ada's Core block of Acme's was fulfilled on Sunday 8 November
      And Ada's payout account can be paid
      When an admin reads the payouts waiting to be released
      Then Ada is due $2,100

    Example: Fulfilled after the cutoff
      Given it's Wednesday 11 November
      And Ada's Core block of Acme's was fulfilled on Monday 9 November
      And Ada's payout account can be paid
      When an admin reads the payouts waiting to be released
      Then Ada isn't due anything

    Example: A week nobody released
      Given it's Wednesday 11 November
      And Ada's Core block of Acme's was fulfilled on Sunday 1 November
      And no payouts have been released since
      And Ada's payout account can be paid
      When an admin reads the payouts waiting to be released
      Then Ada is due $2,100

  # docket:verifies rule:payout-schedule/admins-release-payouts
  Rule: An admin sees and releases each run, and nothing is sent without that

    Example: Before release
      Given Ada is due $2,100
      When an admin reads the payouts waiting to be released
      Then nothing has been sent to Ada

    Example: On release
      Given Ada is due $2,100
      When an admin releases the payouts
      Then a payout of $2,100 is sent to Ada

  # docket:verifies rule:payout-schedule/one-payout-per-payee-per-run
  Rule: A payee gets one payout per run, covering any number of earnings

    Example: Two blocks and team support
      Given Ada is due $2,100 for each of two Core blocks of Acme's
      And Ada is due $105 as team support on Ben's block
      When an admin releases the payouts
      Then Ada receives one payout of $4,305
      And each line shows its block, client, basis, percentage, and amount

  # docket:verifies rule:payout-schedule/earnings-are-sent-only-once
  Rule: Earnings are only ever sent once

    Example: Releasing again
      Given Ada's earnings have been sent in a payout
      When an admin releases the payouts
      Then Ada receives no second payout for those earnings

  # docket:verifies rule:payout-schedule/payouts-go-to-the-current-account
  Rule: A payout goes to the payee's account when it's sent

    Example: The account changes before release
      Given Ada is due $2,100
      And Ada changes her payout account
      When an admin releases the payouts
      Then the payout goes to Ada's new account

    Example: The account changes after release
      Given Ada's payout has been sent to her account
      When Ada changes her payout account
      Then the sent payout still shows the account it went to

  # docket:verifies rule:payout-schedule/how-a-payouts-status-progresses
  Rule: A payout is Processing once sent, Paid when the payment provider posts it, and Failed if it's returned

    Example: Sent
      Given Ada's payout has been sent
      When Ada reads her payouts
      Then the payout is Processing

    Example: Posted
      Given Ada's payout has been sent
      When the payment provider posts it
      Then the payout is Paid

    Example: Returned after posting
      Given Ada's payout is Paid
      When the payment provider returns it because the bank refused it
      Then the payout is Failed and says why

  # docket:verifies rule:payout-schedule/payouts-are-in-us-dollars
  Rule: Payouts are sent in US dollars

    Example: A payee abroad
      Given Ada's payout account is in Germany
      When an admin releases the payouts
      Then the payout is sent in US dollars

  # docket:verifies rule:payout-schedule/earnings-show-payout-outcome
  Rule: Earnings show whether they're waiting, processing, paid, or failed

    Scenario Outline: Earnings follow their payout
      Given Ada's earnings are in a payout that is <payout status>
      When Ada reads her earnings
      Then her earnings show <earnings status>

      Examples:
        | payout status | earnings status |
        | Processing    | processing      |
        | Paid          | paid            |
        | Failed        | failed          |

    Example: Not yet in a payout
      Given Ada is due $2,100
      When Ada reads her earnings
      Then her earnings show waiting

  # docket:verifies rule:payout-schedule/who-sees-payout-status
  Rule: People see their own payouts, and an admin sees everyone's

    Example: Another engineer
      Given Ada's payout has been sent
      When Ben reads his payouts
      Then he doesn't see Ada's payout

    Example: An admin
      Given Ada's payout has been sent
      When an admin reads the payouts that have been sent
      Then they see Ada's payout

  # docket:verifies rule:earnings-and-payouts/partnerships-earn-without-a-payout-account rule:payout-schedule/earnings-wait-for-a-valid-account
  Rule: Earnings wait while their payee has no valid account, then go in the first payout after it's valid

    Example: No account
      Given Ada has no payout account
      And Ada's Core block of Acme's has been fulfilled
      When an admin reads the payouts waiting to be released
      Then Ada's earnings are listed on hold, with why

    Example: The account becomes valid
      Given Ada's earnings are on hold for want of a payout account
      And Ada's payout account can now be paid
      When an admin releases the payouts
      Then Ada receives a payout including those earnings

    Example: A partnership with no account
      Given Grace's partnership has no payout account
      And Grace's partnership is due $175
      When an admin reads the payouts waiting to be released
      Then Grace's partnership's earnings are listed on hold, with why

  # docket:verifies rule:payout-schedule/failed-payouts-are-sent-again
  Rule: A failed payout's earnings go out in a new payout, and the failed one says why and links to it

    Example: Sent again
      Given Ada's payout has failed
      And Ada's payout account can be paid
      When an admin releases the payouts
      Then Ada receives a new payout of those earnings
      And the failed payout says why it failed and links to the new one

  # docket:verifies rule:payout-schedule/canceled-payouts-leave-earnings-unsent
  Rule: A payout canceled before any money leaves is Canceled, and its earnings stay unsent

    Example: Canceled by the payment provider
      Given Ada's payout has been sent
      When the payment provider cancels it
      Then the payout is Canceled
      And its earnings are waiting to be sent again

  # docket:verifies rule:payout-schedule/no-minimum-payout
  Rule: There's no minimum payout

    Example: A small amount
      Given Ada's only earnings are $105 of team support
      When an admin releases the payouts
      Then Ada receives a payout of $105

  # docket:verifies rule:payout-schedule/earnings-are-paid-after-leaving
  Rule: Earnings are still paid after someone leaves

    Example: Left the team
      Given Ada is due $2,100
      And Ada has left her team
      When an admin releases the payouts
      Then a payout of $2,100 is sent to Ada

  # docket:verifies rule:payout-schedule/sent-payouts-never-change
  Rule: What a sent payout lists never changes

    Example: The payout basis changes afterward
      Given Ada's payout of $2,100 has been sent
      When the payout basis per capacity unit changes
      Then Ada's payout still lists $2,100

  # docket:verifies rule:earnings-and-payouts/earnings-belong-to-the-partnership rule:payout-schedule/partnership-earnings-are-paid-separately
  Rule: A partnership's earnings are its own, paid to its payout account and never its manager's

    Example: The manager is also an engineer
      Given Grace manages a partnership and has her own payout account as an engineer
      And Grace's partnership has a payout account of its own
      And Grace's partnership is due $175
      When an admin releases the payouts
      Then a payout of $175 is sent to Grace's partnership, to its own account
      And Grace receives no payout for it

  # docket:verifies rule:payout-schedule/partners-see-only-their-partnerships-payouts
  Rule: A partner sees only their own partnership's payouts, and an admin sees them without the account

    Example: Two partnerships
      Given Grace's partnership and Theo's have each been sent a payout
      When Grace reads the partnership's payouts
      Then she sees her partnership's payout, with the bank account it went to and the blocks it paid
      And nothing sent to Theo's partnership

    Example: An admin
      Given Grace's partnership has been sent a payout
      When an admin reads Grace's partnership's payouts
      Then they see the payout, without the bank account it went to
