Feature: Payout accounts
  An engineer, and each partnership, keeps the one bank account their payouts go to.

  # docket:verifies rule:one-payout-account-per-person@pay
  Rule: A person has at most one payout account, and a new one replaces it

    Example: Adding a first account
      Given an engineer has no payout account
      When they add a bank account
      Then it is their payout account

    Example: Changing their account
      Given an engineer has a payout account
      When they change it to another bank account
      Then the new one is their payout account
      And they have only that account

  # docket:verifies rule:a-partnerships-payout-account-is-its-own@pay
  Rule: A partnership's payout account is its own

    Example: A partnership's account is apart from its manager's
      Given Grace has a payout account of their own
      And Grace manages a partnership with no payout account
      When Grace adds a bank account for the partnership
      Then the partnership has that payout account
      And Grace's own payout account is unchanged

    Example: Each partnership someone manages is set up on its own
      Given Grace manages two partnerships with no payout account
      When Grace adds a bank account for one of them
      Then the other still has no payout account

  # docket:verifies rule:removing-a-payout-account@pay
  Rule: A payout account can be removed, except while a payout is on its way to it

    Example: Removing their account
      Given an engineer has a payout account
      When they remove it
      Then they have no payout account

    Example: A payout still on its way
      Given an engineer has a payout account
      And a payout to it is still on its way to their bank
      When they try to remove it
      Then they're told to wait until it has arrived
      And they still have their payout account

    Example: A partnership's payout still on its way
      Given Grace's partnership has a payout account
      And a payout to it is still on its way to its bank
      When Grace tries to remove it
      Then she's told to wait until it has arrived
      And the partnership still has its payout account

  # docket:verifies rule:seeing-whether-an-account-can-be-paid@pay
  Rule: A person sees whether their account can be paid, and what to fix if not

    Example: An account being verified
      Given an engineer's payout account is still being verified
      When they look at their payout account
      Then they see it can't be paid until it's verified

    Example: An account that needs attention
      Given an engineer's payout account needs something fixed
      When they look at their payout account
      Then they see what needs fixing

    Example: A partnership's account that needs attention
      Given Grace's partnership's payout account needs something fixed
      When Grace looks at the partnership's payout account
      Then she sees what needs fixing

  # docket:verifies rule:payout-accounts-stay-private-to-their-owner@pay
  Rule: People see and change only their own payout account

    Example: Looking at their account
      Given two engineers each have a payout account
      When one looks at their payout account
      Then they see only their own

    Example: Removing their account leaves others alone
      Given two engineers each have a payout account
      When one removes their payout account
      Then the other engineer still has theirs

  # docket:verifies rule:manager-controls-the-partnerships-payout-account@pay
  Rule: Only a partnership's manager sets up, sees or changes its payout account

    Example: Another partnership's manager
      Given Grace's partnership and Theo's each have a payout account
      When Theo looks at Grace's partnership's payout account
      Then it's refused

    Example: An admin
      Given Grace's partnership has no payout account
      When an admin tries to add a bank account for Grace's partnership
      Then it's refused

  # docket:verifies rule:admins-see-only-payment-readiness@pay
  Rule: An admin sees whether an engineer can be paid, and nothing else about their account

    Example: An engineer who can be paid
      Given an engineer's payout account can be paid
      When an admin checks whether they can be paid
      Then the admin sees that they can
      And the admin sees no bank details

    Example: An engineer with no account
      Given an engineer has no payout account
      When an admin checks whether they can be paid
      Then the admin sees they have no payout account

    Example: Another engineer can't check
      Given two engineers each have a payout account
      When one checks whether the other can be paid
      Then it's refused

  # docket:verifies rule:limited-tokens-cant-reach-payout-accounts@pay
  Rule: A limited token can't reach its creator's payout account

    Example: Using a limited token
      Given an engineer has a payout account and a token limited to Acme
      When the token is used in Acme to look at their payout account
      Then it's refused

    Example: A partnership's account through a limited token
      Given Grace manages a partnership with a payout account, and has a token limited to Acme
      When the token is used in Acme to look at the partnership's payout account
      Then it's refused
