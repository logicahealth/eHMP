@f662_pob_access_control_write_back @regression @DE4326 @future @DE4560
Feature: F662 : eHMP Release 1.3 User Provisioning & Roles

#The applet doesn't display completely in phantom JS due to latest CSS gridster changes

@f662_pob_admin_applet_presence
Scenario: For authorized users the Administration Applet is present and accessible.
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  Then POB user can view the Access Control Applet
 
@f662_pob_admin_applet_form_validation
Scenario: Validate admin applet form fields.
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  Then POB Access Control applet modal title says "USERS FOR PANORAMA (9E7A)"
  And POB Access Control applet modal displays labels
  | modal_item_labels 			|
  | Last Name			 		|
  | First Name			  		|
  | Select Permission Set		|
  | DUZ				  			|
  | Include Inactive VistA Users|
  | Include Inactive eHMP Users	|  
  And POB Access Control applet detail modal has "Search" button
  
@f662_pob_user_not_view_notes_applet
Scenario: Only authorized users have permission to access notes applet.
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "tk1234" verifycode as  "tk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And user searches for and selects "eight,patient"
  And Overview is active
  Then POB user doesn't have permission to access the Notes Applet
  
@f662_pob_user_add_roles @add_remove
Scenario: Authorized users can edit a users's role
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "TRACY" in the first name field
  And POB user enters "KEELEY" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "TRACY KEELEY" from the table
  Then POB user "TRACY KEELEY" does not have the following roles
   | roles |
   | Standard Doctor  |

  And POB authorized user edits the roles
  And POB user gives the following roles for user "TRACY KEELEY"
  | roles			|
  | Standard Doctor	|
  Then POB user "TRACY KEELEY" has following roles
    | roles           |
    | Standard Doctor |
  
@f662_pob_user_view_notes_applet
Scenario: Authorized users can view the Notes Applet
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "tk1234" verifycode as  "tk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And user searches for and selects "eight,patient"
  And Overview is active
  Then POB user has permission to access the Notes Applet
  
@f662_pob_user_edit_self
Scenario: Authorized users cannot edit their own roles
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "VIHAAN" in the first name field
  And POB user enters "KHAN" in the last name field
  And POB user searches for the user roles
  Then POB user is presented with user management table
  And POB user selects the row "VIHAAN KHAN" from the table
  And POB authorized user cannot edit the roles

@f662_pob_user_remove_single_role
Scenario: Authorized users can make a vista user inactive
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "TRACY" in the first name field
  And POB user enters "KEELEY" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "TRACY KEELEY" from the table

  Then POB user "TRACY KEELEY" has following roles
    | roles           |
    | Standard Doctor |
  And POB authorized user edits the roles
  Then POB user deletes the following roles for user "TRACY KEELEY"
    | roles       |
    | Standard Doctor |
  Then POB user "TRACY KEELEY" does not have the following roles
   | roles |
   | Standard Doctor  |


@f662_pob_user_remove_all_roles @add_remove
Scenario: Authorized users can make a vista user inactive
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "TRACY" in the first name field
  And POB user enters "KEELEY" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "TRACY KEELEY" from the table
  And POB authorized user edits the roles
  Then POB user deletes all roles for user "TRACY KEELEY"
  Then POB user "TRACY KEELEY" has following roles
    | roles           |
    | None            |

  
@f662_pob_user_no_permission_to_login 
Scenario: Inactive user cann't login
  When POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "tk1234" verifycode as  "tk1234!!"
  Then POB user sees the login error message "You are not an authorized user of eHMP"
  
@f662_pob_user_add_back_roles
Scenario: Authorized users can add user roles
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  And staff view screen is displayed
  When Navigate to Patient Search Screen
  And the patient search screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "TRACY" in the first name field
  And POB user enters "KEELEY" in the last name field
  And POB user selects the check box include inactive ehmp users
  And POB user searches for the user roles
  And POB user selects the row "TRACY KEELEY" from the table
  Then POB user "TRACY KEELEY" does not have the following roles
   | roles         |
   | Read Access   |
   | Pharmacist    | 
  And POB authorized user edits the roles
  Then POB user gives the following roles for user "TRACY KEELEY"
    | roles 			  |
    | Read Access 	|
    | Pharmacist  	| 
  Then POB user "TRACY KEELEY" has following roles
    | roles           |
    | Read Access     |
    | Pharmacist      | 
