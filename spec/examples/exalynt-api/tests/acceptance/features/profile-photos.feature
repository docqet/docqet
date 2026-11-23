Feature: Profile photos
  Everyone has one profile photo, which they upload themselves, and everyone
  who sees them in Exalynt sees it beside their name.

  Background:
    Given Acme is a client
    And Ada and Ben are on Platform, which supports Acme
    And Dana and Sam are members of Acme

  # docket:verifies rule:everyone-sees-the-uploaded-photo@accounts
  Rule: The photo someone uploads is the one everyone who sees them sees

    Example: An engineer's photo
      When Ada uploads a photo
      Then Acme sees Ada's photo on Platform
      And Ben sees Ada's photo on Platform

    Example: A client member's photo
      When Dana uploads a photo
      Then Sam sees Dana's photo among Acme's members

    Example: A new photo replaces the old one
      Given Ada has uploaded a photo
      When Ada uploads a different photo
      Then Acme sees Ada's new photo on Platform

  # docket:verifies rule:removed-photos-are-no-longer-shown@accounts
  Rule: Someone who removes their photo is shown without one

    Example: Removing it
      Given Ada has uploaded a photo
      When Ada removes the photo
      Then Acme sees no photo of Ada on Platform
