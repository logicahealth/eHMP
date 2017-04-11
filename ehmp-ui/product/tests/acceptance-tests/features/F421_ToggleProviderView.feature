@F421 
Feature: F421 -  Implement a User (Provider) Centric View 

@US7215 @US7006 @TC1051 @TC1236 @TC1239
Scenario: Add applets to Provider View
    Then Provider Centric View is active
    And the applets are displayed on the provider centric view
    | applet   |
    | TASKS |

@US7013 @TC1233 @DE3055
Scenario: Verify provider view is unchanged after selecting a new patient
    # Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user selects Staff View from the navigation bar
    Then Provider Centric View is active

@US7013 @TC1234
Scenario: Verify Provider View is unchanged after a patient search
    # Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    And Overview is active
    And the Global Header displays the user name "Eight,Patient (E0008)"
    When the user selects Staff View from navigation bar
    Then staff view screen is displayed
    And the user selects current patient link
    Then Overview is active
    And the Global Header displays the user name "Eight,Patient (E0008)"


@US9072 @TC1615 @DE3041 @DE3055
Scenario: Verify Workspace Editor Button is hidden
    # background
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
    Then Overview is active
    And the user clicks the Workspace Manager
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace named "CIW"
    And user closes the Workspace Manager

	#actual test
	When the user selects Staff View from the navigation bar
    Then Provider Centric View is active
    And the applets are displayed on the provider centric view
    | applet   |
    | TASKS |
    And the workspace editor button is not displayed
    When the user navigates to "#ciw"
    Then the workspace editor button is displayed

