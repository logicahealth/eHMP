@F353 @reg1
Feature: F353 - stacked graphs

@US6312 @DE3444
Scenario: Stacked Graph has a quick view button
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	And Summary View is active
	Then the Stacked Graphs applet displays at least 1 row
	When the user selects the first row in the Stacked Graph applet
	Then a toolbar displays with a quick view icon
	When the user selects the Stacked Graphs quick view icon
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
  # Given user is logged into eHMP-UI
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
  # Given user is logged into eHMP-UI
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


@US5840
Scenario: Add the BMI option to vitals
  And user searches for and selects "Bcma,Eight"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "stackgraphbmi"
  When the user customizes the "stackgraphbmi" workspace
  And the user adds an expanded "stackedGraph" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "STACKGRAPHBMI" screen is active
  When the user adds BMI Vitals to the graph
  Then the Stacked Graphs applet displays a row for "BMI"

@US5344
Scenario: Add Lab Result to stack graph
  And user searches for and selects "Bcma,Eight"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "stackgraphlab"
  When the user customizes the "stackgraphlab" workspace
  And the user adds an expanded "stackedGraph" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "STACKGRAPHLAB" screen is active
  When the user adds lab troponin to the graph
  Then the Stacked Graphs applet displays a row for "troponin"

@US5402 @US4388 @DE5779 @DE6760
Scenario: Add Medication to stack graph
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  And the user clicks the Workspace Manager
  Then the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "stackgraphmed"
  When the user customizes the "stackgraphmed" workspace
  And the user adds an expanded "stackedGraph" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "STACKGRAPHMED" screen is active
  When the user adds medication Aspirin to the graph
  Then the Stacked Graphs applet displays a row for "Aspirin"



