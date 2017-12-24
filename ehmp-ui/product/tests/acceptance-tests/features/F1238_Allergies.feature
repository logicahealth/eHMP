@F1238 @F1238_Allergies @regression @reg4
Feature: Implement Tile Row Component - Allergies

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18304_allergies_Quick_Menu_Icon_Summary_screen
Scenario: User can view the Quick Menu Icon in Allergies applet on summary screen
  And Summary View is active
  And user scrolls the allergies applet into view
  And user hovers over the allergy pill
  And user can view the Quick Menu Icon in allergies applet
  And Quick Menu Icon is collapsed in allergies applet
  When Quick Menu Icon is selected in allergies applet
  Then user can see the options in the allergies applet
  | options 				| 
  | more information      	| 
  | details					| 
  
@US18304_allergies_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in Allergies applet on Coversheet screen
  Then Cover Sheet is active
  And user hovers over the allergy pill
  And user can view the Quick Menu Icon in allergies applet
  And Quick Menu Icon is collapsed in allergies applet
  When Quick Menu Icon is selected in allergies applet
  Then user can see the options in the allergies applet
  | options 				| 
  | more information      	| 
  | details					| 
  
@US18304_allergies_Quick_Menu_Icon_Overview_screen
Scenario: User can view the Quick Menu Icon in Allergies applet on Overview screen
  Then Overview is active
  And user hovers over the allergy pill
  And user can view the Quick Menu Icon in allergies applet
  And Quick Menu Icon is collapsed in allergies applet
  When Quick Menu Icon is selected in allergies applet
  Then user can see the options in the allergies applet
  | options 				| 
  | more information      	| 
  | details					| 
  
@US18335_allergies_Quick_Menu_Icon_Expand_view
Scenario: User can view the Quick Menu Icon in Allergies applet on Expand view
  When user navigates to allergies expanded view
  And user hovers over the allergy row
  And user can view the Quick Menu Icon in allergies applet
  And Quick Menu Icon is collapsed in allergies applet
  When Quick Menu Icon is selected in allergies applet
  Then user can see the options in the allergies applet
  | options 				| 
  | more information      	| 
  | details					| 
  
@US18304_allergies_details_view_from_quick_menu_summary
Scenario: User can view the Quick Menu Icon in Allergies applet on summary screen
  And Summary View is active
  And user scrolls the allergies applet into view
  And user hovers over the allergy pill
  And user selects the detail view from Quick Menu Icon of allergies applet
  Then the modal is displayed
  And the Allergy Detail modal displays
      | symptoms            |
      | drug classes        |
      | nature of reaction  |
      | entered by          |
      | originated          |
      | verified            |
      | observed/historical |
      | observed date       |
      
@US18304_allergies_details_view_from_quick_menu_expand
Scenario: User can view the Quick Menu Icon in Allergies applet on expand view
  When user navigates to allergies expanded view
  And user hovers over the allergy row
  And user selects the detail view from Quick Menu Icon of allergies applet
  Then the modal is displayed
  And the Allergy Detail modal displays
      | symptoms            |
      | drug classes        |
      | nature of reaction  |
      | entered by          |
      | originated          |
      | verified            |
      | observed/historical |
      | observed date       |


  