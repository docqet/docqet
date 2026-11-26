Feature: Objects
  Objects are files uploaded to a client's organization, such as screenshots
  and screen recordings.

  # docqet:verifies rule:objects-stay-within-their-organization@accounts
  Rule: Another organization can't reach a client's objects

    Background:
      Given Acme and Globex are clients
      And Acme has an object

    Scenario Outline: Globex tries to <action> it
      When Globex tries to <action> Acme's object
      Then it isn't found, and Acme's object is as it was

      Examples:
        | action   |
        | read     |
        | download |
        | delete   |

    Example: Listing
      When Globex lists its objects
      Then Acme's object isn't among them

    Example: Uploading into Acme
      When Globex uploads an object naming Acme
      Then Acme isn't found, and Acme has no new object

  # Not business rules: unit tests, if the feature's level calls for them.
  #   - An empty file, or an upload with no file, is refused.
  #   - Objects are listed newest first, a page at a time, with links to the
  #     next and previous pages, and the last page has no next link.
  #   - A page holds at most 100 objects.
