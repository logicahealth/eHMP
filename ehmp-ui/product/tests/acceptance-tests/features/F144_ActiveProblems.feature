@US2411 @regression @triage
Feature: F144 - eHMP viewer GUI - Active Problems
#Team Neptune 

Background: 
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active


@US2411a
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

@US2411c 
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
   

  
@f144_conditions_on_coversheet_expand_view_refresh 
Scenario: Conditions Expanded view from coversheet view displays all of the same details after applet is refreshed
  When the Problems applet displays
  Then the Problems applet is titled "CONDITIONS"
  When the user clicks the Problems Expand Button
  Then the expanded Conditions Applet is displayed
  And the Conditions Applet contains data rows
  When user refreshes Conditions Applet
  Then the message on the Conditions Applet does not say "An error has occurred"
	