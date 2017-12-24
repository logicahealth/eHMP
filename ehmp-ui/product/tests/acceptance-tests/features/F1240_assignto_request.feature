@F1240 @reg2
Feature: SDK Component Creation: Assign To

Background:
  Given POB user is logged into EHMP-UI with facility as  "kodak" accesscode as  "VK1234" verifycode as  "VK1234!!"
  And staff view screen is displayed
  When user searches for and selects "bcma,eight"
  Then Summary View is active

@Assign_1  
Scenario: Assign to - default

  Given the user views the Request - New tray
  Then the default Assign To is Me 
  And the new request Facility dropdown is not displayed
  And the new request Person dropdown is not displayed
  And the new request Team dropdown is not displayed
  And the new request Roles dropdown is not displayed

@Assign_2
Scenario: Assign to - Person
  Given the user views the Request - New tray
  And the user selects Assign to Person
  Then the new request Facility dropdown is displayed
  And the new request Facility dropdown defaults to user's facility "KODAK"
  And the new request Person dropdown is displayed


@Assign_4 
Scenario: Assign to - My Teams roles
  Given the user views the Request - New tray
  And the user selects Assign to My Teams
  And the new request Team dropdown is displayed
  When the user selects a new request Team
  Then the new request Roles dropdown is displayed

@Assign_7
Scenario: Assign to - Any Team
  Given the user views the Request - New tray
  When the user selects Assign to Any Team
  Then the new request Facility dropdown is displayed

@Assign_8
Scenario: Assign to - Any Team - Facility - Teams
  Given the user views the Request - New tray
  And the user selects Assign to Any Team
  And the new request Facility dropdown is displayed
  When the user selects "KODAK" request Facility
  Then the new request Team dropdown is displayed
  And the new request Team picklist displays a section for All Teams
  When the user selects a new request Team
  Then the new request Roles dropdown is displayed

@Assign_9 @assign_error
Scenario: Assign to - Any Team - Facility - Teams -- error Message
  Given the user views the Request - New tray
  And the user selects Assign to Any Team
  And the new request Facility dropdown is displayed
  When the user selects "MARTINSBURG" request Facility
  Then the dropdown error message "No teams with eHMP users at this facility. Try changing previous selection(s)." is displayed


@Assign_11 @assign_error
Scenario: Assign to - Patient's Team--error message

  Given the user views the Request - New tray
  And the user selects Assign to Patient's Team
  Then the dropdown error message "No teams with eHMP users for this patient. Try changing previous selection(s)." is displayed
 

