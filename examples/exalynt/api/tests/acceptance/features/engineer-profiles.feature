Feature: Engineer profiles
  Each engineer has a short bio, so the clients and teammates they work with
  can get to know them as a person before they meet.

  Background:
    Given Acme and Globex are clients
    And Ada and Ben are on Platform, which supports Acme

  # docqet:verifies rule:who-edits-a-bio
  Rule: An engineer edits their own bio, and Exalynt's admins can edit anyone's

    Example: An engineer edits their own bio
      When Ada writes "I restore old bikes." as Ada's bio
      Then Ada's bio is "I restore old bikes."

    Example: An admin edits an engineer's bio
      When an admin writes "Ada restores old bikes." as Ada's bio
      Then Ada's bio is "Ada restores old bikes."

    Example: An engineer tries to edit a teammate's bio
      When Ben tries to write "Not me." as Ada's bio
      Then it's refused
      And Ada has no bio

    Example: A client tries to edit an engineer's bio
      When a member of Acme tries to write "Not me." as Ada's bio
      Then it's refused
      And Ada has no bio

  # docqet:verifies rule:who-sees-a-bio
  Rule: An engineer's bio is seen by their teammates and by the clients their team supports, and by no other client

    Example: The team's client
      Given Ada's bio is "I restore old bikes."
      When Acme looks at its teams
      Then Acme sees "I restore old bikes." as Ada's bio

    Example: A teammate
      Given Ada's bio is "I restore old bikes."
      When Ben looks at Ben's team
      Then Ben sees "I restore old bikes." as Ada's bio

    Example: Another client
      Given Ada's bio is "I restore old bikes."
      When Globex looks at its teams
      Then Globex sees no one's bio

  # docqet:verifies rule:bios-are-at-most-500-characters
  Rule: A bio is short, at most 500 characters

    Scenario Outline: A bio's length
      When Ada writes a bio of <length> characters
      Then the bio is <outcome>

      Examples:
        | length | outcome |
        | 500    | kept    |
        | 501    | refused |

  # docqet:verifies rule:clearing-a-bio-leaves-none
  Rule: Clearing a bio leaves none

    Example: Clearing it
      Given Ada's bio is "I restore old bikes."
      When Ada clears Ada's bio
      Then Ada has no bio
