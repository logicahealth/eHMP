@FX
Feature: User stories that do not have a parent feature

@US7349 @TC565 @TC566 @TC567
Scenario: Icons for creating new items are visible for writeback domains on coversheet
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  Then the Allergies Applet contains an Add button

  And the Vitals applet contains buttons
    | buttons  |
    | Add      |
  And the Immunizations applet contains an Add button

@US7349 @TC564  @future
Scenario: Icons for creating new items are visible for writeback domains on coversheet
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And the Problems applet contains buttons
    | buttons  |
    | Add      |

@US7349 @TC565 @TC566 @TC567
Scenario: Icons for creating new items are visible for writeback domains on overview
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Overview is active
  Then the Allergies Gist Applet contains an Add Button

   Then the Vitals Gist Applet contains buttons
    | buttons  |
    | Add      |
  Then the Immunizations Gist Applet contains buttons an Add button


@US7349 @TC564 @future
Scenario: Icons for creating new items are visible for writeback domains on overview
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Overview is active
  And the Problems applet contains buttons
    | buttons  |
    | Add      |