@F1264 @US18774 @reg3
Feature: Staff Context Workspaces - Apply Context Differentiation in the Workspace Manager Interface

Background:
    Given user searches for and selects "Bcma,Eight"
    And Cover Sheet is active
    And the user clicks the Workspace Manager
    And the user deletes all user defined workspaces

@US18774_1
Scenario: Verify the Workspace Manager interface in the patient context has 'Patient Workspace Manager' as a title.
    Given the user is viewing the Workspace Manager window
    Then the Workspace Manager window title is "Patient Workspace Manager"

@US18774_2 @US18777
Scenario: Verify the Workspace Manager interface in the patient context restricts customizing of pre-defined workspaces.
    Given the user is viewing the Workspace Manager window
    Then the predefined screens have a visual indicator indicating they cannot be cutomized
      | screen      | value             |
      | Coversheet  | cover-sheet       |
      | Timeline    | news-feed         |
      | Overview    | overview          |
      | Meds Review | medication-review |
      | Documents   | documents-list    |
      | Summary     | summary           |


@US18774_3
Scenario: Verify the adding of a new workspace in the Patient context names the new workspace as 'Untitled Patient Workspace' with a sequential number at the end.
    Given the user is viewing the Workspace Manager window
    When the user selects the plus to add a new user defined workspace
    Then a new user defined workspace is added with the title "Untitled Patient Workspace 1"
    When the user selects the plus to add a new user defined workspace
    Then a new user defined workspace is added with the title "Untitled Patient Workspace 2"

@US18774_4 @US18777
Scenario: Verify that the adding of a new workspace in the Patient context displays the 'customize' link in the Customize column, and the 'launch' link is disabled in the Launch column.
    Given the user is viewing the Workspace Manager window
    When the user selects the plus to add a new user defined workspace
    Then a new user defined workspace is added with the title "Untitled Patient Workspace 1"
    
    And the new user defined workspace has a customize link
    And the new user defined workspace has a disabled launch link

# following user story requirements: @US5275 @US6030 @US6030 
# superceded by: US18774
@US18774
Scenario: Verify Launch Behavior - launch links
    Given the user is viewing the Workspace Manager window
    And the user creates a user defined workspace named "testlaunch"
    And the user defined workspace data screen id "testlaunch" is listed
    When the user customizes the "testlaunch" workspace
    And the user adds an summary "allergy_grid" applet to the user defined workspace
    And the user selects done to complete customizing the user defined workspace
    Then the "TESTLAUNCH" screen is active
    And the "Allergy" ("allergy_grid") summary applet is displayed
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    And the user defined workspace data screen id "testlaunch" is listed
    And the user defined workspace "testlaunch" has an enabled customize link
    And the user defined workspace "testlaunch" has an enabled launch link

