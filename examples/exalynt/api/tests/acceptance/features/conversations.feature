Feature: Conversations
  The engineers working a block talk with its client about it in the
  client's space, with the messaging provider, in conversations they start
  by hand, each on a subject of its own. What's said stays with the provider.

  # docqet:verifies rule:conversations-start-by-hand-on-a-subject
  Rule: Conversations start by hand, on a subject

    Example: A block bought has none
      When Acme buys a block
      Then the block has no conversations

    Example: Starting one
      Given Ada is on a block of Acme's this week
      When Ada starts a conversation on it about "Rate file format"
      Then the block has a conversation about "Rate file format"
      And it's started in Acme's space

    Example: Another subject
      Given Ada has started a conversation on her block of Acme's about "Rate file format"
      When Ada starts a conversation on it about "Test data"
      Then the block has conversations about "Rate file format" and "Test data"

  # docqet:verifies rule:a-subject-is-used-once-on-a-block
  Rule: A subject is used once on a block

    Example: The same subject again
      Given Ada has started a conversation on her block of Acme's about "Rate file format"
      When Ada starts a conversation on it about "rate file format"
      Then it's refused as a subject already used

    Example: A subject used before the messaging provider changed
      Given Ada started a conversation on her block of Acme's about "Rate file format" with the previous messaging provider
      When Ada starts a conversation on it about "Rate file format"
      Then the block has a conversation about "Rate file format"
      And the block's conversations are only those about "Rate file format"

  # docqet:verifies rule:none-start-on-a-fulfilled-block
  Rule: None start on a fulfilled block

    Example: Fulfilled
      Given Ada has marked her block of Acme's fulfilled
      When Ada starts a conversation on it about "Follow-up"
      Then it's refused as fulfilled

  # docqet:verifies rule:anyone-at-the-client-or-on-a-team-supporting-it-starts-its-blocks-conversations
  Rule: Anyone at the client, or on a team supporting it, starts its blocks' conversations

    Example: Someone at the client
      Given Ada is on a block of Acme's this week
      When a Member of Acme starts a conversation on it about "Kickoff"
      Then the block has a conversation about "Kickoff"

    Example: Someone else on Ada's team
      Given Ada is on a block of Acme's this week
      When Ben, on Ada's team, starts a conversation on it about "Kickoff"
      Then the block has a conversation about "Kickoff"

    Example: An engineer on a team that doesn't support Acme
      Given Ada is on a block of Acme's this week
      When Cy, on a team that doesn't support Acme, starts a conversation on it about "Kickoff"
      Then it isn't found

  # docqet:verifies rule:a-blocks-conversations-are-for-its-client-and-the-teams-supporting-it
  Rule: A block's conversations are for its client and the teams supporting it

    Example: The client
      Given Ada has started a conversation on her block of Acme's about "Rate file format"
      When a Member of Acme reads the block's conversations
      Then they see "Rate file format"

    Example: Another client
      Given Ada has started a conversation on her block of Acme's about "Rate file format"
      When Globex reads the block's conversations
      Then it isn't found
