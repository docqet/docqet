---
name: Conversation spaces
summary: >-
  A client's people and the Exalynt engineers who work with them talk about
  the work in a space of their own with the messaging provider, in Google Chat
  outside the app or with Stream inside it, and about each block in
  conversations they start there, each on a subject of its own.
stability: prototype
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-team-lead
  - exalynt-admin
rules:
  - conversation-spaces/every-organization-has-a-space
  - conversation-spaces/joining-an-organization-puts-you-in-its-space
  - conversation-spaces/a-teams-engineers-are-in-its-clients-spaces
  - conversation-spaces/spaces-follow-engineers-between-teams
  - conversation-spaces/leaving-exalynt-takes-you-out-of-every-space
  - conversation-spaces/clients-are-invited-and-some-can-only-be-emailed
  - conversation-spaces/only-exalynt-sees-a-space-from-the-app
  - conversation-spaces/a-space-outlasts-its-people
  - conversations/conversations-start-by-hand-on-a-subject
  - conversations/a-subject-is-used-once-on-a-block
  - conversations/none-start-on-a-fulfilled-block
  - conversations/anyone-at-the-client-or-on-a-team-supporting-it-starts-its-blocks-conversations
  - conversations/a-blocks-conversations-are-for-its-client-and-the-teams-supporting-it
concepts: [space, space-membership, conversation]
gaps:
  - id: behind-a-feature-flag
    text: >-
      A block's conversations show on its page only while the `conversations`
      feature flag is on: on in development, off in production. Who belongs in
      each space is still kept in step with the messaging provider either way.
  - id: not-connected-in-production
    text: >-
      Neither Google Chat nor Stream is connected in production yet, so nobody
      is really put in a space there, and a conversation can be started but
      not opened: it says it isn't connected.
  - id: google-chat-opens-the-whole-space
    text: >-
      In Google Chat, a conversation opens beside the rest of the client's
      space, with every other conversation on its blocks, not on its own.
  - id: where-clients-see-conversations
    text: >-
      With Google Chat, clients see a block's conversations only in Google
      Chat, not on their block page in the app. With Stream, they open them
      from their block page, which is still a prototype.
  - id: counts-read-on-opening
    text: >-
      A conversation's counts are read when its block's page opens, not as
      messages come in.
  - id: deleted-chats-still-shown
    text: A conversation deleted in Google Chat still shows on its block.
  - id: switching-providers-leaves-conversations
    text: >-
      Switching messaging providers leaves a block's earlier conversations
      behind: the block shows only those with the provider in use, and their
      subjects can be used again.
  - id: stream-names-changeable-outside
    text: >-
      With Stream, someone can change the name others see them by from outside
      the app. It's set back the next time they open a conversation.
  - id: stream-messages-final
    text: With Stream, nobody can edit or delete a message once it's sent.
  - id: stream-organization-missing-for-removed
    text: >-
      With Stream, each message shows the organization its writer is with,
      except for someone taken out of the client's space since, who shows
      with none.
  - id: stream-earlier-count-off
    text: >-
      With Stream, a conversation opens with its latest messages, and says how
      many came before. That count can be off by messages deleted in Stream.
  - id: nothing-retried
    text: >-
      Nothing is retried. If the messaging provider fails to put someone in a
      space, such as an engineer who just joined a client's team, they're
      asked to request access when they open its conversations, until a
      conversation is next started for that client, which puts everyone who
      belongs in the space. If it fails to take someone out, such as an
      engineer who left the team, they stay in the space and can keep reading
      it until they're taken out by hand. Starting a conversation says when it
      failed, and can be tried again.
  - id: older-organizations-not-with-provider
    text: >-
      Organizations from before conversation spaces have their space, but the
      messaging provider doesn't have it, with everyone who belongs in it,
      until someone joins it or a conversation is started in it.
  - id: accepted-invitations-show-invited
    text: >-
      Someone who accepts the messaging provider's invitation still shows as
      invited.
  - id: returning-people-not-put-back
    text: >-
      Someone unbanned, or made one of Exalynt's people again, isn't put back
      in the spaces they were taken out of.
  - id: reply-limit
    text: >-
      A conversation can't carry on past the most replies the messaging
      provider allows in one. Start another when it fills.
tradeoffs:
  - id: stream-shows-gravatar
    text: >-
      With Stream, someone without an uploaded photo shows their Gravatar, as
      they do everywhere else in the app.
    cost: Stream keeps a link made from a hash of their email address.
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
