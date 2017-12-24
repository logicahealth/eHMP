@F1240 @F1231 @reg2
Feature: SDK Component Creation: Assign To

Background:
  Given POB user is logged into EHMP-UI with facility as  "kodak" accesscode as  "VK1234" verifycode as  "VK1234!!"
  And staff view screen is displayed
  When user searches for and selects "eight,patient"
  Then Summary View is active
  And user sets current encounter with location "Cardiology" and provider "Audiologist,One"

@Assign_3
Scenario: Assign to - My Teams
  When the user views the Request - New tray
  And the user selects Assign to My Teams
  Then the new request Team dropdown is displayed
  And the new request Team picklist displays a section for My Teams Associated with Patient
  And the new request Team picklist displays a section for My Teams

@Assign_5 
Scenario: Assign to - Patient's teams
  When the user views the Request - New tray
  And the user selects Assign to Patient's Team
  Then the new request Team dropdown is displayed
  And the new request Team picklist displays a section for Teams Associated with Patient

@Assign_6 
Scenario: Assign to - Patient's teams roles

  Given the user views the Request - New tray
  And the user selects Assign to Patient's Team
  And the new request Team dropdown is displayed
  When the user selects a new request Team
  Then the new request Roles dropdown is displayed