@F353 @reg1
Feature: F353 - stacked graphs

@US6312 @DE3444
Scenario: Stacked Graph has a quick view button
	And user searches for and selects "Eight,Patient"
	And Summary View is active
	Then the Stacked Graphs applet displays at least 1 row
	When the user hovers over the first row in the Stacked Graph applet
	And user can view the Quick Menu Icon in Stacked Graph applet
	Then a Stacked Graph quick view table is displayed

@US5332 @TC102
Scenario: Stacked Graph is only available in Expanded View
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "stackgraphexpanded"
  When the user customizes the "stackgraphexpanded" workspace
  And the user adds a "stackedGraph" applet to the user defined workspace
  Then the user is presented with an option for "Expanded View"
  And the user is not presented with an option for "Trend View"
  And the user is not presented with an option for "Summary View"
  

@US4503 @US5332 @TC102
Scenario: Create Stacked Graph Container
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "stackgraphcheck"
  When the user customizes the "stackgraphcheck" workspace
  And the user adds an expanded "stackedGraph" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "STACKGRAPHCHECK" screen is active
  And the active screen displays 1 applets
  And the Stacked Graph Expanded applet is displayed

@US5333
Scenario: User can rename an applet on a user defined workspace
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "renamecheck"
  When the user customizes the "renamecheck" workspace
  And the user adds an expanded "stackedGraph" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "RENAMECHECK" screen is active
  And the active screen displays 1 applets
  And the Stacked Graph Expanded applet is displayed
  When the user attempts to rename the "stackedGraph" applet to "RENAME APPLET"
  Then the "stackedGraph" applet is titled "RENAME APPLET"


@US5840 @DE8551
Scenario: Add the BMI option to vitals
  And user searches for and selects "Bcma,Eight"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates and views a udw with a stackgraph applet
  And the Stacked Graphs applet is empty
  When the user adds BMI Vitals to the graph
  Then the Stacked Graphs applet displays a row for "BMI"

@US5344 @DE8551
Scenario: Add Lab Result to stack graph
  And user searches for and selects "Bcma,Eight"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates and views a udw with a stackgraph applet
  And the "Stacked Graphs" ("stackedGraph") expanded applet is displayed
  And the Stacked Graphs applet is empty
  When the user adds lab troponin to the graph
  Then the Stacked Graphs applet displays a row for "troponin"

@US5402 @US4388 @DE5779 @DE6760 @DE8551
Scenario: Add Medication to stack graph
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates and views a udw with a stackgraph applet
  And the Stacked Graphs applet is empty
  When the user adds medication Aspirin to the graph
  Then the Stacked Graphs applet displays a row for "Aspirin"



