@F339 @regression @triage @DE3930 @US5278
Feature: F339 - User Defined Work Spaces 2

@US6295 @TC317 
Scenario: visual Indicator for locked workspaces
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    And the predefined screens have a visual indicator indicating they are locked
    |screen |
    | Coversheet |
    | Timeline |
    | Overview |
    | Meds Review |
    | Documents |

@US5275 @US6030 @US6030_a 
Scenario: Verify Launch Behavior - launch links
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testlaunch"
    And the user defined workspace name "testlaunch" is listed
    And the user defined workspace "testlaunch" launch link says Customize
    When the user customizes the "testlaunch" workspace
    And the user adds an summary "allergy_grid" applet to the user defined workspace
    And the user selects done to complete customizing the user defined workspace
    Then the "TESTLAUNCH" screen is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    And the user defined workspace name "testlaunch" is listed
    And the user defined workspace "testlaunch" launch link says Launch

@US5275 @US6030 @US6030_b
Scenario: Verify Launch Behavior - launch pre-defined screen ( using documents as example)
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    When the user chooses to launch workspace "documents-list"
    Then the "DOCUMENTS" screen is active


@US6281 @TC316 
Scenario: workspace manager add new workspace focus
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace
    Then the new user defined workspace title edit box has focus
    # DE4693 below
    # When the user removes the content in the title field
    # Then an icon displays indicating a required field


@US6281 @TC316 @DE4693
Scenario: workspace manager add new workspace focus
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace
    Then the new user defined workspace title edit box has focus
    When the user removes the content in the title field
    Then an icon displays indicating a required field

@US5719 @TC326 @TC326a
Scenario: Delete alert should appear on any workspace being deleted - Cancel
    # Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testdelete"
    And the user defined workspace name "testdelete" is listed
    When the user attempts to delete the user defined workspace named "testdelete"
    Then an alert with the title "Delete" displays
    When the user chooses to cancel the Delete Workspace action
    Then the alert closes
    And the user defined workspace name "testdelete" is listed


@US5719 @TC326 @TC326b
Scenario: Delete alert should appear on any workspace being deleted - Delete
    # Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testdelete"
    When the user attempts to delete the user defined workspace named "testdelete"
    Then an alert with the title "Delete" displays
    When the user chooses to complete the Delete Workspace action
    Then the user defined workspace named "testdelete" is not listed

@US5023
Scenario: Workspace title needs to accommodate 30 characters
    And user searches for and selects "BCMA,EIGHT"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    When the user creates a user defined workspace and sets the title to a string of length 30
    Then the user defined workspace name is listed

@US4514 @DE5904
Scenario: UDW:  Deleting an active work space
    # Given user is logged into eHMP-UI
    And user searches for and selects "BCMA,EIGHT"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    Then the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testdeleteactive"
    And the user defined workspace name "testdeleteactive" is listed
    When the user sets the "testdeleteactive" as the active workspace 

    # # Test fails (only in phantomjs) if 'user' deletes workspace without navigating to it at least once
    # When the user customizes the "testdeleteactive" workspace
    # And the user adds an summary "lab_results_grid" applet to the user defined workspace
    # And the user selects done to complete customizing the user defined workspace
    # Then the "TESTDELETEACTIVE" screen is active
    # When the user clicks the Workspace Manager
    # And the Workspace Manager is displayed

    When the user attempts to delete the user defined workspace named "testdeleteactive"
    Then an alert with the title "Delete" displays
    When the user chooses to complete the Delete Workspace action
    Then the user defined workspace named "testdelete" is not listed
    And the workspace named "summary" is the active workspace
    And the user closes the workspace manager to save workspace updates

@US4444 
Scenario: UDW:  Gridsterize Pre-defined Workspaces
    # Given user is logged into eHMP-UI
    And user searches for and selects "BCMA,EIGHT"
    Then Overview is active
    When the user clicks the Workspace Manager
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

@US4521 @TC87
Scenario: Verify the Workspace Manager header
    Given user searches for and selects "Eight,Patient"
    And Overview is active
    When the user clicks the Workspace Manager
    Then the Workspace Manager is displayed
    And the Workspace Manager title is "Workspace Manager"
    And the Workspace Manager displays a Close button
    And the Workspace Manager displays an Add New button
    And the Workspace Manager displays a filter

@US5276 @US4540 @TC146 @TC146_predefined
Scenario: Filter Workspace Select List to predefined screen (using Documents as example)
    Given user searches for and selects "Eight,Patient"
    And Overview is active
    When the user opens the workspace select drop down menu
    And filters the workspace select list on "Documents"
    Then the workspace select list is filtered on "Documents"

@US5276 @US4540 @TC146 @TC146_userdefined
Scenario: Filter Workspace Select List to user defined screen
    Given user searches for and selects "Eight,Patient"
    And Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    And the user deletes all user defined workspaces
    And the user creates a user defined workspace named "testfilterone"
    And the user creates a user defined workspace named "twotestfilter"
    And the user launches "overview" from the workspace manager
    And Overview is active
    And the user opens the workspace select drop down menu
    And filters the workspace select list on "testfilter"
    Then the workspace select list is filtered on "testfilter"

@US5589 @TC143
Scenario: UDW: URL Should not be generic, but contain the workspace name
  Given user searches for and selects "Eight,Patient"
  And Overview is active
  And the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  And the user creates a user defined workspace named "verifyurl"
  And the user customizes the "verifyurl" workspace
  And the user selects done to complete customizing the user defined workspace
  When the "VERIFYURL" screen is active
  Then the urls contains "verifyurl"
