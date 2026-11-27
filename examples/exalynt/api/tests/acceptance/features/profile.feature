Feature: Your profile
  Someone's name and primary email address are theirs to change, and Exalynt
  goes by what they've changed them to.

  Background:
    Given Acme and Globex are clients

  # docqet:verifies rule:everyone-sees-the-name-given
  Rule: The name someone gives is the one everyone who sees them sees

    Example: Changing a name
      Given Ada is on Platform, which supports Acme
      When Ada changes their name to "Ada Byron"
      Then Acme sees "Ada Byron" on Platform

  # docqet:verifies rule:invitations-follow-the-primary-address
  Rule: An invitation goes by the address someone has made primary

    Example: An invitation to their new address
      Given Dana has made dana@new.example their primary address
      And Dana is invited to Globex at dana@new.example
      When Dana accepts the invitation
      Then Dana is a member of Globex

    Example: An invitation to an address they haven't made primary
      Given Dana has added dana@other.example without making it primary
      And Dana is invited to Globex at dana@other.example
      When Dana tries to accept the invitation
      Then it's refused
      And Dana isn't a member of Globex
