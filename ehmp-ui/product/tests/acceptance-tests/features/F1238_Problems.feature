@F1238 @F1137 @F1238_problems @problems_applet @regression @reg4
Feature: Implement Tile Row Component - Problems

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18329_Problems_Quick_Menu_Icon_Summary_screen
Scenario: User can view the Quick Menu Icon in problems applet on summary screen
  And Summary View is active
  And user scrolls the problems applet into view
  And user hovers over the problems applet trend view row
  And user can view the Quick Menu Icon in problems applet
  And Quick Menu Icon is collapsed in problems applet
  When Quick Menu Icon is selected in problems applet
  Then user can see the options in the problems applet
  | options 				| 
  | more information       	| 
  | details					| 
  | edit form				| 
  | concept relationships	| 
  | associated workspace 	| 
  
@US18329_Problems_popover_Summary_screen
Scenario: User can view the popover table in problems applet on summary screen
  And Summary View is active
  And user scrolls the problems applet into view
  And user hovers over the problems applet trend view row
  And there exists a quick view popover table in problems applet
  And problems quick look table contains headers
    |Headers 		|
    | Date   		|
    | Description 	| 
    | Facility 		|
   
@US18329_Problems_Quick_Menu_Icon_Overview_screen
Scenario: User can view the Quick Menu Icon in problems applet trend view on overview screen
  And Overview is active
  And user hovers over the problems applet trend view row
  And user can view the Quick Menu Icon in problems applet
  And Quick Menu Icon is collapsed in problems applet
  When Quick Menu Icon is selected in problems applet
  Then user can see the options in the problems applet
  | options 				| 
  | more information		| 
  | details					| 
  | edit form				| 
  | concept relationships	| 
  | associated workspace 	| 
  
@US18329_Problems_popover_Overview_screen
Scenario: User can view the popover table in problems applet trend view on overview screen
  And Overview is active
  And user hovers over the problems applet trend view row
  And there exists a quick view popover table in problems applet
  And problems quick look table contains headers
    |Headers 		|
    | Date   		|
    | Description 	| 
    | Facility 		|
  
@US18329_Problems_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in problems applet summary view on coversheet screen
  Then Cover Sheet is active
  And user hovers over the problems applet row
  And user can view the Quick Menu Icon in problems applet
  And Quick Menu Icon is collapsed in problems applet
  When Quick Menu Icon is selected in problems applet
  Then user can see the options in the problems applet
  | options 				| 
  | more information		| 
  | details					| 
  | edit form				| 
  | concept relationships	| 
  | associated workspace 	| 
  
@US18329_Problems_Quick_Menu_Icon_expand_view
Scenario: User can view the Quick Menu Icon in problems applet expand view
  And user navigates to problems expanded view
  And user hovers over the problems applet row
  And user can view the Quick Menu Icon in problems applet
  And Quick Menu Icon is collapsed in problems applet
  When Quick Menu Icon is selected in problems applet
  Then user can see the options in the problems applet
  | options 				| 
  | more information		| 
  | details					| 
  | edit form				| 
  | concept relationships	| 
  | associated workspace 	| 
  
@US18329_Problems_details_from_Quick_Menu_Summary_screen
Scenario: User can view the details from Quick Menu Icon in problems applet on summary screen
  And Summary View is active
  And user scrolls the problems applet into view
  And user hovers over the problems applet trend view row
  And user selects the detail view from Quick Menu Icon of problems applet
  And problems detail view contain fields
  | fields				|
  | Primary ICD-9-CM	|
  | Primary ICD-10-CM	|
  | SNOMED CT			|
  
@US18329_Problems_details_from_Quick_Menu_Overview_screen
Scenario: User can view the details from Quick Menu Icon in problems applet on overview screen
  And Overview is active
  And user hovers over the problems applet trend view row
  And user selects the detail view from Quick Menu Icon of problems applet
  And problems detail view contain fields
  | fields				|
  | Primary ICD-9-CM	|
  | Primary ICD-10-CM	|
  | SNOMED CT			|
  
@US18329_Problems_details_from_Quick_Menu_coversheet_screen
Scenario: User can view the details from Quick Menu Icon in problems applet on coversheet screen
  And Cover Sheet is active
  And user hovers over the problems applet row
  And user selects the detail view from Quick Menu Icon of problems applet
  And problems detail view contain fields
  | fields				|
  | Primary ICD-9-CM	|
  | Primary ICD-10-CM	|
  | SNOMED CT			|
  
@US18329_Problems_details_from_Quick_Menu_exapnd_view
Scenario: User can view the details from Quick Menu Icon in problems applet expand view
  And user navigates to problems expanded view
  And user hovers over the problems applet row
  And user selects the detail view from Quick Menu Icon of problems applet
  And problems detail view contain fields
  | fields				|
  | Primary ICD-9-CM	|
  | Primary ICD-10-CM	|
  | SNOMED CT			|
  