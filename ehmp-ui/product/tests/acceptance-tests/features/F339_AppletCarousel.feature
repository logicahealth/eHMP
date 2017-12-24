@F172 @F339
Feature: Worksheet Editor's space - Applet Carousel

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces

@US4330 @TC60_1
Scenario:  User verifies applet carousel
  Given the user creates a user defined workspace named "verifycarousel"
  When the user customizes the "verifycarousel" workspace
  Then the applet carousel applets are displayed in alphabetical order
  Then the applet carousel displays left and right arrows
  Then the applet carousel updates applet list when the user selects right arrow
  Then the applet carousel updates applet list when the user selects left arrow

@US4330 @TC60_2
Scenario: User can filter applets in the workspace manager
    Given the user creates a user defined workspace named "filterapplets"
    When the user customizes the "filterapplets" workspace
    When the user filters the applet carousel on text "health"
    Then the carousel only displays applets including text "health"