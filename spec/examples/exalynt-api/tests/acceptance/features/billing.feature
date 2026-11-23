Feature: Billing
  Clients pay for the capacity they buy with their payment methods, and see
  the invoices each purchase creates and whether they've been paid.

  Background:
    Given Acme and Globex are clients
    And a Flex block costs $2,000

  # docket:verifies rule:billing/who-manages-billing
  Rule: Admins and Billing members manage billing on the payment provider's pages; Members don't

    Scenario Outline: Going to manage billing
      When a <role> of Acme goes to manage its billing
      Then they <outcome>

      Examples:
        | role    | outcome                          |
        | Admin   | are sent to the payment provider |
        | Billing | are sent to the payment provider |
        | Member  | are refused                      |

  # docket:verifies rule:billing/buying-requires-a-payment-method
  Rule: Capacity can't be bought without a payment method

    Example: No payment method
      Given Acme has no payment method
      When Acme buys a Flex block
      Then the purchase is refused for want of a payment method
      And Acme has no capacity and no invoices

    Example: A card but no default
      Given Acme has a card but no default
      When Acme buys a Flex block
      Then the purchase is refused for want of a payment method

  # docket:verifies rule:billing/buying-charges-at-once
  Rule: Buying charges the default payment method at once, on one invoice

    Example: Several blocks by card
      Given Acme's default is a card
      When Acme buys 3 Flex blocks
      Then Acme has one paid invoice for $6,000
      And its one line is 3 Flex blocks at $2,000
      And all 3 blocks are available to schedule

  # docket:verifies rule:billing/the-payment-provider-works-out-the-tax
  Rule: The payment provider works out a purchase's tax, and it's charged on the invoice

    Example: Tax at the client's address
      Given Acme's default is a card
      And the payment provider works out 10% tax at Acme's address
      When Acme buys 3 Flex blocks
      Then Acme has one paid invoice for $6,600
      And its tax is $600

  # docket:verifies rule:billing/purchases-are-quoted-with-their-tax
  Rule: A purchase is quoted with its tax before it's bought, and quoting buys nothing

    Example: Quoting 3 blocks
      Given Acme's default is a card
      And the payment provider works out 10% tax at Acme's address
      When Acme asks what 3 Flex blocks would cost
      Then it's quoted $6,000 and $600 tax, $6,600 in all
      And Acme has no capacity and no invoices

  # docket:verifies rule:billing/a-changed-total-buys-nothing
  Rule: A purchase whose total changed since it was quoted buys nothing and owes nothing

    Example: The tax changed after the quote
      Given Acme's default is a card
      And Acme was quoted $6,000 for 3 Flex blocks
      And the payment provider now works out 10% tax at Acme's address
      When Acme buys 3 Flex blocks for the $6,000 it was quoted
      Then the purchase is refused as changed since it was quoted
      And Acme has no capacity and no invoices

  # docket:verifies rule:billing/tax-needs-to-know-where-the-client-is
  Rule: Capacity can't be bought or quoted unless the payment provider can tell where the client is for tax

    Example: Buying
      Given Acme's default is a card
      But the payment provider can't tell where Acme is for tax
      When Acme buys a Flex block
      Then the purchase is refused for want of a billing address
      And Acme has no capacity and no invoices

    Example: Quoting
      Given Acme's default is a card
      But the payment provider can't tell where Acme is for tax
      When Acme asks what a Flex block would cost
      Then the purchase is refused for want of a billing address

  # docket:verifies rule:billing/declined-purchases-buy-nothing
  Rule: A declined purchase buys nothing and owes nothing

    Example: A declined card
      Given Acme's default card will be declined
      When Acme buys a Flex block
      Then the purchase is refused as declined
      And Acme has no capacity and no invoices

  # docket:verifies rule:billing/at-most-20-blocks-per-purchase
  Rule: At most 20 blocks can be bought at once

    Example: 21 blocks
      Given Acme's default is a card
      When Acme buys 21 Flex blocks
      Then the purchase is refused
      And Acme has no capacity and no invoices

  # docket:verifies rule:billing/paying-an-invoice-releases-its-capacity
  Rule: Unpaid capacity becomes usable once its invoice is paid

    Background:
      Given Acme has an unpaid invoice for a Flex block

    Example: Paying it on the payment provider's page
      When the invoice is paid on the payment provider's page
      Then the invoice is paid
      And the block is available to schedule

    Example: Exalynt voids it
      When Exalynt voids the invoice
      Then Acme no longer has the block

  # docket:verifies rule:billing/organizations-billing-stays-separate
  Rule: A client can't see or act on another organization's billing

    Background:
      Given Acme has a paid invoice

    Example: Reading an invoice
      When Globex reads Acme's invoice
      Then it isn't found

    Example: Managing billing
      When Globex goes to manage Acme's billing
      Then it isn't found

  # docket:verifies rule:billing/unpaid-invoices-are-paid-with-the-provider
  Rule: An unpaid invoice is paid at the payment provider's current page for it

    Example: Opening an unpaid invoice
      Given Acme has an unpaid invoice for a Flex block
      When a Billing member of Acme opens it
      Then they are sent to the payment provider's current page for it

  # docket:verifies rule:billing/company-details-stay-untouched
  Rule: Company details entered with the payment provider stay as the client left them

    Example: Renaming the organization
      Given Acme's billing name with the payment provider is "Acme Holdings Ltd"
      When Acme is renamed
      Then its billing name with the payment provider is still "Acme Holdings Ltd"

  # docket:verifies rule:billing/when-company-details-count-as-given
  Rule: Company details count as given once the payment provider holds the client's address

    Example: No address yet
      Given Acme has given the payment provider no address
      When Acme checks whether its company details are given
      Then they aren't

    Example: An address given
      Given Acme has given the payment provider its address
      When Acme checks whether its company details are given
      Then they are
