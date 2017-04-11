@F565 @regression @workspace_test @future
Feature: F565 - Include Concept Invoked Workspaces Menu to Additional Views

# future: code uses MutationObserver, which is not compatable with phantomjs

Background:
	Given user is logged into eHMP-UI
	And user searches for and selects "Nineteen,Patient"
    Then Overview is active
    And the user clicks the "Workspace Manager"
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace named "CIW"
    And the user associates user defined workspace "CIW" with "Essential hypertension"
    And user closes the user defined work space manager

@US6095 @TC321 @TC738 @US6095_1
 Scenario: 
 	When Overview is active
 	And the user has selected All within the global date picker
  	When user clicks on the left hand side of the item "Essential Hypertension" 
  	Then user selects the "Essential Hypertension" CIW icon in Conditions Gist
  	Then the user navigated to the user defined workspace "ciw"

@US6095 @TC321 @TC738 @US6095_4
 Scenario: 
    When Overview is active
    And the user clicks the "Workspace Manager"
 	
 	When the user creates a user defined workspace named "CIW2"
    And the user associates user defined workspace "CIW2" with "Essential hypertension"
    And user closes the user defined work space manager
 	And the user has selected All within the global date picker
  	When user clicks on the left hand side of the item "Essential Hypertension" 
  	Then user selects the "Essential Hypertension" CIW icon in Conditions Gist
  	Then the following workspace options are displayed
  	 | workspace name |
  	 | CIW  |
  	 | CIW2 |
  	When the user selects workspace option "CIW2"
  	Then the user navigated to the user defined workspace "ciw2"


 @US6095 @TC321 @TC738 @US6095_2 @debug @DE2975
 Scenario:
 	When Cover Sheet is active
 	And the user has selected All within the global date picker
  	When user clicks on the left hand side of the item "Essential Hypertension" 
  	Then user selects the "Essential Hypertension" CIW icon in Conditions Gist
  	Then the user navigated to the user defined workspace "ciw"

 @US6095 @TC321 @TC738 @US6095_3 @debug @DE2975
 Scenario:
 	When user navigates to the Expanded Conditions Applet
    Then Expanded Conditions is active 
    And the user has selected All within the global date picker
  	When user clicks on the left hand side of the item "Essential Hypertension" 
  	Then user selects the "Essential Hypertension" CIW icon in Conditions Gist
  	Then the user navigated to the user defined workspace "ciw"
