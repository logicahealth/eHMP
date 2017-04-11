@F339 @regression @triage
Feature: User Defined Work Spaces 2 - Cloning Existing Workspaces

Background:
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  When the user clicks the "Workspace Manager"
  And the user deletes all user defined workspaces

@US4490 @US4490_predefined
Scenario: Users can clone predefined workspace 
  Given workspace "documents-list" is listed
  When user clones the "documents-list" workspace
  Then the user defined workspace name "tile-documents-copy" is listed
  When the user navigates to "#documents-copy"
  Then the "Documents Copy" screen is active
  And the active screen displays 1 applets
  And the applets are displayed are
      | applet                 |
      | DOCUMENTS              |

@US4490 @US4490_userdefined
Scenario: Users can clone user defined workspace
  When the user clicks "Plus Button"
  And the user clicks "Customize"
  And the user adds an expanded "problems" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the User Defined Workspace 1 is active
  When the user clicks the "Workspace Manager"
  Then the user defined workspace name "user-defined-workspace-1" is listed
  When user clones the "user-defined-workspace-1" workspace
  Then the user defined workspace name "user-defined-workspace-copy" is listed
  When the user navigates to "#user-defined-workspace-copy"
  Then the "User Defined Workspace Copy" screen is active
  And the active screen displays 1 applets
  And the applets are displayed are
      | applet                 |
      | CONDITIONS             |
