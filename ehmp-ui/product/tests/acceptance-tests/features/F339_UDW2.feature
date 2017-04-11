@F339 @regression @triage
Feature: F339 - User Defined Work Spaces 2

@US6295 @TC317
Scenario: visual Indicator for locked workspaces
	Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the "Workspace Manager"
    And the Workspace Manager is displayed
    And the predefined screens have a visual indicator indicating they are locked
    |screen |
    | Coversheet |
    | Timeline |
    | Overview |
    | Meds Review |
    | Documents |


@US6281 @TC316
Scenario: workspace manager add new workspace focus
	Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the "Workspace Manager"
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace
    Then the new user defined workspace title edit box has focus
    When the user removes the content in the title field
    Then an icon displays indicating a required field

@US5719 @TC326 @TC326a
Scenario: Delete alert should appear on any workspace being deleted - Cancel
    Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the "Workspace Manager"
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testdelete"
    And the user defined workspace name "testdelete" is listed
    When the user attempts to delete the user defined workspace named "testdelete"
    Then an alert with the title "Delete Workspace" displays
    When the user chooses to cancel the Delete Workspace action
    Then the alert closes
    And the user defined workspace name "testdelete" is listed


@US5719 @TC326 @TC326b
Scenario: Delete alert should appear on any workspace being deleted - Delete
    Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the "Workspace Manager"
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testdelete"
    When the user attempts to delete the user defined workspace named "testdelete"
    Then an alert with the title "Delete Workspace" displays
    When the user chooses to complete the Delete Workspace action
    Then the user defined workspace named "testdelete" is not listed

# future: works in chrome, but not in phantomjs, needs more investigation
@US5023 @future 
Scenario: Workspace title needs to accommodate 30 characters
    Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the "Workspace Manager"
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace
    When the user sets the title of the new user defined workspace to "aaaaabbbbbaaaaabbbbbaaaaabbbbbccc"
    Then the user defined workspace name "aaaaabbbbbaaaaabbbbbaaaaabbbbb" is listed

@US4514
Scenario: UDW:  Deleting an active work space
    Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the "Workspace Manager"
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testdeleteactive"
    And the user defined workspace name "testdeleteactive" is listed
    When the user sets the "testdeleteactive" as the active workspace 
    When the user attempts to delete the user defined workspace named "testdeleteactive"
    Then an alert with the title "Delete Workspace" displays
    When the user chooses to complete the Delete Workspace action
    Then the user defined workspace named "testdelete" is not listed
    And the workspace named "overview" is the active workspace

@US4444
Scenario: UDW:  Gridsterize Pre-defined Workspaces
    Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the "Workspace Manager"
    Then the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testdeleteactive1"
    And the user creates a user defined workspace named "testdeleteactive2"
    And the delete icon is disabled for predefined screens
    | screen      |
    | overview    |
    | cover-sheet |
    | news-feed   |
    | medication-review |
    | documents-list    |

    And the title cannot be changed for predefined screens
    | screen |
    | overview    |
    | cover-sheet |
    | news-feed   |
    | medication-review |
    | documents-list    |
    And the description cannot be changed for predefined screens
    | screen      |
    | overview    |
    | cover-sheet |
    | news-feed   |
    | medication-review |
    | documents-list    |


