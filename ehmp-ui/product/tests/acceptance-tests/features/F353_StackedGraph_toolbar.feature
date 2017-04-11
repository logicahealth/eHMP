@F353 @regression @triage
Feature: F353 - stacked graphs

Background:
  And user searches for and selects "Bcma,Eight"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "stackgraphtoolbar"
  When the user customizes the "stackgraphtoolbar" workspace
  And the user adds an expanded "stackedGraph" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "STACKGRAPHTOOLBAR" screen is active
  And the "Stacked Graphs" ("stackedGraph") expanded applet is displayed
  And the Stacked Graphs applet is empty
  When the user adds BMI Vitals to the graph
  Then the Stacked Graphs applet displays a row for "BMI"

@US6312
Scenario: User should be able to get information by clicking quick view button on stacked graph
  When the user clicks the row for BMI
  Then a popover toolbar displays buttons
   | button |
   | Quick View Button |
  When the user clicks the BMI Quick View Button
   Then a quickview displays table with headers
   | header |
   | Date       |
   | Result |
   | Ref. Range |
   | Facility |

@US4668
Scenario: Verify detail modal view
  When the user clicks the row for BMI
  Then a popover toolbar displays buttons
   | button |
   | Detail View Button |
  When the user clicks the BMI Detail View button
  Then the modal is displayed
  Then the BMI Vital detail modal is displayed

@US6237
Scenario: Verify user can remove graph
  When the user clicks the row for BMI
  Then a popover toolbar displays with a delete button
  When the user chooses to remove the graph
  Then the Stacked Graphs applet does not display a row for BMI
