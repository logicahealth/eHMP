@F431 @DE3055
Feature: Build a Activity Management Framework Environment

Background:
	Given user is logged into eHMP-UI
    When the patient search screen is displayed
    When the user selects My Workspace from the navigation bar
    Then Provider Centric View is active
    And the applets are displayed on the provider centric view
    | applet   |
    | MY TASKS |

@US7422 @TC440
Scenario: Verify a user can access detailed view of a task
  Given My Tasks applet displays at least 1 tasks
  When the user selects a task
  Then a detail view is displayed
