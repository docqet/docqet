Feature: Capacity purchasing
  Clients buy Engineering Capacity in blocks of a capacity type, to schedule
  now or later.

  Background:
    Given Acme and Globex are clients

  # docqet:verifies rule:blocks-stay-within-their-organization@capacity
  Rule: A client can't reach another organization's blocks

    Background:
      Given Acme and Globex are clients
      And Acme has a block
      And Globex has a block

    Example: Reading Acme's block
      When Globex reads Acme's block
      Then it isn't found

    Example: Globex's list never includes Acme's blocks
      When Globex lists its blocks
      Then Acme's block isn't among them

    Example: Scheduling Acme's block
      When Globex schedules Acme's block
      Then it isn't found

  # docqet:verifies rule:capacity-types-listed-smallest-first@capacity
  Rule: The capacity types are listed smallest first, each with a description

    Example: Listing the types
      When a client lists the capacity types
      Then they are Flex, Core and Dedicated, in that order
      And each has a description

  # docqet:verifies rule:buying-only-defined-capacity-types@capacity
  Rule: A client can only buy a defined capacity type

    Example: A type that doesn't exist
      When Acme buys a block of a type that doesn't exist
      Then the purchase is refused
      And Acme has no capacity and no invoices

  # docqet:verifies rule:capacity-is-never-shown-as-hours@capacity
  Rule: Capacity is shown in blocks and units, never as hours spent, reserved or remaining, or a price per hour

    Example: What a client reads
      Given Acme has a block
      When Acme reads its block and the capacity types
      Then nothing it reads is a count of hours or a price per hour

  # docqet:verifies rule:clients-never-choose-who-works@capacity
  Rule: Clients never choose who works a block

    Example: A client tries to put an engineer on a block
      Given Acme has a block
      When an Admin of Acme puts an engineer on the block
      Then it's refused

  # docqet:verifies rule:buying-before-having-a-team@capacity
  Rule: A client can buy before it has a team, and its blocks wait until it can schedule them

    Example: No team yet
      Given Acme has no team assigned
      When Acme buys a block
      Then the block is available and in no week

  # docqet:verifies rule:blocks-are-bought-then-scheduled@capacity
  Rule: A block is bought, then scheduled

    Example: From purchase to a week
      Given Acme has room in a week
      When Acme buys a block and schedules it into that week
      Then the block shows with that week in Acme's capacity

  # docqet:verifies rule:block-numbers-are-per-organization@capacity
  Rule: Blocks are numbered in turn within each organization, and keep their number

    Example: Several bought at once
      When Acme buys 3 blocks
      Then they are numbered BLK-0001, BLK-0002 and BLK-0003

    Example: The next purchase carries on
      Given Acme has bought 3 blocks
      When Acme buys a block
      Then it is numbered BLK-0004

    Example: Each organization starts from BLK-0001
      Given Acme has bought 3 blocks
      When Globex buys a block
      Then it is numbered BLK-0001

  # docqet:verifies rule:retrying-a-purchase-never-charges-twice@capacity
  Rule: Retrying a purchase never charges twice

    Example: Retrying one that went through
      Given Acme bought a Flex block
      When Acme retries that purchase
      Then Acme gets the same block back
      And Acme has one invoice, charged once

    Example: Retrying one that was charged but not recorded
      Given Acme's purchase of a Flex block was charged but not recorded
      When Acme retries that purchase
      Then Acme has the block on one invoice, charged once

    Example: A retry that asks for something different
      Given Acme bought a Flex block
      When Acme retries that purchase asking for 2 blocks
      Then the retry is refused
      And Acme still has one block, charged once

    Example: A second purchase on purpose
      Given Acme bought a Flex block
      When Acme buys another Flex block
      Then Acme has two blocks on two invoices

    Example: Retrying one whose invoice was voided
      Given Acme bought a Flex block
      And Exalynt voided its invoice
      When Acme retries that purchase
      Then the retry is refused
      And Acme was charged only once

    Example: Retrying one still under way
      Given Acme's purchase of a Flex block is still under way
      When Acme retries that purchase
      Then the retry is refused

    Example: Another organization's attempt is its own
      Given Acme bought a Flex block
      When Globex makes a purchase marked the same way as Acme's
      Then Globex gets a block of its own, charged to Globex
