@f799_discrete_edit_permissions_to_user @DE4560 @reg3
Feature: F799-Add/Remove additional Discrete Permissions to a User and Bulk Edit user permissions

@f799_discrete_permissions_access_control_applet1
Scenario: Accessing Access Control Coordinator in eHMP
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user roles
  Then POB user is presented with user management table

@f799_discrete_permissions_access_control_applet2
Scenario: Access Control Coordinator - User Information Detail Window
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "EHMP UATTHREE" from the table
  And POB Access Control applet modal displays user info
  |headers          |
  |First Name       |
  |Last Name        |
  |Permission Sets  |
  |Additional Individual Permissions|
  |Facility                         |
  And POB authorized user edits the roles
  Then POB new modal window displayed with title "Select Permissions For PANORAMA User:"
  And POB user permission modal window contains title "Available Permission Sets"
  And POB available permission sets displays Filter option
  And POB the window displays available permission sets data
  And POB Available Permission Sets column displays correct count of "Add", "Remove" and detail button
  And POB Selected Permission Sets column displays correct count of "Add", "Remove" and detail button
  And POB "Add" a permission Set to the user from Available Permission set
  And POB Selected Permission Sets column displays correct count of "Add", "Remove" and detail button after modification

@f799_discrete_permissions_access_control_applet3
Scenario: Access Control Coordinator – Available Permission Sets
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "EHMP UATTHREE" from the table
  And POB authorized user edits the roles
  Then POB new modal window displayed with title "Select Permissions For PANORAMA User:"
  And POB user permission modal window contains title "Selected Permission Sets"
  And POB user clicks on a details button from Available permission sets
  And POB pop up window displays the header contains "details for"
  And POB user clicks on a details button from Available permission sets
  And POB pop up window is hidden again
  And POB total count of the selected permission sets are displayed
  And POB Remove a permission from selected permission sets
  And POB verify the total count of selected permission after modification

@f799_discrete_permissions_access_control_applet4
Scenario: Access Control Coordinator - Additional Individual Permissions
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "EHMP UATTHREE" from the table
  And POB authorized user edits the roles
  Then POB new modal window displayed with title "Select Permissions For PANORAMA User:"
  And POB title "Available Additional Individual Permissions" is displayed down below Available Additional Permissions
  And POB Available Additional Permission Sets column displays correct count of "Add", "Remove" and detail button
  And POB user clicks on a details button from Available Additional permission sets
  And POB a pop-up window displays a table with two below columns and details
  |heading    |
  |Description|
  |Example    |
  And POB user clicks on a details button from Available Additional permission sets
  And POB pop up window is hidden again
  And POB "Add" a permission Set to the user from Available Additional Ind Permission set and verify the total count
  And POB "Add" a permission Set to the user from Available Additional Ind Permission set and verify the total count
  And POB user is directed to the User Information screen after click on save
  And POB user is navigated to the Summery View after closes the User Info Screen

@f799_discrete_permissions_access_control_applet5
Scenario: Access Control Coordinator - Delete Discreet Permissions
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "EHMP UATTHREE" from the table
  And POB authorized user edits the roles
  And POB new modal window displayed with title "Select Permissions For PANORAMA User:"
  And POB "Add" a permission Set to the user from Available Additional Ind Permission set and verify the total count
  Then POB "Remove" a permission Set to the user from Selected Additional Ind Permissions and verify the total count
  And POB "Remove" all permissions from Available Permission sets and verify the total count in Selected Permission sets
  And POB user is directed to the User Information screen after click on save

@f799_discrete_permissions_access_control_applet6_1
Scenario: Access Control Coordinator - Edit Own Permissions
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "EHMP UATTHREE" from the table
  And POB authorized user edits the roles
  And POB new modal window displayed with title "Select Permissions For PANORAMA User:"
  And POB "Remove" all permissions from Available Permission sets and verify the total count in Selected Permission sets
  Then POB add permission corresponding to "Edit Own Permissions" from Available Additional Ind Permissions
  And POB user is directed to the User Information screen after click on save
  And POB user is navigated to the Summery View after closes the User Info Screen

@f799_discrete_permissions_access_control_applet6_2
Scenario: Access Control Coordinator - Edit Own Permissions
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "ua1234" verifycode as  "ua1234!!"
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And POB user expands Access Control Applet
  And POB user enters "UATTHREE" in the first name field
  And POB user enters "EHMP" in the last name field
  And POB user searches for the user roles
  And POB user is presented with user management table
  And POB user selects the row "EHMP UATTHREE" from the table
  And POB authorized user edits the roles
  And POB new modal window displayed with title "Select Permissions For PANORAMA User:"
  Then POB "Add" a permission Set to the user from Available Permission set
  And POB Selected Permission Sets column displays correct count of "Add", "Remove" and detail button after modification
  And POB "Add" a permission Set to the user from Available Additional Ind Permission set and verify the total count
  And POB "Remove" a permission Set to the user from Selected Permission Sets
  And POB verify the error message shown "You are not allowed to remove 'Access Control Coordinator'" in Available Permission Sets column
  And POB remove permission corresponding to "Edit Own Permissions" from Available Additional Ind Permissions
  And POB verify the error message shown "You are not allowed to remove 'Edit Own Permissions'" in Additional Ind column
  And POB user is navigated to the Summery View after closes the edit permission Screen
