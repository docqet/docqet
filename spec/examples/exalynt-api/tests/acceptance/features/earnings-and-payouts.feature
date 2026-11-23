Feature: Earnings and payouts
  A fulfilled block's capacity payout basis is shared out to its engineer,
  their available teammates, their team lead, and the partnership that
  introduced the client, each paid to their own payout account.

  # docket:verifies rule:earnings-and-payouts/shares-earned-at-fulfillment
  Rule: A block's shares are earned when it's fulfilled, and not before

    Example: Started, not yet fulfilled
      Given Ada has started a Core block of Acme's
      When Ada reads her earnings
      Then her engineer share of the block isn't earned yet

    Example: Fulfilled
      Given Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then her engineer share of the block is earned

  # docket:verifies rule:earnings-and-payouts/payout-basis-per-capacity-unit rule:earnings-and-payouts/coupons-never-change-shares
  Rule: A block's payout basis is its capacity units × $1,750, and its price never enters it

    Scenario Outline: <type> block
      Given Ada's <type> block of Acme's, bought for <price>, has been fulfilled
      When Ada reads her earnings
      Then the block's payout basis is <basis>

      Examples:
        | type      | price  | basis  |
        | Flex      | $2,000 | $1,750 |
        | Core      | $3,750 | $3,500 |
        | Dedicated | $7,000 | $7,000 |

  # docket:verifies rule:earnings-and-payouts/engineer-earns-the-engineer-share
  Rule: The engineer on a block when it's fulfilled earns the Engineer Share of their Engineer Agreement

    Example: A Core block
      Given Ada's Engineer Agreement has an Engineer Share of 60%
      And Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then she earns $2,100 in US dollars as the block's engineer

    Example: Another share
      Given Ada's Engineer Agreement has an Engineer Share of 62.5%
      And Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then she earns $2,187.50 in US dollars as the block's engineer

  # docket:verifies rule:earnings-and-payouts/team-leads-earn-team-lead-share
  Rule: The engineer's team lead earns the Team Lead Share of their own agreement, but not on their own block

    Example: A Core block
      Given Lena leads Ada's team
      And Lena's Engineer Agreement has a Team Lead Share of 5%
      And Ada's Core block of Acme's has been fulfilled
      When Lena reads her earnings
      Then she earns $175 as team lead on Ada's block

    Example: Not on their own block
      Given Lena leads Ada's team
      And Lena's Engineer Agreement has a Team Lead Share of 5%
      And Lena's Core block of Acme's has been fulfilled
      When Lena reads her earnings
      Then her only share of her block is as its engineer

  # docket:verifies rule:earnings-and-payouts/available-teammates-earn-team-support-share
  Rule: Each available teammate earns the Team Support Share of their own agreement

    Background:
      Given Lena leads Ada's team, with Ben and Kai on it

    Example: A teammate with availability in the block's week
      Given Ben's Engineer Agreement has a Team Support Share of 3%
      And Ben has availability in the block's week
      And Ada's Core block of Acme's has been fulfilled
      When Ben reads his earnings
      Then he earns $105 as team support on Ada's block

    Example: A teammate without availability that week
      Given Kai's Engineer Agreement has a Team Support Share of 3%
      And Kai has no availability in the block's week
      And Ada's Core block of Acme's has been fulfilled
      When Kai reads his earnings
      Then he earns nothing on Ada's block

    Example: The lead doesn't also earn team support
      Given Lena's Engineer Agreement has a Team Support Share of 3%
      And Lena has availability in the block's week
      And Ada's Core block of Acme's has been fulfilled
      When Lena reads her earnings
      Then her only share of Ada's block is as team lead

  # docket:verifies rule:earnings-and-payouts/unlisted-shares-earn-nothing
  Rule: A share someone's agreement in effect doesn't list, or having none in effect, earns them nothing

    Example: No agreement in effect
      Given Ada has no Engineer Agreement in effect
      And Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then she earns nothing on her block

    Example: Fulfilled before accepting one, and forfeited
      Given Ada has no Engineer Agreement in effect
      And Ada's Core block of Acme's has been fulfilled
      When Ada accepts her Engineer Agreement
      And Ada reads her earnings
      Then she earns nothing on her block

    Example: No Team Lead Share listed
      Given Lena leads Ada's team
      And Lena's Engineer Agreement lists no Team Lead Share
      And Ada's Core block of Acme's has been fulfilled
      When Lena reads her earnings
      Then she earns nothing on Ada's block

    Example: An Engineer Agreement with no Commercial Terms
      Given Ada's Engineer Agreement has no Commercial Terms
      And Ada's Core block of Acme's has been fulfilled
      When Ada reads her earnings
      Then she earns nothing on her block

    Example: Nothing to come from a block not yet fulfilled
      Given Ada's Engineer Agreement has no Commercial Terms
      And Ada has started a Core block of Acme's
      When Ada reads her earnings
      Then she earns nothing on her block

    Example: A team lead whose agreement has no Commercial Terms
      Given Lena leads Ada's team
      And Lena's Engineer Agreement has no Commercial Terms
      And Ada's Core block of Acme's has been fulfilled
      When Lena reads her earnings
      Then she earns nothing on Ada's block

    Example: A Partner Agreement with no Commercial Terms
      Given Grace's Partner Agreement has no Commercial Terms
      And Acme, attributed to Grace's partnership, has bought a Core block
      When Ada marks it fulfilled
      Then Grace's partnership earns nothing on it

  # docket:verifies rule:earnings-and-payouts/shares-dont-reduce-each-other rule:earnings-and-payouts/unclaimed-shares-stay-with-exalynt rule:earnings-and-payouts/exalynt-bears-partnership-earnings
  Rule: Each share is worked out on its own, so no share reduces another

    Example: Every share on one block
      Given Lena leads Ada's team, with Ben and Kai on it
      And Ben and Kai have availability in the block's week
      And Ada's Core block of Acme's has been fulfilled
      Then Ada earns $2,100, Lena $175, Ben $105 and Kai $105 on it

    Example: With a partnership
      Given Lena leads Ada's team
      And Grace's Partner Agreement has a Referral Share of 5%
      And Acme, attributed to Grace's partnership, has bought a Core block
      When Ada marks it fulfilled
      Then Ada earns $2,100, Lena $175, and Grace's partnership $175 on it

  # docket:verifies rule:earnings-and-payouts/partnership-share-earned-at-fulfillment rule:earnings-and-payouts/partnerships-earn-under-their-agreement-in-effect rule:earnings-and-payouts/partnership-share-of-payout-basis rule:earnings-and-payouts/unfulfilled-capacity-earns-partnerships-nothing
  Rule: A partnership earns the Referral Share of its Partner Agreement on its client's blocks, once each is fulfilled

    Background:
      Given Grace's Partner Agreement has a Referral Share of 5%

    Example: Fulfilled
      Given Acme, attributed to Grace's partnership, has bought a Core block
      When Ada marks it fulfilled
      Then Grace's partnership earns $175 on it

    Example: Not fulfilled yet
      Given Acme, attributed to Grace's partnership, has bought a Core block
      And Ada has started it
      When Grace reads the partnership's earnings
      Then the partnership's share of the block isn't earned yet

    Example: No Partner Agreement in effect
      Given Grace's partnership has no Partner Agreement in effect
      And Acme, attributed to Grace's partnership, has bought a Core block
      When Ada marks it fulfilled
      Then Grace's partnership earns nothing on it

  # docket:verifies rule:earnings-and-payouts/each-share-rounds-on-its-own
  Rule: Each share rounds on its own

    Example: A share that falls on half a cent
      Given Grace's Partner Agreement has a Referral Share of 2.25%
      And Acme, attributed to Grace's partnership, has bought a Flex block
      When Ada marks it fulfilled
      Then Grace's partnership earns $39.38 on it

  # docket:verifies rule:earnings-and-payouts/engineering-capacity-is-the-only-basis
  Rule: A partnership earns on every kind of Engineering Capacity its clients buy

    Scenario Outline: A <type> block
      Given Grace's Partner Agreement has a Referral Share of 5%
      And Acme, attributed to Grace's partnership, has bought a <type> block
      When Ada marks it fulfilled
      Then Grace's partnership earns <amount> on it

      Examples:
        | type      | amount |
        | Flex      | $87.50 |
        | Core      | $175   |
        | Dedicated | $350   |

  # docket:verifies rule:earnings-and-payouts/attribution-at-purchase-decides-the-partnership
  Rule: A block earns for the partnership its client was attributed to when it bought the block

    Background:
      Given Grace's Partner Agreement has a Referral Share of 5%

    Example: Moved after buying
      Given Acme, attributed to Grace's partnership, has bought a Core block
      And an admin has since moved Acme to Theo's partnership
      When Ada marks it fulfilled
      Then Grace's partnership earns $175 on it
      And Theo's partnership earns nothing on it

    Example: Attributed after buying
      Given Acme has bought a Core block while attributed to no partnership
      And an admin has since attributed Acme to Grace's partnership
      When Ada marks it fulfilled
      Then Grace's partnership earns nothing on it

  # docket:verifies rule:earnings-and-payouts/earning-window-opens-at-first-purchase rule:earnings-and-payouts/earning-windows-never-reset-or-pause
  Rule: A client's earning window opens at the first block it buys while attributed to the partnership, and lasts as long as the partnership's Earning Window

    Background:
      Given Grace's Partner Agreement has a Referral Share of 5% and an Earning Window of 12 months

    Example: Bought inside the window, fulfilled after it closes
      Given Acme was attributed to Grace's partnership on January 10, 2025
      And Acme bought a block on February 1, 2025
      And Acme bought a Core block on January 31, 2026
      When Ada marks it fulfilled
      Then Grace's partnership earns $175 on it

    Example: Bought after the window closes
      Given Acme was attributed to Grace's partnership on January 10, 2025
      And Acme bought a block on February 1, 2025
      And Acme bought a Core block on February 1, 2026
      When Ada marks it fulfilled
      Then Grace's partnership earns nothing on it

    Example: Blocks bought before attribution don't open the window
      Given Acme bought a block on March 1, 2024
      And Acme was attributed to Grace's partnership on January 10, 2025
      And Acme bought a block on February 1, 2025
      And Acme bought a Core block on January 31, 2026
      When Ada marks it fulfilled
      Then Grace's partnership earns $175 on it

    Example: No time limit
      Given Grace's Partner Agreement has a Referral Share of 5% and no Earning Window
      And Acme was attributed to Grace's partnership on January 10, 2023
      And Acme bought a block on February 1, 2023
      And Acme bought a Core block on February 1, 2026
      When Ada marks it fulfilled
      Then Grace's partnership earns $175 on it

  # docket:verifies rule:earnings-and-payouts/partners-see-only-their-partnerships-earnings
  Rule: A partner sees only their own partnership's earnings

    Example: Two partnerships
      Given Grace's partnership and Theo's have each earned on a block
      When Grace reads the partnership's earnings
      Then she sees her partnership's earning, with its client, block, basis, percentage and amount
      And nothing Theo's partnership earned
