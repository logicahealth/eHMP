@F1238 @F1238_Clinical_Reminders @Clinical_Reminders_applet @regression @reg4
Feature: Implement Tile Row Component - Clinical Reminders

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18308_Clinical_Reminders_Quick_Menu_Icon_Overview_screen
Scenario: User can view the Quick Menu Icon in clinical reminders applet summary view on overview screen
  Then Overview is active
  And user hovers over the clinical reminders applet row
  And user can view the Quick Menu Icon in clinical reminders applet
  And Quick Menu Icon is collapsed in clinical reminders applet
  When Quick Menu Icon is selected in clinical reminders applet
  Then user can see the options in the clinical reminders applet
  | options         | 
  | details         | 
  
@US18308_Clinical_Reminders_Quick_Menu_Icon_expand_view
Scenario: User can view the Quick Menu Icon in clinical reminders applet expand view
  And user navigates to Clinical Reminders Applet expanded view
  And user hovers over the clinical reminders applet row
  And user can view the Quick Menu Icon in clinical reminders applet
  And Quick Menu Icon is collapsed in clinical reminders applet
  When Quick Menu Icon is selected in clinical reminders applet
  Then user can see the options in the clinical reminders applet
  | options         | 
  | details         | 
  
@US18308_Clinical_Reminders_details_from_Quick_Menu_overview_screen
Scenario: User can view the details from Quick Menu Icon in clinical reminders applet on overview screen
  And Overview is active
  And user hovers over the clinical reminders applet row
  And user selects the detail view from Quick Menu Icon of clinical reminders applet
  Then the Clinical Reminders applet Detail modal displays details
  
@US18308_Clinical_Reminders_details_from_Quick_Menu_expand_view
Scenario: User can view the details from Quick Menu Icon in clinical reminders applet expand view
  And user navigates to Clinical Reminders Applet expanded view
  And user hovers over the clinical reminders applet row
  And user selects the detail view from Quick Menu Icon of clinical reminders applet
  Then the Clinical Reminders applet Detail modal displays details
