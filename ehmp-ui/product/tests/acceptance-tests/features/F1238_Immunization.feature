@F1238  @F1238_Immunization @immunization_applet @regression @reg2
Feature: Implement Tile Row Component - Immunization

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"
  
@US18318_immunization_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in Immunization applet on Coversheet screen
  Then Cover Sheet is active
  And user hovers over the immunization row
  And user can view the Quick Menu Icon in immunization applet
  And Quick Menu Icon is collapsed in immunization applet
  When Quick Menu Icon is selected in immunization applet
  Then user can see the options in the immunization applet
  | options 				|  
  | details					| 
  | more information      	|
  | add new item			|
  
@US18318_immunization_Quick_Menu_Icon_Overview_screen
Scenario: User can view the Quick Menu Icon in Immunization applet on Overview screen
  Then Overview is active
  And user hovers over the immunization pill
  And user can view the Quick Menu Icon in immunization applet
  And Quick Menu Icon is collapsed in immunization applet
  When Quick Menu Icon is selected in immunization applet
  Then user can see the options in the immunization applet
  | options 				|  
  | details					| 
  | more information      	|
  | add new item			|
  
@US18318_immunization_popover_overview_screen
Scenario: User can view the popover table in immunization applet on overview screen
  Then Overview is active
  And user hovers over the immunization pill
  And there exists a quick view popover table in immunization applet
  And immunization quick look table contains headers
    |Headers 		|
    | Date   		|
    | Series 		| 
    | Reaction 		|
    | Since			|
  
@US18318_immunization_Quick_Menu_Icon_Expand_view
Scenario: User can view the Quick Menu Icon in Immunization applet on Expand view
  When user navigates to immunization expanded view
  And user hovers over the immunization row
  And user can view the Quick Menu Icon in immunization applet
  And Quick Menu Icon is collapsed in immunization applet
  When Quick Menu Icon is selected in immunization applet
  Then user can see the options in the immunization applet
  | options 				|  
  | details					| 
  | more information      	|
  | add new item			|
  
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

  