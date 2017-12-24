@F1285 @F1285_edit_permission_set @reg3 @access_control_applet
Feature: F1285 : Edit Permission Set thru UI

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed
  
@US19006_individual_permission_and_permission_set_applet
Scenario: Verify individual permission applet and permissions set applet are added to Access Control tab  
  And POB user views the Access Control Applet
  And user can view the Individual Permission Applet
  And Individual Permission Applet contains headers
  | headers 	|
  | Name		|
  | Description	|
  | Status		|
  And user can view the Permission Set Applet
  And Permission Set Applet contains headers
  | headers 		|
  | Set Name		|
  | Category		|
  | Status			|
  | Created On		|
  | Created By		|
  | Edited On		|
  | Edited By		|
  | Nat. Access		|
  
@US18962_new_individual_permissions
Scenario: Verify new individual permissions are added
  And user navigates to expanded individual permissions applet
  And user filters the individual permissions applet with text "sets"
  Then the table contains individual permissions 
    | Permission                | Nat Access|
    | Add Permission Sets       | Yes		|
    | Deprecate Permission Sets | Yes		| 
    | Edit Permission Sets      | Yes		|
    | Read Permission Sets      | No		|

@US18964_add_permission_set @US18966_edit_permission_set @US18965_deprecate_permission_set @run
Scenario: Verify authorized users can create new permission sets
  And user navigates to expanded permission sets applet
  And the user takes note of number of existing permission sets
  And user adds a new permission set
  And user selects the permission set name as "AFS Test Team"
  And permission set status defaults to "Active"
  And user selects the permission set categories as "Nurse"
  And user selects the description as "created for testing purposes"
  And user selects the notes as "created for testing purposes"
  And user selects the examples as "created for testing purposes"
  And user goes to the next screen
  And user selects a permission set and feature category
  And user selects individual permission Add Consult Order
  And user submits the permission set
  Then a permission set is added to the applet
  And user views the details of the permission set "AFS Test Team" with a status "active"
  And user edits the permission set
  And user selects the permission set categories as "Clerk"
  And user submits the permission set
  Then the permission set "AFS Test Team" is updated with categories "Clerk, Nurse"
  And when user deprecates the permission set
  Then the permission set is updated as deprecated
  
@US19013_individual_permission_details
Scenario: Verify authorized users can view details of a selected individual permission
  And user navigates to expanded individual permissions applet
  And user hovers over the individual permission applet row
  And user selects the detail view from Quick Menu Icon of individual permission applet
  And individual permission detail view contain fields
  | fields						|
  | Feature Category			|
  | Introduced in eHMP version	|
  | Starts at eHMP version		|
  | Ends at eHMP version		|
  | Deprecated in eHMP version	|
  | Created On					|
  | National Access				|
  | Description					|
  | Notes						|
  | Examples					|
  | Assigned Permission Set(s)	|
  
@US19010_permission_set_details
Scenario: Verify authorized users can view details of a selected permission set
  And user navigates to expanded permission sets applet
  And user hovers over the permission sets applet row
  And user selects the detail view from Quick Menu Icon of permission sets applet
  And permission sets detail view contain fields
  | fields						|
  | Category					|
  | Introduced in eHMP version	|
  | Deprecated in eHMP version	|
  | National Access				|
  | Created On					|
  | Created By					|
  | Edited On					|
  | Edited By					|
  | Description					|
  | Notes						|
  | Examples					|
  | Individual Permission		|
  
@US18968_update_inactive
Scenario: Update the status for a permission set to "inactive"
  And user navigates to expanded permission sets applet
  And the user takes note of number of existing permission sets
  And user adds a new permission set
  And user selects the permission set name as "AFS Test Team2"
  And user selects the permission set categories as "Nurse"
  And user selects the description as "created for testing purposes"
  And user goes to the next screen
  And user selects a permission set and feature category
  And user selects individual permission Add Consult Order
  And user submits the permission set
  Then a permission set is added to the applet
  And user views the details of the permission set "AFS Test Team2" with a status "active"
  And user edits the permission set
  And user updates status to be inactive
  And user submits the permission set
  Then the permission set is updated as inactive
  
  