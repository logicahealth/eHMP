@F1216 @reg2
Feature: Create eHMP UI ability to report an incident and send that incident to the VA directly from the UI - footer

@US17910 @US17910_1
Scenario: Verify eHMP Incident button on the eHMP Footer
  Given user searches for and selects "BCMA,Eight"
  When Overview is active
  Then the footer displays the eHMP Incident button

@US17910 @US17910_2
Scenario: Verify eHMP Incident Popup Window
  Given user searches for and selects "BCMA,Eight"
  And Overview is active
  When the user selectes the eHMP Incident button in the footer
  Then the eHMP Incident Popup Window displays
  And the eHMP Incident Popup Window has an input field
  And the eHMP Incident Popup Window has a Send Report button

