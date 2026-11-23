Feature: Team assignment
  A new client is given a team as it signs up, so it can schedule its work
  without waiting on Exalynt. Exalynt can still change a client's teams.

  # docket:verifies rule:team-assignment/least-unfulfilled-capacity-wins
  Rule: A new client gets the team with the least unfulfilled capacity

    Example: One team has less unfulfilled
      Given Platform has an engineer offering time and 1 client
      And Platform's client has an unfulfilled Dedicated block
      And Data has an engineer offering time and 1 client
      And Data's client has an unfulfilled Flex block
      When a new client signs up
      Then the new client is given Data

    Example: Less unfulfilled capacity outweighs fewer clients
      Given Platform has an engineer offering time and 1 client
      And Platform's client has an unfulfilled Dedicated block
      And Data has an engineer offering time and 2 clients
      When a new client signs up
      Then the new client is given Data

    Example: Fulfilled capacity doesn't count
      Given Platform has an engineer offering time and 1 client
      And Platform's client has a fulfilled Dedicated block
      And Data has an engineer offering time and 1 client
      And Data's client has an unfulfilled Flex block
      When a new client signs up
      Then the new client is given Platform

    Example: A block with no week yet counts
      Given Platform has an engineer offering time and 1 client
      And Platform's client has a Dedicated block in no week
      And Data has an engineer offering time and 1 client
      And Data's client has an unfulfilled Flex block
      When a new client signs up
      Then the new client is given Data

    Example: A block whose payment hasn't cleared doesn't count
      Given Platform has an engineer offering time and 1 client
      And Platform's client has a Dedicated block awaiting payment
      And Data has an engineer offering time and 1 client
      And Data's client has an unfulfilled Flex block
      When a new client signs up
      Then the new client is given Platform

  # docket:verifies rule:team-assignment/fewest-clients-breaks-ties
  Rule: Between teams with as much unfulfilled capacity, it gets the one with the fewest clients

    Example: Clients who never bought anything
      Given Platform has an engineer offering time and 2 clients
      And Data has an engineer offering time and 1 client
      When a new client signs up
      Then the new client is given Data

  # docket:verifies rule:team-assignment/only-teams-offering-time-qualify
  Rule: Only a team with an engineer offering time in the coming weeks can be given

    Example: The emptiest team has no engineers
      Given Platform has no engineers and 0 clients
      And Data has an engineer offering time and 3 clients
      When a new client signs up
      Then the new client is given Data

    Example: The emptiest team's engineers offer no time
      Given Platform has an engineer offering no time and 0 clients
      And Data has an engineer offering time and 3 clients
      When a new client signs up
      Then the new client is given Data

  # docket:verifies rule:team-assignment/signing-up-without-a-team
  Rule: A new client signs up even when it can't be given a team, and waits for Exalynt to assign one

    Example: No team qualifies
      Given Platform has an engineer offering no time and 0 clients
      When a new client signs up
      Then the new client is signed up
      And the new client has no team

    Example: Assigning a team fails
      Given Platform has an engineer offering time and 0 clients
      And teams can't be assigned right now
      When a new client signs up
      Then the new client is signed up
      And the new client has no team
