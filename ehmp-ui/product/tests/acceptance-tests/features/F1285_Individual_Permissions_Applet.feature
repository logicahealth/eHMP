@F1285 @F1285_individual_permission @reg3 @access_control_applet
Feature: F1285 : Edit Permission Set thru UI

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed
  And POB user views the Access Control Applet
  And user can view the Individual Permission Applet
  
@US19006_individual_permission_display_buttons
Scenario: Verify individual permission applet displays all buttons   
  And Individual Permissions applet displays Refresh button
  And Individual Permissions applet displays Expand View button
  And Individual Permissions applet displays Help button
  And Individual Permissions applet displays Filter Toggle button
  
@US19006_individual_permission_applet_refresh
Scenario: Individual Permissions applet displays all of the same details after applet is refreshed
  When user refreshes Individual Permissions applet
  Then the message on the Individual Permissions applet does not say an error has occurred
  
@US19006_individual_permission_applet_expand_view_display_buttons
Scenario: User can see minimize button from exapnd view
  When user expands the Individual Permissions applet
  Then Individual Permissions applet expand view applet is displayed
  And Individual Permissions applet displays Minimize View button
  
@US19006_individual_permission_applet_expand_view
Scenario: User can expand Individual Permissions applet
  When user expands the Individual Permissions applet
  Then Individual Permissions applet expand view applet is displayed
  When user closes the Individual Permissions applet expand view
  Then user is navigated back to Access Control workspace 
  
@US19006_individual_permission_applet_sorting
Scenario: Verify that by selecting the column title 'Name', the applet sorts by Name 
  When the user sorts the Individual Permissions applet by column Name
  Then the Individual Permissions applet sorts the Name field in alphabetical order


  