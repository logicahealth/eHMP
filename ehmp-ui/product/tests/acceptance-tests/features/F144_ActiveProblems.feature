@US2411  @reg2
Feature: F144 - eHMP viewer GUI - Active Problems
#Team Neptune 

Background: 
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@detail_next_previous @DE5921 @DE6551
Scenario: Verify user can step through the problems using the next button / previous button
  Given the Problems applet displays
  And the problems applet displays at least 3 problem rows
  And the user notes the first 3 problems
  And the user views a problem applet row's details
  Then the modal is displayed
  And the user can step through the problems using the next button
  And the user can step through the problems using the previous button

@US2411a @DE5921
Scenario: User uses the active problems coversheet to view modal
    When the Problems applet displays
    And the user views a problem applet row's details
    And Problem Detail Modal contains data
     | Primary ICD-9-CM |
     | SNOMED CT |
     | Onset |
     | Acuity|
     | Status|
     | Provider|
     | Facility|
     | Location|
     | Entered|
     | Updated|
	 
@US2411b @DE1056
Scenario: User uses the active problems coversheet to filter 
  When the Problems applet displays
	And the user clicks the "Problems Filter Button"
	And the user filters the Problems Applet by text "Dia"
	Then the problems table only diplays rows including text "Dia"

@US2411_b
Scenario: User uses the active problems coversheet to sort
   When the Problems applet displays
   And the user sorts the Problem grid by "Description" 
   Then the Problem grid is sorted in alphabetic order based on Description
   When the user sorts the Problem grid by "Acuity"
   Then the Problem grid is sorted in alphabetic order based on Acuity

@US2411_c
Scenario: User views the expanded Active Problems
  When the user clicks the Problems Expand Button
  Then the Problems expanded headers are
	 | Headers |
	 | Description |
	 | Standardized Description |
	 | Acuity |
	 | Status |
	 | Onset Date | 
	 | Last Updated| 
	 | Provider| 
	 | Facility | 
	 | Comments | 

@US2411c @DE5921
Scenario: User uses the active problems expanded to view modal
  When the user clicks the Problems Expand Button
  When the Problems applet displays
  And the user views a problem applet row's details
  And Problem Detail Modal contains data
     | Primary ICD-9-CM |
     | SNOMED CT |
     | Onset |
     | Acuity|
     | Status|
     | Provider|
     | Facility|
     | Location|
     | Entered|
     | Updated|

@US2411d @DE1056
Scenario: User uses the expanded active problems applet to filter 
  When the user clicks the Problems Expand Button
  And the Problems applet displays
  And the user clicks the "Problems Filter Button"
  And the user filters the Problems Applet by text "Dia"
  Then the problems table only diplays rows including text "Dia"

@US2411d
Scenario: User uses the expanded active problems applet to sort
   When the user clicks the Problems Expand Button
   When the Problems applet displays
   And the user sorts the Problem grid by "Description" 
   Then the expanded Problem grid is sorted in alphabetic order based on Description
   When the user sorts the Problem grid by "Acuity"
   Then the expanded Problem grid is sorted in alphabetic order based on Acuity
   

  
@f144_problems_on_coversheet_expand_view_refresh 
Scenario: Problems Expanded view from coversheet view displays all of the same details after applet is refreshed
  When the Problems applet displays
  Then the Problems applet is titled "PROBLEMS"
  When the user clicks the Problems Expand Button
  Then the expanded Problems Applet is displayed
  And the Problems Applet contains data rows
  When user refreshes Problems Applet
  Then the message on the Problems Applet does not say "An error has occurred"
  
@f297_conditions_info_button_integration
Scenario: Verify Problems applet on overview page has info button toolbar
  And Overview is active
  And problems gist is loaded successfully
  When user opens the first problems gist item
  Then problems info button is displayed
  
@f297_conditions_info_button_integration
Scenario: Verify Problems applet expanded view has info button toolbar
  And user navigates to problems expanded view 
  When user opens the first problems row
  Then problems info button is displayed
  
@f144_problems_modal_details_expand_view @DE5921 @DE6551
Scenario: User views the problems gist modal pop-up from expand view
    When the user clicks the Problems Expand Button
    Then the expanded Problems Applet is displayed
    And the user views a problem applet row's details
    Then the modal is displayed
    And the modal's title is "Diabetes Mellitus Type II or unspecified"
	