@F363_Clinical_Reminders  @US5046 @US5146 @US5147
Feature: F363 - CDS Work Product Management

Background:
  Given user searches for and selects "Eight,Patient"
  And Overview is active
  And the Clinical Reminders applet is displayed

@f363_clinical_reminders_trend_view_display
Scenario: User views Clinical Reminders applet on Overview      
  Then Clinical Reminders applet loaded successfully
  
@f363_clinical_reminders_trend_view_display_headers
Scenario: User views Clinical Reminders applet on Overview  
  And Clinical Reminders applet contians headers
  | headers |
  | Priority|
  | Title   |
  | Type	|
  | Due Date|
  
@f363_clinical_reminders_trend_view_display_buttons
Scenario: Clinical Reminders trend view displays buttons refresh, expand, help and filter
  And Clinical Reminders applet displays Refresh button
  And Clinical Reminders applet displays Expand View button
  And Clinical Reminders applet displays Help button
  And Clinical Reminders applet displays Filter Toggle button
  
#@f363_clinical_reminders_trend_view_help @test
#Scenario: User can open help from Clinical Reminders trend view
#  When user opens the Clinical Reminders applet help
#  Then user is navigated to the help page
  
@f363_clinical_reminders_trend_view_refresh
Scenario: Clinical Reminders applet displays all of the same details after applet is refreshed
  When user refreshes Clinical Reminders applet
  Then the message on the Clinical Reminders applet does not say an error has occurred
  
@f363_clinical_reminders_details_view_from_overview @DE6433 @debug
Scenario: User can view the detail view of Clinical Reminders applet
  When user opens the first Clincial Reminders detail view
  Then the detail modal is displayed
  And the Clinical Reminders applet Detail modal displays details
  
@f363_clinical_reminders_expand_view_from_trend_view
Scenario: User can expand Clinical Reminders applet from trend view
  When user expands the Clinical Reminders Applet
  Then Clinical Reminders expand view applet is displayed
  And Clinical Reminders applet loaded successfully
  When user closes the Clinical Reminders Applet expand view
  Then user is navigated back to overview page 
  
@f363_clinical_reminders_expand_view_display_buttons
Scenario: User can see minimize button from exapnd view
  When user expands the Clinical Reminders Applet
  Then Clinical Reminders expand view applet is displayed
  And Clinical Reminders applet loaded successfully
  And Clinical Reminders applet displays Minimize View button
  
@f363_clinical_reminders_expand_view_display_buttons
Scenario: Clinical Reminders expand view displays buttons refresh, expand, help and filter
  When user navigates to Clinical Reminders Applet expanded view
  Then Clinical Reminders applet displays Refresh button
 # And Clinical Reminders applet displays Minimize View button
  And Clinical Reminders applet displays Help button
  And Clinical Reminders applet displays Filter Toggle button
  
@f363_clinical_reminders_exapnd_view_refresh
Scenario: Clinical Reminders applet displays all of the same details after expanded applet is refreshed
  When user navigates to Clinical Reminders Applet expanded view
  When user refreshes Clinical Reminders applet
  Then the message on the Clinical Reminders applet does not say an error has occurred
  
@f363_clinical_reminders_details_view_from_expand_view @DE6433 @debug
Scenario: User can view the detail view of Clinical Reminders applet
  When user navigates to Clinical Reminders Applet expanded view
  And user opens the first Clincial Reminders detail view
  Then the detail modal is displayed
  And the Clinical Reminders applet Detail modal displays details   
  
@f363_clinical_reminders_filter
Scenario: Clinical Reminders applet is able to filter data based on search
  When the user opens Clinical Reminders search filter
  And the user filters the Clinical Reminders Applet by text "hypertension"
  Then the Clinical Reminders table only displays rows including text "hypertension"
  
@f363_clinical_reminders_sorting
Scenario: Verify that by selecting the column title 'Title', the applet sorts by title 
  When the user sorts the Clinical Reminders applet by column Title
  Then the Clinical Reminders applet sorts the title in alphabetical order
  
@f363_clinical_reminders_add_to_workspace
Scenario: VERIFY Clinical Reminders can be added to a user defined workspace
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

