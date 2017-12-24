@F895
Feature: Edit Local Patient Problem List Entries

Background:
  Given user searches for and selects "eight,patient"
  Then Summary View is active
  And the user navigates to expanded problems applet
  And the user takes note of number of existing problems
  And there is at least 1 problem for local facility "TST1"

@debug @DE8341
Scenario:
  When the user views a local problem for Facility "TST1"
  Then the problem detail displays an edit button

  When the user selects the problem detail edit button
  Then the Edit Problem displays

  When the user updates the problem acuity
  And the user saves the edited problem

  Then the edited problem displays the updated acuity


