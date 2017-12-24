@F1285 @F1285_permission_sets @reg3 @access_control_applet
Feature: F1285 : Edit Permission Set thru UI

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And user can view the Permission Set Applet
  
@US19006_permission_set_display_buttons
Scenario: Verify permission sets applet displays all buttons   
  And Permission Sets applet displays Refresh button
  And Permission Sets applet displays Expand View button
  And Permission Sets applet displays Help button
  And Permission Sets applet displays Filter Toggle button
  
@US19006_permission_set_applet_refresh
Scenario: Permission Sets applet displays all of the same details after applet is refreshed
  When user refreshes Permission Sets applet
  Then the message on the Permission Sets applet does not say an error has occurred
  
@US19006_permission_set_applet_expand_view_display_buttons
Scenario: User can see minimize button from exapnd view
  When user expands the Permission Sets applet
  Then Permission Sets applet expand view applet is displayed
  And Permission Sets applet displays Minimize View button
  
@US19006_permission_set_applet_expand_view
Scenario: User can expand Permission Sets applet
  When user expands the Permission Sets applet
  Then Permission Sets applet expand view applet is displayed
  When user closes the Permission Sets applet expand view
  Then user is navigated back to Access Control workspace 
  
@US19006_permission_set_applet_sorting
Scenario: Verify that by selecting the column title 'Set Name', the applet sorts by set name 
  When the user sorts the Permission Sets applet by column Set Name
  Then the Permission Sets applet sorts the Set Name field in alphabetical order