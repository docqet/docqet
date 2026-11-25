Feature: Fulfillment
  A block's engineer starts it once its week begins, and marks it fulfilled
  when the work is done. Nobody else reviews it. A block can have a focus
  saying what its work is about.

  # docket:verifies rule:engineers-start-their-blocks-from-the-start-of-the-week@capacity
  Rule: A block's engineer starts it, from the start of its week

    Example: Its week has started
      Given Ada is on a block of Acme's this week
      When Ada starts it
      Then the block is in progress

    Example: Before its week
      Given Ada is on a block of Acme's next week
      When Ada starts it
      Then it's refused as not started yet
      And the block is scheduled

    Example: Someone else's block
      Given Ada is on a block of Acme's this week
      When Ben, on Ada's team, starts it
      Then it's refused

  # docket:verifies rule:engineers-mark-their-blocks-fulfilled@capacity
  Rule: A block's engineer marks it fulfilled

    Background:
      Given Ada has started a block of Acme's

    Example: Marking it fulfilled
      When Ada marks it fulfilled
      Then it's fulfilled

    Example: Someone else's block
      When Ben, on Ada's team, marks it fulfilled
      Then it's refused
      And the block is in progress

  # docket:verifies rule:started-before-fulfilled@capacity
  Rule: A block must be started before it's marked fulfilled

    Example: Not started
      Given Ada is on a block of Acme's this week
      When Ada marks it fulfilled
      Then it's refused as not started

  # docket:verifies rule:fulfilled-is-final@capacity
  Rule: Marking it fulfilled is final

    Example: Marking it again
      Given Ada has marked her block of Acme's fulfilled
      When Ada marks it fulfilled
      Then it's refused as already fulfilled

  # docket:verifies rule:clients-follow-a-blocks-status@capacity
  Rule: Clients follow a block's status

    Example: Started, it's in progress to the client
      Given Ada has started a block of Acme's
      When Acme reads the block
      Then it's in progress

    Example: Marked fulfilled, it's fulfilled to the client
      Given Ada has marked her block of Acme's fulfilled
      When Acme reads the block
      Then it's fulfilled

    Example: A client can't mark it fulfilled
      Given Ada has started a block of Acme's
      When an Admin of Acme marks it fulfilled
      Then it's refused

  # docket:verifies rule:a-focus-is-its-own-record@capacity
  Rule: A focus is its own record, on any of its client's blocks

    Example: Adding one
      Given Ada is on a block of Acme's with no focus
      When Ada adds a focus "Bundle totals at checkout" to it
      Then the block's focus is "Bundle totals at checkout"

    Example: A new focus in place of the block's
      Given Ada has added a focus "Bundle totals at checkout" to her block
      When Ada adds another focus to it
      Then the block's focus is "Cart rounding"
      And the focus "Bundle totals at checkout" can still be read

    Example: Using one of the client's focuses
      Given Ada has added a focus "Bundle totals at checkout" to her block
      And Ada is on another block of Acme's
      When Ada uses that focus on her other block
      Then her other block's focus is "Bundle totals at checkout"

    Example: Editing a focus on two blocks
      Given Ada's two blocks of Acme's share a focus
      When Ada renames the focus "Cart rounding"
      Then both blocks' focus is "Cart rounding"

    Example: Another client's focus
      Given Globex's block has a focus
      When Ada uses that focus on her block of Acme's
      Then it isn't found

    Example: Editing it keeps it the same focus
      Given Ada has added a focus "Bundle totals at checkout" to her block
      When Ada renames the focus "Cart rounding"
      Then the block's focus is "Cart rounding"
      And it's the same focus as before

    Example: Taking it off the block keeps the focus
      Given Ada has added a focus to her block of Acme's
      When Ada takes it off the block
      Then the block has no focus
      And the focus can still be read

    Example: Without a title
      Given Ada is on a block of Acme's with no focus
      When Ada adds a focus with no title
      Then it's refused for having no title

  # docket:verifies rule:who-changes-a-focus@capacity
  Rule: Only someone who can manage its block, or its client, changes a focus

    Example: A teammate who isn't on the block
      Given Ada has added a focus to her block of Acme's
      When Ben, on Ada's team, renames the focus
      Then it's refused

    Example: The client reads it
      Given Ada has added a focus "Bundle totals at checkout" to her block
      When Acme reads the block
      Then its focus is "Bundle totals at checkout"

    Example: Another organization
      Given Ada has added a focus to her block of Acme's
      When Globex reads the focus
      Then it isn't found

    Example: Looking through the client's focuses
      Given Ada has added a focus "Bundle totals at checkout" to her block
      When Ada searches Acme's focuses for "bundle"
      Then she finds "Bundle totals at checkout"

    Example: A client she has no block of
      Given Globex's block has a focus
      When Ada searches Globex's focuses
      Then it isn't found

    Example: The client adds one to a block nobody's on
      Given Acme has a block nobody's on
      When Acme adds a focus "Bundle totals at checkout" to it
      Then the block's focus is "Bundle totals at checkout"

    Example: The client edits one
      Given Ada has added a focus "Bundle totals at checkout" to her block
      When Acme renames the focus "Cart rounding"
      Then the block's focus is "Cart rounding"

    Example: The client uses one of its focuses on another block
      Given Ada has added a focus "Bundle totals at checkout" to her block
      And Ada is on another block of Acme's
      When Acme uses that focus on her other block
      Then her other block's focus is "Bundle totals at checkout"

    Example: The client takes it off
      Given Ada has added a focus to her block of Acme's
      When Acme takes it off the block
      Then the block has no focus

    Example: The client looks through its focuses
      Given Ada has added a focus "Bundle totals at checkout" to her block
      When Acme searches its focuses for "bundle"
      Then it finds "Bundle totals at checkout"

    Example: Another client's block
      Given Ada is on a block of Acme's with no focus
      When Globex adds a focus to it
      Then it isn't found

    Example: A member without the permission
      Given Ada has added a focus to her block of Acme's
      When a member of Acme who reads its blocks but can't change focuses renames the focus
      Then it's refused

  # docket:verifies rule:focus-attachments-are-the-clients@capacity
  Rule: A focus's attachments are its client's objects

    Example: Attaching a file of the client's
      Given Ada has uploaded "rates.csv" to Acme
      When Ada attaches "rates.csv" to her block's focus
      Then the focus lists "rates.csv"

    Example: A file of another organization's
      Given "rates.csv" belongs to Globex
      When Ada attaches "rates.csv" to her block's focus
      Then it's refused

  # docket:verifies rule:engineers-post-updates-on-their-blocks@capacity
  Rule: A block's engineer posts updates on it

    Example: Posting an update
      Given Ada is on a block of Acme's with a focus
      When Ada posts an update on it
      Then the update is on the block

    Example: Someone else's block
      Given Ada is on a block of Acme's with a focus
      When Ben, on Ada's team, posts an update on it
      Then it's refused

    Example: No focus yet
      Given Ada is on a block of Acme's with no focus
      When Ada posts an update on it
      Then the update is on the block, about no focus

    Example: About its focus
      Given Ada is on a block of Acme's with a focus
      When Ada posts an update on it
      Then the update is about the block's focus

    Example: Another organization's file
      Given Ada is on a block of Acme's with a focus
      When Ada posts an update with a file of Globex's
      Then it's refused

  # docket:verifies rule:only-its-writer-changes-an-update@capacity
  Rule: Only its writer changes an update

    Background:
      Given Ada has posted an update on her block of Acme's

    Example: Editing it
      When Ada edits it
      Then the update is changed

    Example: Someone else
      When Ben, on Ada's team, edits it
      Then it's refused

    Example: Deleting it
      When Ada deletes it
      Then the update stays on the block, emptied, saying it was deleted and when

  # docket:verifies rule:clients-read-a-blocks-updates@capacity
  Rule: Clients read a block's updates

    Example: Its client
      Given Ada has posted an update on her block of Acme's
      When Acme reads the block's updates
      Then the update is among them

    Example: Another organization
      Given Ada has posted an update on her block of Acme's
      When Globex reads the block's updates
      Then the block isn't found

  # docket:verifies rule:starting-a-block-records-who-and-when@capacity
  Rule: Starting a block records who started it and when

    Example: Started by its engineer
      Given Ada is on a block of Acme's this week
      When Ada starts it
      Then the block says Ada started it, and when
