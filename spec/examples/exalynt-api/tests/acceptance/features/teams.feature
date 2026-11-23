Feature: Teams
  Exalynt's engineers work in teams, each assigned to the clients it supports
  and led by one of its engineers.

  Background:
    Given Acme and Globex are clients

  # docket:verifies rule:only-exalynt-makes-teams@capacity
  Rule: Only Exalynt makes teams

    Example: Exalynt makes a team
      When Exalynt makes a team called Platform
      Then there is a team called Platform

    Example: A client tries to make a team
      When Acme tries to make a team called Platform
      Then it's refused
      And there is no team called Platform

  # docket:verifies rule:team-names-are-unique@capacity
  Rule: Team names are unique, ignoring case and surrounding spaces

    Example: A name already taken
      Given there is a team called Platform
      When Exalynt makes a team called " platform "
      Then it's refused

  # docket:verifies rule:clients-can-have-several-teams@capacity
  Rule: A client can have several teams, and sees each by name, with its own members and its own lead

    Example: Two teams
      Given Platform has Ada leading and Ben on it, and supports Acme
      And Data has Cy leading, and supports Acme
      When Acme looks at its teams
      Then Acme sees Platform, with Ada leading and Ben
      And Acme sees Data, with Cy leading

  # docket:verifies rule:teams-can-support-several-clients@capacity
  Rule: A team can support several clients, and Exalynt sees every client a team is assigned to

    Example: A team with two clients
      Given Platform supports Acme and Globex
      When Exalynt looks at Platform
      Then Platform supports Acme and Globex

  # docket:verifies rule:clients-cant-see-a-teams-other-clients@capacity
  Rule: A client sees only itself among a team's clients, never which others the team works with

    Example: A shared team
      Given Platform supports Acme and Globex
      When Acme looks at its teams
      Then Acme sees Platform supporting only Acme

  # docket:verifies rule:clients-see-only-their-supporting-teams@capacity
  Rule: A client sees only teams that support it

    Example: Asking for another client's teams
      Given Platform supports Acme and Globex
      And Data supports only Globex
      When Acme asks for Globex's teams
      Then Acme sees no teams

    Example: Naming a team that doesn't support it
      Given Data supports only Globex
      When Acme looks for Data
      Then Acme finds no such team

    Example: Paging on from another client's place in the listing
      Given Acme and Globex each have three teams of their own
      And Globex was given a place partway through its teams
      When Acme pages on from Globex's place
      Then every team Acme sees is one of its own

    Example: A client with no team
      Given Acme has no team
      When Acme looks at its teams
      Then Acme sees no teams

  # docket:verifies rule:member-access-to-teams-follows-role@capacity
  Rule: A client's members see its teams only if their role lets them

    Example: A Billing member
      Given Platform supports Acme
      When a Billing member of Acme looks at Acme's teams
      Then it's refused

  # docket:verifies rule:exalynts-view-of-teams@capacity
  Rule: Naming a client, Exalynt sees that client's teams and every client each supports; naming none, every team

    Example: Naming a client
      Given Platform supports Acme and Globex
      And Data supports only Globex
      When Exalynt looks at Acme's teams
      Then Exalynt sees only Platform, supporting Acme and Globex

    Example: Naming no client
      Given Platform supports Acme, Data supports Globex, and Tools supports no one
      When Exalynt looks at every team
      Then Exalynt sees Data, Platform and Tools

  # docket:verifies rule:only-exalynt-assigns-teams@capacity
  Rule: Only Exalynt assigns teams to clients and takes them off

    Example: Exalynt assigns a team
      Given there is a team called Platform
      When Exalynt assigns Platform to Acme
      Then Platform supports Acme

    Example: A client tries to give itself a team
      Given there is a team called Platform
      When Acme tries to assign Platform to Acme
      Then it's refused
      And Acme has no team

    Example: A client tries to take itself off a team
      Given Platform supports Acme
      When Acme tries to take itself off Platform
      Then it's refused
      And Platform supports Acme

  # docket:verifies rule:repeat-assignment-changes-nothing@capacity
  Rule: Assigning a team to a client it already supports changes nothing

    Example: Assigning it again
      Given Platform supports Acme
      When Exalynt assigns Platform to Acme again
      Then Platform supports Acme, once

  # docket:verifies rule:what-counts-as-a-team-update@capacity
  Rule: A team counts as updated when its engineers or clients change

    Example: Adding an engineer
      Given there is a team called Platform
      When Exalynt puts Ada on Platform
      Then Platform has been updated

    Example: Moving an engineer updates both teams
      Given Ada is on Platform
      And there is a team called Data
      When Exalynt puts Ada on Data
      Then Platform has been updated
      And Data has been updated

    Example: Taking a client off a team
      Given Platform supports Acme
      When Exalynt takes Acme off Platform
      Then Platform has been updated

    Example: Assigning a client the team already supports
      Given Platform supports Acme
      When Exalynt assigns Platform to Acme again
      Then Platform has not been updated

  # docket:verifies rule:removing-one-team-keeps-the-others@capacity
  Rule: Taking a client off one of its teams leaves it its other teams

    Example: Two teams, one taken off
      Given Platform and Data both support Acme
      When Exalynt takes Acme off Platform
      Then Acme sees only Data

  # docket:verifies rule:deleted-teams-disappear-for-clients@capacity
  Rule: Once a team is deleted, its clients no longer see it

    Example: A deleted team
      Given Platform and Data both support Acme
      When Exalynt deletes Platform
      Then Acme sees only Data

  # docket:verifies rule:members-are-listed-lead-first@capacity
  Rule: A team's members are listed lead first, each with their name and email address

    Example: Listing members
      Given Platform has Ada and Ben on it, with Ben leading, and supports Acme
      When Acme looks at Platform
      Then Ben is listed first
      And each member is shown with their name and email address

  # docket:verifies rule:one-team-per-engineer@capacity
  Rule: An engineer belongs to at most one team, so putting them on another moves them off their old one

    Example: Moving teams
      Given Ada is on Platform
      When Exalynt puts Ada on Data
      Then Ada is on Data
      And Ada is no longer on Platform

  # docket:verifies rule:one-lead-per-team@capacity
  Rule: A team has at most one lead, so making someone its lead makes the old lead an ordinary member

    Example: A new lead
      Given Platform has Ada leading and Ben on it
      When Exalynt makes Ben Platform's lead
      Then Ben leads Platform
      And Ada is on Platform, not leading

  # docket:verifies rule:a-departing-lead-leaves-no-lead@capacity
  Rule: When a team's lead moves to another team, their old team is left with no lead, and they lead the new team only if put on it as lead

    Example: Moved as a member
      Given Ada leads Platform
      When Exalynt puts Ada on Data
      Then Platform has no lead
      And Ada is on Data, not leading

    Example: Moved as lead
      Given Ada leads Platform, and Cy leads Data
      When Exalynt puts Ada on Data as its lead
      Then Platform has no lead
      And Ada leads Data

  # docket:verifies rule:removed-members-leave-every-clients-view@capacity
  Rule: Taking someone off a team takes them off every client's view of it

    Example: Taken off a shared team
      Given Platform has Ada and Ben on it, and supports Acme and Globex
      When Exalynt takes Ben off Platform
      Then neither Acme nor Globex sees Ben on Platform

  # docket:verifies rule:removing-someone-already-gone@capacity
  Rule: Taking someone off a team they've already left finds nothing to take them off

    Example: Already off
      Given Ada was on Platform, and has been taken off it
      When Exalynt takes Ada off Platform
      Then there's no one to take off

  # docket:verifies rule:only-exalynts-people-join-teams@capacity
  Rule: Only Exalynt's own people can be on a team, and someone who leaves Exalynt is no longer shown on it

    Example: Putting a client's member on a team
      Given Platform supports Acme and Globex
      And Gina is a member of Globex, not of Exalynt
      When Exalynt tries to put Gina on Platform
      Then it's refused
      And Acme doesn't see Gina on Platform

    Example: Someone leaves Exalynt
      Given Ada is on Platform, which supports Acme
      When Ada leaves Exalynt
      Then Acme no longer sees Ada on Platform

  # Not business rules: unit tests, if the feature's level calls for them.
  #   - Teams are listed by name, a page at a time, with a way to the next page
  #     and none after the last.
