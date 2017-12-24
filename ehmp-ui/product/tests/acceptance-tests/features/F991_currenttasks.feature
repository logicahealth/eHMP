@F991 @reg1
Feature: My Current Tasks in the Action Tray

Background:
  Given user searches for and selects "bcma,eight"
  Then Summary View is active

@F991-1 @US14468
Scenario: As a user I am able to view a list of "My Current Tasks"
  When the user opens the Actions Tray
  Then the Actions Tray displays a My Tasks section
  And the Actions Tray displays a My Drafts section

@F991-5
Scenario: As a user I can click to collapse and uncollapse the Current Tasks section within the action tray
  When the user opens the Actions Tray
  And the My Tasks section is uncollapsed by default
  When the user clicks the My Tasks header
  Then the My Tasks section collapses

  
