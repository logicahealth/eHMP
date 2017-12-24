@F1274 @reg3
Feature: Global Header Navigation 

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  Then staff view screen is displayed

@US18883_1
Scenario: Verify the staff view has Home link 
  Then the staff view screen has Home icon

@US18883_2 
Scenario: Verify the Home link navigates the user to the default Homepage workspace
  Given POB user views the Access Control Applet
  When user selects Home link 
  Then staff view screen is displayed

@US18883_3
Scenario: Verify the Home link navigates the user to the default Homepage workspace from patient view 
  Given user searches for and selects "BCMA,Eight"
  Then Overview is active
  When user selects Home link 
  Then staff view screen is displayed 