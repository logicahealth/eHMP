@F1240 @reg2
Feature: SDK Component Creation: Assign To

@Assign_10 @assign_error
Scenario: Assign to - My Teams roles--error message
  When user searches for and selects "bcma,eight"
  Then Summary View is active
  Given the user views the Request - New tray
  And the user selects Assign to My Teams
  And the new request Team dropdown is displayed
  Then the dropdown error message "No teams with eHMP users. Try changing previous selection(s)." is displayed

