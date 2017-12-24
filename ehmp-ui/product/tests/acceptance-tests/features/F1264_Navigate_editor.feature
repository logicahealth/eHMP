@F1264 @US18777 @reg3
Feature: Staff Context Workspaces - Navigation to the Patient Workspace Editor from Patient Workspace Manager

Background:
    Given user searches for and selects "Eight,Patient"
    And Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    And the user deletes all user defined workspaces
    
@US18777_1
Scenario: Verify users have a link to customize a user-defined patient workspace from the Patient Workspace Manager screen. On selection of the link to customize a workspace from the Patient Workspace Manager screen, verify the user is taken to the Patient Workspace Editor.
    Given the user is viewing the Workspace Manager window
    When the user creates a user defined workspace named "testeditor1"
    Then the user defined workspace named "testeditor1" has a customize link
    When the user customizes the "testeditor1" workspace
    Then the Workspace Editor is displayed

@US18777_2
Scenario: Verify users have a link to customize a workspace from the Patient Workspace Manager Workspace Preview screen. On selection of the link to customize a workspace from the Patient Workspace Manager Workspace Preview screen, verify the user is taken to the Patient Workspace Editor.
  Given the user is viewing the Workspace Manager window
  When the user creates a user defined workspace named "testeditor2"
  And the user customizes the "testeditor2" workspace
  And the user adds an summary "allergy_grid" applet to the user defined workspace
  And the user selects Go To Workspace Manager
  And the user is viewing the Workspace Manager window
  And the "testeditor2" preview option is enabled
  And the user previews the workspace for "testeditor2"
  Then the Preview window displays
  And the Preview window has a Customize button
  When the user selects the Preview window Customize button
  Then the Workspace Editor is displayed  

@US18777_3
Scenario: Verify that immutable workspaces in the patient context do not offer a 'customize' link in the Workspace Manager Preview modal.
  Given the user is viewing the Workspace Manager window
  When the user selects the Preview link for a pre-defined screen
  Then the Preview window displays
  And the Preview window does not have a Customize button


