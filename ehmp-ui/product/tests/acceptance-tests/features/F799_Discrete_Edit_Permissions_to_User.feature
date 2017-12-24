@f799_discrete_edit_permissions_to_user @DE4560 @DS98 @reg3 @update_perm
Feature: F799-Add/Remove Additional Discrete Permissions to a User and Bulk Edit User Permissions

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

@F799_user_info_detail
Scenario: Verify User Information Detail Window
  Given the User Information Detail Window displays
  Then the User Information Detail Window displays user's full name "UATTHREE EHMP"
  And the User Information Detail Window displays VISTA status
  And the User Information Detail Window displays eHMP status
  And the User Information Detail Window displays First name "UATTHREE"
  And User Information Detail Window displays Last name "EHMP"
  And User Information Detail Window displays Permission Sets
  And User Information Detail Window displays Additional Individual Permissions
  And User Information Detail Window displays Facility
  And User Information Detail Window displays a Close button

@debug @DE7817 @F799_user_info_detail
Scenario: User Information Detail Window - once this is fixed combine with F799_user_info_detail scenario
  Given the User Information Detail Window displays
  And User Information Detail Window displays Facility value

@f799_edit_permissions_window
Scenario: Verify the Select Permissions window
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  Then the Select Permissions Window displays
  And the Select Permissions Window displays an Available Permission Sets section
  And the Select Permissions Window displays a Selected Permission Sets section
  And the Select Permissions Window displays an Available Additional Individual Permissions section
  And the Select Permissions Window displays a Selected Additional Individual Permissions section
  And the Select Permissions Window displays a Cancel and a Save button



@F799_filter_available_permission_sets
Scenario:  Verify user is able to filter available set list
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  When the authorized user filters the available permission sets by term "Dentist"
  Then the Available Permission Sets all include term "Dentist"


@F799_view_availabe_permission_set_details
Scenario: Verify user is able to view available set details
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And the Select Permissions Window displays an Available Permission Sets section
  When the authorized user views available permission set's details
  Then the avaiable permission set's details are displayed

@F799_view_availabe_permission_set_details @debug @DE7801
Scenario: Verify the available set details are populated
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  When the authorized user views available permission set's details
  Then the avaiable permission set's details are displayed
  Then permissions details contain data

@F799_view_selected_permission_set_details
Scenario: Verify user is able to view selected set details
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And there is at least 1 selected permission set
  When the authorized user views selected permission set's details
  Then the selected permission set's details are displayed

@F799_view_selected_permission_set_details @debug @DE7801
Scenario: Verify the selected set details are populated
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And there is at least 1 selected permission set
  When the authorized user views selected permission set's details
  Then the selected permission set's details are displayed
  Then permissions details contain data




@F799_filter_available_individual_permission
Scenario: Verify user is able to filter available individual permissions
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  When the authorized user filters the available individual permissions by term "Consult"
  Then the Available Individual Permission all include term "Consult"

@view_available_individual_permission_details 
Scenario: Verify user is able to view available individual details
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And there is at least 1 available individual permission
  When the authorized user views available individual permission's details
  Then the available individual permission details are displayed


@view_selected_individual_permission_details 
Scenario: Verify user is able to view selected individual details
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And individual permission "Add Consult Order" is selected
  When the authorized user views selected individual permission's details
  Then the available selected permission details are displayed



# I'm adding specific permissions. Some permissions trigger specific behavior so I don't want to accidently use them for generic, unrelated tests
@verify_add_individual @verify_save_individual @DE7848
Scenario: Verify user is able to add individual permissions
    Given the User Information Detail Window displays
    And POB authorized user edits the permission sets
    And the Select Permissions Window displays
    And the individual permission "Load Patient Sync" is not selected
    When the authorized user adds individual permission "Load Patient Sync"
    Then the individual permission  is added to the selected individual permission list
    And the authorized user saves the permissions
    Then the Select Permissions Window closes
    And the User Information Detail Window displays sucessful message
    And the Individual Permission section includes "Load Patient Sync"

@verify_remove_indvidual @verify_save_individual
Scenario: Verify user is able to remove individual permissions
  Given the User Information Detail Window displays
    And POB authorized user edits the permission sets
    And the Select Permissions Window displays
    And the individual permission "Load Patient Sync" is included in selected list
    When the authorized user removes individual permission "Load Patient Sync"
    Then the permission set is removed from the select individual permission list
    And the authorized user saves the permissions
    Then the Select Permissions Window closes
    And the User Information Detail Window displays sucessful message
    And the Individual Permission section does not include "Load Patient Sync"

@verify_cancel 
Scenario: Verify user is able to cancel permission changes
  Given the User Information Detail Window displays
    And POB authorized user edits the permission sets
    And the Select Permissions Window displays
    And the permission set "Anesthesiologist" is not selected
    And the individual permission "Add User Permission Set" is not selected
    When the authorized user adds permission set "Anesthesiologist"
    And the authorized user adds individual permission "Add User Permission Set"
    And the authorized user cancels the permission changes
    Then the Select Permissions Window closes
    And POB user is presented with user management table
    When POB user selects the row "EHMP UATTHREE" from the table
    Then the User Information Detail Window displays
    And the Permission Sets sections does not include set "Anesthesiologist"
    And the Individual Permission section does not include "Add User Permission Set"

@edit_own_1 @edit_own @DE6961
Scenario: Verify set Access Control Coordinator is automatically added when individual permissions Edit Own Permissions is selected
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And the individual permission "Edit Own Permissions" is not selected
  When the authorized user removes all Selected Permission Sets
  And the authorized user adds individual permission "Edit Own Permissions"
  Then the Selected Permissions Window displays an Auto Update message
  And the Permission Set "Access Control Coordinator" is added to the Selected Permissions Set

@edit_own_2 @edit_own @DE6961 @DE8353
Scenario: Verify user is unable to remove set Access Control Coordinator if they also have individual permission Edit Own Permissions
  Given the User Information Detail Window displays
  And POB authorized user edits the permission sets
  And the Select Permissions Window displays
  And the individual permission "Edit Own Permissions" is not selected
  And permission set "Access Control Coordinator" is selected
  And individual permission "Edit Own Permissions" is selected
  When the authorized user attempts to remove permission set "Access Control Coordinator"
  Then the Selected Permissions Window displays an Error Editing message


