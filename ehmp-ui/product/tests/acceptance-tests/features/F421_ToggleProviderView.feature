@F421 @regression
Feature: F421 -  Implement a User (Provider) Centric View 

@US6598 @US7006 
Scenario: Provider View
	# Given user is logged into eHMP-UI
    When the patient search screen is displayed
    Then Staff View Navigation is displayed

@US7215 @US7006 @TC1051 @TC1236 @TC1239 @DE3055
Scenario: Add applets to Provider View - navigate to Provider Centric View from patient search screen
    # Given user is logged into eHMP-UI
    And the patient search screen is displayed
    When the user selects Staff View from the navigation bar
    Then Provider Centric View is active

@US7215 @US7006 @TC1051 @TC1236 @TC1239
Scenario: Add applets to Provider View
	# Given user is logged into eHMP-UI
    And the patient search screen is displayed
    When the user selects Staff View from the navigation bar
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
    And the "patient identifying traits" is displayed with information
        | html          | value                 |
        | patient name  | Eight,Patient         |
    When the user selects Patient Selection from navigation bar
    And the patient search screen is displayed
    And the user selects current patient link
    Then Overview is active
    And the "patient identifying traits" is displayed with information
        | html          | value                 |
        | patient name  | Eight,Patient         |


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
    When the user clicks the Patient Search Button
	Then the patient search screen is displayed

	#actual test
	When the user selects Staff View from the navigation bar
    Then Provider Centric View is active
    And the applets are displayed on the provider centric view
    | applet   |
    | TASKS |
    And the workspace editor button is not displayed
    When the user navigates to "#ciw"
    Then the workspace editor button is displayed

