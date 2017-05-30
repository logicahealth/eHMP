@F565  @workspace_test   @DE6249 @DE7016 @DE6950
Feature: F565 - Include Concept Invoked Workspaces Menu to Additional Views

Background:
	# Given user is logged into eHMP-UI
	And user searches for and selects "Nineteen,Patient"
    Then Overview is active
    And the user clicks the Workspace Manager
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace named "CIW"
    And the user associates user defined workspace "CIW" with "Essential hypertension"
    And user closes the user defined work space manager

@US6095 @TC321 @TC738 @US6095_1
 Scenario: User can navigate to user defined workspace from Problems applet after associating a problem
 	When Overview is active
 	And the user has selected All within the global date picker
  	When user clicks on the left hand side of the item "Essential Hypertension" 
  	Then user selects the "Essential Hypertension" CIW icon in Problems Gist
  	Then the user navigated to the user defined workspace "/patient/ciw"

@US6095 @DE4265 
Scenario: Verify CIW Menu displayed on summary view
  Given the user clicks the Workspace Manager
  Given the user creates a user defined workspace named "udaffilter"
  When the user customizes the "udaffilter" workspace
  And the user adds an summary "problems" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "UDAFFILTER" screen is active
  When user clicks on summary row for "Hypertension" in the Problems Applet
  Then a popover toolbar displays the CIW button

@US6095 @DE4265 
Scenario: Verify CIW Menu displayed on expanded view
  Given the user clicks the Workspace Manager
  Given the user creates a user defined workspace named "udaffilter"
  When the user customizes the "udaffilter" workspace
  And the user adds an expanded "problems" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "UDAFFILTER" screen is active
  When the user clicks on the expanded row for "Hypertension" in the Problems Applet
  Then a popover toolbar displays the CIW button

@US6095 @DE4265
Scenario: Verify CIW Menu displayed on maximized view
  Given the user clicks the Workspace Manager
  Given the user creates a user defined workspace named "udaffilter"
  When the user customizes the "udaffilter" workspace
  And the user adds an expanded "problems" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "UDAFFILTER" screen is active
  When the user clicks the Problems Expand Button
  When the Problems applet displays
  When the user clicks on the maximized row for "Hypertension" in the Problems Applet
  Then a popover toolbar displays the CIW button

@US6095 @TC321 @TC738 @US6095_4
 Scenario: 
    When Overview is active
    And the user clicks the Workspace Manager
 	
 	When the user creates a user defined workspace named "SECONDCIW"
    And the user associates user defined workspace "SECONDCIW" with "Essential hypertension"
    And user closes the user defined work space manager
 	And the user has selected All within the global date picker
  	When user clicks on the left hand side of the item "Essential Hypertension" 
  	Then user selects the "Essential Hypertension" CIW dowpdown icon in Problems Gist
  	Then the following workspace options are displayed
  	 | workspace name |
  	 | CIW  |
  	 | SECONDCIW |
  	When the user selects workspace option "SECONDCIW"
  	Then the user navigated to the user defined workspace "/patient/secondciw"

