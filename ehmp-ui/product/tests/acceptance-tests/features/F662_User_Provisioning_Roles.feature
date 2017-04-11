@f662_user_provisioning_roles_write_back @regression @future
Feature: F662 : eHMP Release 1.3 User Provisioning & Roles

@f662_1_admin_applet_presence
Scenario: For authorized users the Administration Applet is present and accessible.
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  And user can view the Access Control Applet
 
@f662_2_admin_applet_form_validation
Scenario: Validate admin applet form fields.
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  When user views the Access Control Applet
  And the Access Control applet modal title says "Users FOR PANORAMA (9E7A)"
  And the Access Control applet modal displays labels
  | modal_item_labels 			|
  | first name			 		|
  | last name			  		|
  | select role		   			|
  | DUZ				  			|
  | show inactive vista users	|
  | show inactive ehmp users	|  
  And the Access Control applet detail modal displays fields
  | modal_item_form_fields					|
  | first name input box					|
  | last name input box						|
  | select role drop down					|
  | DUZ input box							|
  | show inactive vista users check box		|
  | show inactive ehmp users check box		|
#  And the Access Control applet detail modal has inactive "Search" button
  
@f662_3_user_not_view_notes_applet
Scenario: Only authorized users have permission to access notes applet.
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "tk1234" verifycode as  "tk1234!!"
  Then the patient search screen is displayed
  And user searches for and selects "eight,patient"
  And user doesn't have permission to access the "Notes Applet"
  
@f662_4_user_add_roles
Scenario: Authorized users can edit a users's role
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  When user views the Access Control Applet
  Then user enters "TRACY" in the first name field
  Then user enters "KEELEY" in the last name field
  And user searches for the user roles
  And user is presented with user management table
  And the "TRACY KEELEY" has "Read Access" and "Pharmacist" roles
  And the authorized user edits the roles
  And gives the following roles for user "TRACY KEELEY"
  | roles			|
  | Standard Doctor	|
  
@f662_5_user_view_notes_applet
Scenario: Authorized users can view the Notes Applet
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "tk1234" verifycode as  "tk1234!!"
  Then the patient search screen is displayed
  And user searches for and selects "eight,patient"
  And user has permission to access the "Notes Applet"
  
@f662_6_user_delete_roles
Scenario: Authorized users can delete a users's role
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  When user views the Access Control Applet
  Then user enters "TRACY" in the first name field
  Then user enters "KEELEY" in the last name field
  And user searches for the user roles
  And user is presented with user management table
  And the "TRACY KEELEY" has "Read Access", "Pharmacist" and "Standard Doctor" roles
  And the authorized user edits the roles
  #And deletes "Standard Doctor" role for user "TRACY KEELEY"
  And deletes the following roles for user "TRACY KEELEY"
  | roles 			|
  | Standard Doctor	|
  
@f662_7_user_edit_self
Scenario: Authorized users cannot edit their own roles
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  When user views the Access Control Applet
  Then user enters "VIHAAN" in the first name field
  Then user enters "KHAN" in the last name field
  And user searches for the user roles
  And user is presented with user management table
  And user chooses "VIHAAN KHAN" row
  And the authorized user edits the roles
  Then a message says "You are not allowed to edit your own permission"
  
@f662_8_user_remove_all_roles
Scenario: Authorized users can make a vista user inactive
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  When user views the Access Control Applet
  Then user enters "TRACY" in the first name field
  Then user enters "KEELEY" in the last name field
  And user searches for the user roles
  And user is presented with user management table
  And user chooses "TRACY KEELEY" row
  And the authorized user edits the roles
  And deletes the following roles for user "TRACY KEELEY"
  | roles 			|
  | Read Access 	|
  | Pharmacist  	| 
  | Standard Doctor	|
  
@f662_9_user_no_permission_to_login
Scenario: Inactive user cann't login
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "tk1234" verifycode as  "tk1234!!"
  Then user sees the login error message "You are not an authorized user of eHMP"
  
@f662_10_user_add_roles
Scenario: Authorized users can make a vista user inactive
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  When user views the Access Control Applet
  Then user enters "TRACY" in the first name field
  Then user enters "KEELEY" in the last name field
  Then user selects the "check box" "show inactive ehmp users"
  And user searches for the user roles
  And user chooses "TRACY KEELEY" row
  And the authorized user edits the roles
  And gives the following roles for user "TRACY KEELEY"
  | roles 			|
  | Read Access 	|
  | Pharmacist  	| 
