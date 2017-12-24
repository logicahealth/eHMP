@F1238 @F1238_vitals @vitals_applet @regression @reg4
Feature: Implement Tile Row Component - Vitals

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18335_Vitals_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in Vitals applet on Coversheet screen
  Then Cover Sheet is active
  And the user has selected All within the global date picker
  And user hovers over the vitals applet row
  And user can view the Quick Menu Icon in vitals applet
  And Quick Menu Icon is collapsed in vitals applet
  When Quick Menu Icon is selected in vitals applet
  Then user can see the options in the vitals applet
  | options 				| 
  | more information		| 
  | details					| 
  
@US18335_Vitals_Quick_Menu_Icon_Overview_screen
Scenario: User can view the Quick Menu Icon in Vitals applet on Overview screen
  Then Overview is active
  And the user has selected All within the global date picker
  And user hovers over the vitals applet trend view row
  And user can view the Quick Menu Icon in vitals applet
  And Quick Menu Icon is collapsed in vitals applet
  When Quick Menu Icon is selected in vitals applet
  Then user can see the options in the vitals applet
  | options 				| 
  | more information		| 
  | details					| 
  
@US18335_Vitals_popover_Overview_screen
Scenario: User can view the popover table in Vitals applet on Overview screen
  Then Overview is active
  And the user has selected All within the global date picker
  And user hovers over the vitals applet trend view row
  And there exists a quick view popover table in vitals applet
  Then a quickview displays a vitals table with expected headers 
  
@US18335_Vitals_Quick_Menu_Icon_Expand_view
Scenario: User can view the Quick Menu Icon in Vitals applet on Expand view
  And user navigates to expanded Vitals applet
  And the user clicks the All vitals range
  And user hovers over the vitals applet row
  And user can view the Quick Menu Icon in vitals applet
  And Quick Menu Icon is collapsed in vitals applet
  When Quick Menu Icon is selected in vitals applet
  Then user can see the options in the vitals applet
  | options 				| 
  | more information		| 
  | details					| 
  
@US18335_Vitals_details_view_from_quick_menu_coversheet
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  Then Cover Sheet is active
  And the user has selected All within the global date picker
  And user hovers over the vitals applet row
  And user selects the detail view from Quick Menu Icon of vitals applet
  Then the modal is displayed
  And the Vital Detail modal displays 
      | modal item     |
      | Vital          | 
      | Result         | 
      | Observed       | 
      | Facility       | 
      | Type		   |
      | Entered        |
      
@US18335_Vitals_details_view_from_quick_menu_overview
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And Overview is active
  And the user has selected All within the global date picker
  And user hovers over the vitals applet trend view row
  And user selects the detail view from Quick Menu Icon of vitals applet
  Then the modal is displayed
  And the Vital Detail modal displays 
      | modal item     |
      | Vital          | 
      | Result         | 
      | Observed       | 
      | Facility       | 
      | Type		   |
      | Entered        |
      
@US18335_Vitals_details_view_from_quick_menu_expand_view
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And user navigates to expanded Vitals applet
  And the user clicks the All vitals range
  And user hovers over the vitals applet row
  And user selects the detail view from Quick Menu Icon of vitals applet
  Then the modal is displayed
  And the Vital Detail modal displays 
      | modal item     |
      | Vital          | 
      | Result         | 
      | Observed       | 
      | Facility       | 
      | Type		   |
      | Entered        |

  