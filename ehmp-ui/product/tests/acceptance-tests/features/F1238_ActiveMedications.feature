@F1238 @F1238_activemeds @activemeds_applet @regression @reg4
Feature: Implement Tile Row Component - Active and Recent Medications

#Team Application
   
Background:

  Given user searches for and selects "Onehundredninetysix,Patient"

@US18301_activemeds_Quick_Menu_Icon_Summary_screen
Scenario: User can view the Quick Menu Icon in Active Medications applet on summary screen
  And Summary View is active
  And user scrolls the activemeds applet into view
  And user hovers over the activemeds applet trend view row
  And user can view the Quick Menu Icon in activemeds applet
  And Quick Menu Icon is collapsed in activemeds applet
  When Quick Menu Icon is selected in activemeds applet
  Then user can see the options in the activemeds applet
  | options 				| 
  | more information		| 
  | details					| 
  
@US18301_activemeds_popover_Summary_screen
Scenario: User can view the Quick popover table in Active Medications applet on summary screen
  And Summary View is active
  And user scrolls the activemeds applet into view
  And user hovers over the activemeds applet trend view row
  And there exists a quick view popover table in activemeds applet
  And activemeds quick look table contains headers
  |Headers 		|
  | Last Update |
  | Medication 	| 
  | Sig	 		|
  | Since		|
   
@US18301_activemeds_Quick_Menu_Icon_Overview_screen
Scenario: User can view the Quick Menu Icon in activemeds applet trend view on overview screen
  And Overview is active
  And user hovers over the activemeds applet trend view row
  And user can view the Quick Menu Icon in activemeds applet
  And Quick Menu Icon is collapsed in activemeds applet
  When Quick Menu Icon is selected in activemeds applet
  Then user can see the options in the activemeds applet
  | options 				| 
  | more information		| 
  | details					| 
  
@US18301_activemeds_popover_Overview_screen
Scenario: User can view the Quick Menu Icon in activemeds applet trend view on overview screen
  And Overview is active
  And user hovers over the activemeds applet trend view row
  And there exists a quick view popover table in activemeds applet
  And activemeds quick look table contains headers
  |Headers 		|
  | Last Update |
  | Medication 	| 
  | Sig	 		|
  | Since		|
  
@US18301_activemeds_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in activemeds applet summary view on coversheet screen
  Then Cover Sheet is active
  And user hovers over the activemeds applet row
  And user can view the Quick Menu Icon in activemeds applet
  And Quick Menu Icon is collapsed in activemeds applet
  When Quick Menu Icon is selected in activemeds applet
  Then user can see the options in the activemeds applet
  | options 				| 
  | more information		| 
  | details					| 
  
@US18301_activemeds_details_view_from_quick_menu_summary
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And Summary View is active
  And user scrolls the activemeds applet into view
  And user hovers over the activemeds applet trend view row
  And user selects the detail view button from Quick Menu Icon of the first activemeds row
  Then the modal is displayed
  Then the detail view displays
      | header             |
      | Order History      |
      | Links              |
      | Patient Education  |
  
@US18301_activemeds_details_view_from_quick_menu_overview
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And Overview is active
  And user hovers over the activemeds applet trend view row
  And user selects the detail view button from Quick Menu Icon of the first activemeds row
  Then the modal is displayed
  Then the detail view displays
      | header             |
      | Order History      |
      | Links              |
      | Patient Education  |
  
@US18301_activemeds_details_view_from_quick_menu_coversheet
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And Cover Sheet is active
  And user hovers over the activemeds applet row
  And user selects the detail view button from Quick Menu Icon of the first activemeds row
  Then the modal is displayed
  Then the detail view displays
      | header             |
      | Order History      |
      | Links              |
      | Patient Education  |
 
