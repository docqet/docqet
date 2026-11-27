---
docqet: capability
id: conversation-spaces
name: Conversation spaces
description: >-
  A client's people and the Exalynt engineers who work with them talk about
  the work in a space of their own with the messaging provider, in Google Chat
  outside the app or with Stream inside it, and about each block in
  conversations they start there, each on a subject of its own.
stability: prototype
within: feature:working-together
solves: [problem:requests-go-unheard, problem:working-without-client-context]
included-in: [initiative:conversation-spaces]
follows:
  - rule:every-organization-has-a-space
  - rule:joining-an-organization-puts-you-in-its-space
  - rule:a-teams-engineers-are-in-its-clients-spaces
  - rule:spaces-follow-engineers-between-teams
  - rule:leaving-exalynt-takes-you-out-of-every-space
  - rule:clients-are-invited-and-some-can-only-be-emailed
  - rule:only-exalynt-sees-a-space-from-the-app
  - rule:a-space-outlasts-its-people
  - rule:conversations-start-by-hand-on-a-subject
  - rule:a-subject-is-used-once-on-a-block
  - rule:none-start-on-a-fulfilled-block
  - rule:anyone-at-the-client-or-on-a-team-supporting-it-starts-its-blocks-conversations
  - rule:a-blocks-conversations-are-for-its-client-and-the-teams-supporting-it
uses: [concept:space, concept:space-membership, concept:conversation]
gaps:
  - id: stream-messages-final
    name: Stream messages can't be edited or deleted
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      With Stream, nobody can edit or delete a message once it's sent. That
      matters when someone sends a message they need to take back.
  - id: nothing-retried
    name: Space membership changes never retried
    impact: damaging
    likelihood: unlikely
    reach: all
    description: >-
      Nothing is retried. If the messaging provider fails to put someone in a
      space, such as an engineer who just joined a client's team, they're
      asked to request access when they open its conversations, until a
      conversation is next started for that client, which puts everyone who
      belongs in the space. If it fails to take someone out, such as an
      engineer who left the team, they stay in the space and can keep reading
      it until they're taken out by hand. Starting a conversation says when it
      failed, and can be tried again.
tradeoffs:
  - id: stream-shows-gravatar
    name: Gravatar as the fallback photo on Stream
    description: >-
      With Stream, someone without an uploaded photo shows their Gravatar, as
      they do everywhere else in the app.
    drawback: >-
      Stream keeps a link made from a hash of their email address. That's only
      while Stream is the messaging provider.
decisions:
  - topic: Clients who can't join
    question: >-
      They're reached by email, outside the app. Whether anything should
      help with that is undecided.
---

## Includes

- The app keeps who belongs where in step with the messaging provider, and
  points at the conversations.
- Clients join their organization's space once they're in the organization:
  they're put in, or invited if the messaging provider requires it, without
  asking.
- Clients talk about any block from when it's bought.
- Engineers join the space of every client their team supports, without asking.
- Engineers see who is in a client's space: the client's people and Exalynt's,
  which of them leads a team, who has yet to accept an invitation, and who can't
  join and has to be emailed instead.
- Engineers see a block's conversations, how many messages each has, when the
  last came, and how many they haven't read, and open them: in the console with
  Stream, or in Google Chat.
- Team leads do everything an engineer can, for the clients their team supports.
- Admins do everything an engineer can, for every client.
