@F353 @stack_graph_quickmenu 
Feature: F353 - stacked graphs

Background:
  And user searches for and selects "Bcma,Eight"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  And the user creates and views a udw with a stackgraph applet

  And the "Stacked Graphs" ("stackedGraph") expanded applet is displayed
  And the Stacked Graphs applet is empty
  When the user adds BMI Vitals to the graph
  Then the Stacked Graphs applet displays a row for "BMI"

@US6312
Scenario: User should be able to get information by clicking quick view button on stacked graph
  When the user hovers over the row for BMI
  Then a quickview displays a vitals table with expected headers

@US4668 @DE6010
Scenario: Verify detail modal view
  When the user hovers over the row for BMI
  Then user can view the Quick Menu Icon in Stacked Graph applet
  When user selects the detail view from Quick Menu Icon of Stack Graph applet
  Then the modal is displayed
  Then the BMI Vital detail modal is displayed

@US6237
Scenario: Verify user can remove graph
  When the user hovers over the row for BMI
  Then user can view the Quick Menu Icon in Stacked Graph applet
  When Quick Menu Icon is selected in Stack Graph applet
  Then a menu option displays with a delete button
  When the user chooses to remove the graph
  Then the Stacked Graphs applet does not display a row for BMI
