@F1142_logout @regression @reg2
Feature: Home Page usability  (Staff View)

#Team Application
   
@US17388_logout_staff_view_screen
Scenario: Sign out from eHMP staff view page
  Given staff view screen is displayed
  And user logs out
  
@US17388_logout_overview_screen
Scenario: Sign out from eHMP overview page
  Given user searches for and selects "BCMA,Eight"
  Then Overview is active
  And user logs out
  
@US17388_logout_coversheet_screen
Scenario: Sign out from eHMP coversheet page
  Given user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And user logs out
  
@US17388_logout_documents_applet
Scenario: Sign out from eHMP documents applet
  Given user searches for and selects "BCMA,Eight"
  And user navigates to Documents Applet
  Then the Documents Expanded applet is displayed
  And user logs out
  
@US17388_logout_timeline_applet
Scenario: Sign out from eHMP timeline applet
  Given user searches for and selects "BCMA,Eight"
  And user navigates to Timeline Applet
  Then the Timeline Summary applet is displayed
  And user logs out
  
@US17388_logout_medsreview_applet
Scenario: Sign out from eHMP Meds Review applet
  Given user searches for and selects "BCMA,Eight"
  And user navigates to Meds Review Applet
  Then the Med Review applet is displayed
  And user logs out
  
@US17388_logout_cancel
Scenario: Verify user stays on same page when canceling logout
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  And user attempts logout
  Then user presented with modal dialog
  And user decides to cancel logout
  And logout is cancelled
  And staff view screen is displayed
  
@US17388_logout_custom_workspace
Scenario: Verify user can logout from user defined workspace
  Given user searches for and selects "BCMA,Eight"
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  And the user creates a user defined workspace named "vistaClinicalRemindersview"
  When the user customizes the "vistaclinicalremindersview" workspace
  And the user adds an summary "cds_advice" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "VISTACLINICALREMINDERSVIEW" screen is active
  And the active screen displays 1 applets
  And the applets are displayed are
      | applet                 	|
      | CLINICAL REMINDERS		|
  And user logs out
