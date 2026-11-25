Feature: Estimates
  An estimate is Exalynt's planning aid for what a project might take: an
  ordered list of Focuses, each sized S, M, L, or XL and planned at a pace,
  one block type, adding up to a range of capacity units and, at its price
  for each block type, a cost on that block. It is not a quote.

  Background:
    Given capacity costs $2,500 a unit on Flex, $2,375 on Core, and $2,250 on Dedicated
    And Acme and Globex are clients

  # docket:verifies rule:focus-sizes-and-block-prices@capacity
  Rule: A Focus's size spans a range of units, and each block type prices them

    Scenario Outline: One sized Focus
      When an admin writes an estimate with one Focus sized <size>
      Then the estimate comes to <low>, <mid>, or <high> units
      And on <block> it costs <low cost>, <mid cost>, or <high cost>

      Examples:
        | size | block     | low | mid | high | low cost | mid cost | high cost |
        | S    | Flex      | 1   | 2   | 3    | $2,500   | $5,000   | $7,500    |
        | M    | Dedicated | 3   | 4   | 6    | $6,750   | $9,000   | $13,500   |
        | L    | Core      | 6   | 8   | 12   | $14,250  | $19,000  | $28,500   |
        | XL   | Dedicated | 12  | 16  | 24   | $27,000  | $36,000  | $54,000   |

    Example: Focuses add up
      When an admin writes an estimate with Focuses sized S and M
      Then the estimate comes to 4, 6, or 9 units
      And on Dedicated it costs $9,000, $13,500, or $20,250

    Example: An unsized Focus counts but adds nothing
      When an admin writes an estimate with a Focus sized S and an unsized Focus
      Then the estimate has 2 Focuses, 1 of them unsized
      And it comes to 1, 2, or 3 units

  # docket:verifies rule:each-focus-has-its-own-pace@capacity
  Rule: Each Focus is planned at a pace, and the estimate costs every Focus at its own

    Example: Focuses at different paces
      When an admin writes an estimate with a Focus sized S on Flex and one sized M on Dedicated
      Then at its paces it costs $9,250, $14,000, or $21,000

    Example: A Focus written without a pace
      When an admin writes an estimate with one Focus sized S and no pace
      Then the Focus is planned on Dedicated

  # docket:verifies rule:discounts-apply-to-the-whole-project@capacity
  Rule: A discount takes a percentage off the whole project

    Background:
      Given an admin wrote an estimate with a Focus sized S on Flex and one sized M on Dedicated

    Example: One discount
      When the admin gives it 20% off
      Then at its paces it costs $7,400, $11,200, or $16,800

    Example: Discounts add up
      When the admin gives it 20% off and 10% off
      Then at its paces it costs $6,475, $9,800, or $14,700

    Example: Discounts can't add up to more than 100%
      When the admin gives it 60% off and 50% off
      Then the estimate is as it was

  # docket:verifies rule:estimates-keep-their-original-prices@capacity
  Rule: An estimate keeps the prices it was written at

    Example: Prices rise after an estimate is written
      Given an admin wrote an estimate with one Focus sized M
      When Dedicated rises to $2,500 a unit
      Then on Dedicated it still costs $6,750, $9,000, or $13,500

  # docket:verifies rule:estimates-record-their-author@capacity
  Rule: An estimate records who wrote it

    Example: An admin writes an estimate
      When Alex, an admin, writes an estimate for Acme
      Then the estimate says Alex wrote it

  # docket:verifies rule:replacing-replaces-everything@capacity
  Rule: Replacing an estimate replaces all of it

    Example: Focuses left out are dropped, and those kept are changed
      Given an admin wrote an estimate for Acme with Focuses "Sign in" sized M and "Reports" sized S
      When the admin replaces it with only "Reports", now sized L
      Then the estimate has only "Reports", sized L
      And it comes to 6, 8, or 12 units

  # docket:verifies rule:clients-read-only-their-own-estimates@capacity
  Rule: A client reads their own organization's estimates and no one else's

    Example: A client lists estimates
      Given an admin wrote an estimate for Acme, one for Globex, and one for a prospect
      When a member of Acme lists estimates
      Then they see only Acme's

    Example: A client opens another organization's estimate
      Given an admin wrote an estimate for Globex
      When a member of Acme opens it
      Then there's no such estimate

  # docket:verifies rule:only-exalynt-writes-estimates@capacity
  Rule: Only Exalynt writes, changes, and deletes estimates

    Scenario Outline: A client member tries to <action>
      Given an admin wrote an estimate for Acme
      When a member of Acme tries to <action>
      Then they aren't allowed
      And Acme's estimate is as it was

      Examples:
        | action                     |
        | write an estimate for Acme |
        | change Acme's estimate     |
        | delete Acme's estimate     |

  # docket:verifies rule:engineers-work-on-supported-clients-estimates@capacity
  Rule: An engineer works on the estimates of the clients their team supports

    Background:
      Given Sam is an engineer on a team that supports Acme

    Example: An engineer writes an estimate for a client their team supports
      When Sam writes an estimate for Acme
      Then Acme has the estimate

    Scenario Outline: An engineer can't reach <whose> estimate
      Given an admin wrote an estimate for <whom>
      When Sam opens it
      Then there's no such estimate

      Examples:
        | whose            | whom       |
        | another client's | Globex     |
        | a prospect's     | a prospect |

    Example: An engineer can't move an estimate to a client their team doesn't support
      Given an admin wrote an estimate for Acme
      When Sam moves it to Globex
      Then there's no such estimate
      And it's still Acme's

    Example: Only an admin writes an estimate for a prospect
      When Sam writes an estimate for a prospect
      Then no estimate is written

  # docket:verifies rule:prospects-see-estimates-once-attached@capacity
  Rule: A prospect sees their estimate only once it's attached to their organization

    Example: Before it's attached
      Given an admin wrote an estimate for a prospect, Initech
      And Initech has signed up as a client
      When a member of Initech lists estimates
      Then they see none

    Example: Once it's attached
      Given an admin wrote an estimate for a prospect, Initech
      And Initech has signed up as a client
      When the admin attaches the estimate to Initech
      Then a member of Initech can open it

  # docket:verifies rule:deleting-an-estimate-is-permanent@capacity
  Rule: Deleting an estimate is permanent

    Example: An admin deletes an estimate
      Given an admin wrote an estimate for Acme
      When the admin deletes it
      Then nobody can open it, the admin included

  # docket:verifies rule:estimates-are-for-organizations-or-prospects@capacity
  Rule: An estimate is for an existing organization, or for a prospect

    Example: An organization that doesn't exist
      When an admin writes an estimate for an organization that doesn't exist
      Then no estimate is written

  # docket:verifies rule:a-focus-belongs-to-one-estimate@capacity
  Rule: A Focus belongs to one estimate

    Example: Reusing another estimate's Focus
      Given an admin wrote an estimate for Acme with a Focus "Sign in"
      When the admin writes another estimate with that same Focus
      Then no estimate is written
      And the first estimate still has "Sign in"

  # Not business rules: unit tests, if the feature's level calls for them.
  #   - An estimate can't list the same Focus twice.
  #   - A note in an estimate must say something.
