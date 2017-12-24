@F1238 @F1238_appointments @appointmentsandvisits @regression @reg4
Feature: Implement Tile Row Component - Appointments and Visits

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18306_Appt_Quick_Menu_Icon_Summary_screen
Scenario: User can view the Quick Menu Icon in Appointments applet on Summary screen
  And Summary View is active
  And the user has selected All within the global date picker
  And user hovers over the appointments applet row
  And user can view the Quick Menu Icon in appointments applet
  And Quick Menu Icon is collapsed in appointments applet
  When Quick Menu Icon is selected in appointments applet
  Then user can see the options in the appointments applet
  | options 				| 
  | details					| 
  
@US18306_Appt_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in Appointments applet on Coversheet screen
  Then Cover Sheet is active
  And the user has selected All within the global date picker
  And user hovers over the appointments applet row
  And user can view the Quick Menu Icon in appointments applet
  And Quick Menu Icon is collapsed in appointments applet
  When Quick Menu Icon is selected in appointments applet
  Then user can see the options in the appointments applet
  | options 				| 
  | details					| 
  
@US18306_Appt_Quick_Menu_Icon_Expand_view
Scenario: User can view the Quick Menu Icon in Appointments applet on Expand view
  And user navigates to expanded Appointments and Visits applet
  Given the user has selected All within the filter daterange on Appointments and Visits
  And user hovers over the appointments applet row
  And user can view the Quick Menu Icon in appointments applet
  And Quick Menu Icon is collapsed in appointments applet
  When Quick Menu Icon is selected in appointments applet
  Then user can see the options in the appointments applet
  | options 				| 
  | details					| 

@US18306_Appt_details_view_from_quick_menu_summary
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And Summary View is active
  And the user has selected All within the global date picker
  And Appointments applet loads without issue
  And user hovers over the appointments applet row
  When the selects the detail view button from Quick Menu Icon of the first appointments row
  Then the modal is displayed
  And the Appointment Detail modal displays 
      | modal item      |
      | Date            |
      | Type            |
      | Description     |
      | Patient class   |
      | Location        |
      | Status          |
      | Stop code       |
      | Facility        |
    
@US18306_Appt_details_view_from_quick_menu_coversheet
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  Then Cover Sheet is active
  And the user has selected All within the global date picker
  And Appointments applet loads without issue
  And user hovers over the appointments applet row
  When the selects the detail view button from Quick Menu Icon of the first appointments row
  Then the modal is displayed
  And the Appointment Detail modal displays 
      | modal item      |
      | Date            |
      | Type            |
      | Description     |
      | Patient class   |
      | Location        |
      | Status          |
      | Stop code       |
      | Facility        |
  
@US18306_Appt_details_view_from_quick_menu_expand_view
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And user navigates to expanded Appointments and Visits applet
  Given the user has selected All within the filter daterange on Appointments and Visits
  And the Appointments and Visits Applet contains data rows
  And user hovers over the appointments applet row
  When the selects the detail view button from Quick Menu Icon of the first appointments row
  Then the modal is displayed
  And the Appointment Detail modal displays 
      | modal item      |
      | Date            |
      | Type            |
      | Description     |
      | Patient class   |
      | Location        |
      | Status          |
      | Stop code       |
      | Facility        |
   
  