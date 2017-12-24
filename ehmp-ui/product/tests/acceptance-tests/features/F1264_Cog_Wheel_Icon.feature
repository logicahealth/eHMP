@F1264 @US18776 @reg4
Feature: Staff Context Workspaces - Navigation to the Patient Workspace Editor from Workspace

Background:
     Given user searches for and selects "Eight,Patient"
     And Overview is active

@US18776_1
Scenario: Verify the cog wheel icon does not offer users a link to edit the current workspace in the patient context when viewing an immutable workspace, and instead offers a reason why customization is not possible.   
     Given user views and selects cog wheel icon
     And user has link to edit the current workspace
     And user views message This workspace is locked and cannot be customized 

@US18776_2
Scenario: On selection of the link to Manage patient workspaces in patient context when viewing an immutable workspace, user is taken to patient Workspace Manager.
     Given user views and selects cog wheel icon
     When user selects link to Manage patient workspaces
     Then the Workspace Manager is displayed 

@US18776_3
Scenario: Verify the cog wheel icon offers users a link to edit the current workspace in the patient context when viewing a user-defined workspace. 
     And the user clicks the Workspace Manager
     And the user deletes all user defined workspaces
     And the user creates a user defined workspace named "verifyurl"
     And the user customizes the "verifyurl" workspace
     And the user selects done to complete customizing the user defined workspace
     When the "VERIFYURL" screen is active
     Then user views and selects cog wheel icon
     And user has link to edit the current workspace
     And user has link to edit the Customize this workspace

@US18776_4
Scenario: On selection of the link to edit the current workspace in the patient context when viewing a user-defined workspace, the user is taken to the Patient Workspace Editor that user is working on 
     And the user clicks the Workspace Manager
     And the user deletes all user defined workspaces
     And the user creates a user defined workspace named "verifyurl"
     And the user customizes the "verifyurl" workspace
     And the user selects done to complete customizing the user defined workspace
     When the "VERIFYURL" screen is active
     And user views and selects cog wheel icon
     And user selects link Customize this workspace

     Then the Workspace Editor is displayed
     And the Worspace Editor is displaying the "verifyurl" workspace


@US18776_5
Scenario: on selection of the link to Manage patient workspaces in the patient context when viewing a user-defined workspace,  user is taken to patient Workspace Manager
     And the user clicks the Workspace Manager
     And the user deletes all user defined workspaces
     And the user creates a user defined workspace named "verifyurl"
     And the user customizes the "verifyurl" workspace
     And the user selects done to complete customizing the user defined workspace
     When the "VERIFYURL" screen is active
     And user views and selects cog wheel icon
     And user selects link to Manage patient workspaces
     Then the Workspace Manager is displayed  


