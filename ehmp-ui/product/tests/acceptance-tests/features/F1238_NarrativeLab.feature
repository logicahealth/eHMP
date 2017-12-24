@F1238 @F1238_Narrativelab @US18324 @regression @reg2
Feature: Implement Tile Row Component - Narrative Lab

Background:
    Given user searches for and selects "Bcma,Eight"
    And Summary View is active
    And the user has selected All within the global date picker

@US18304_narrative_lab_Quick_Menu_Icon_Summary_screen
Scenario: User can view the Quick Menu Icon in Narrative Lab applet on summary screen
  
  And user scrolls the narrative lab applet into view
  And user hovers over the narrative lab summary row
  And user can view the Quick Menu Icon in narrative lab applet
  And Quick Menu Icon is collapsed in narrative lab applet
  When Quick Menu Icon is selected in narrative lab applet
  Then user can see the options in the narrative lab applet
  | options 				| 
  | more information      	| 
  | details					| 

@US18304_narrative_lab_Quick_Menu_Icon_Expanded_screen
Scenario: User can view the Quick Menu Icon in Narrative Lab applet on expanded screen

  Given user navigates to expanded Narrative Lab Results Applet
  And Narrative Lab Results applet loads without issue
 
  And user hovers over the narrative lab expanded row
  And user can view the Quick Menu Icon in narrative lab applet
  And Quick Menu Icon is collapsed in narrative lab applet
  When Quick Menu Icon is selected in narrative lab applet
  Then user can see the options in the narrative lab applet
  | options 				| 
  | more information      	| 
  | details					| 

@US18304_NarrativeLabs_details_from_Quick_Menu_summary_view
Scenario: User can view the details from Quick Menu Icon in narrative lab applet summary view
  And user hovers over the narrative lab summary row
  And user selects the detail view from Quick Menu Icon of narrative lab applet
  And the Narrative Lab Results Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time       | 

@US18304_NarrativeLabs_details_from_Quick_Menu_exapnd_view
Scenario: User can view the details from Quick Menu Icon in narrative lab applet expand view
  When user navigates to expanded Narrative Lab Results Applet
  And Narrative Lab Results applet loads without issue
  And user hovers over the narrative lab expanded row
  And user selects the detail view from Quick Menu Icon of narrative lab applet
  And the Narrative Lab Results Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time       | 