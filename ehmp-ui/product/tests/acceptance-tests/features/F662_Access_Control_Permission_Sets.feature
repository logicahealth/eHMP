@F662 @reg3 @update_perm
Feature: F662 : eHMP Release 1.3 User Provisioning & Permission Sets

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user permission sets
  And POB user is presented with user management table
  And POB user selects the row "EHMP UATTHREE" from the table
  And the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And the Select Permissions Window displays an Available Permission Sets section

  @F662 @verify_add_set @verify_save_set
  Scenario: Authorized users can edit a user's permission set
    Given the permission set "Anesthesiologist" is not selected
    When the authorized user adds permission set "Anesthesiologist"
    Then the permission set is added to the selected permission set list
    And the authorized user saves the permissions
    Then the Select Permissions Window closes
    And the User Information Detail Window displays sucessful message
    And the Permission Sets sections includes set "Anesthesiologist"

  @F662 @verify_remove_set @verify_save_set
  Scenario: Authorized users can remove a user's permission set
    Given the permission set "Anesthesiologist" is selected
    When the authorized user removes permission set "Anesthesiologist"
    Then the permission set is removed from the select permission set list
    And the authorized user saves the permissions
    Then the Select Permissions Window closes
    And the User Information Detail Window displays sucessful message
    And the Permission Sets sections does not include set "Anesthesiologist"