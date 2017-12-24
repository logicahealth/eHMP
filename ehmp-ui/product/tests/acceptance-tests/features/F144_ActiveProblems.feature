@F144_Problems @problems_applet @US2411  @reg2
Feature: F144 - eHMP viewer GUI - Active Problems
#updated for F1238 by Application Team

Background: 
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@US2411a @DE5921 @problem_details_view
Scenario: User uses the active problems coversheet to view modal
    When the Problems applet displays
    And the user views a problem applet row's details
    And problems detail view contain fields
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
	 
@US2411b @DE1056 @problem_filter
Scenario: User uses the active problems coversheet to filter 
  When the Problems applet displays
	And the user clicks the "Problems Filter Button"
	And the user filters the Problems Applet by text "Dia"
	Then the problems table only diplays rows including text "Dia"

@US2411_b @problem_sort_problem_name
Scenario: User uses the active problems coversheet to sort
  When the Problems applet displays 
  When the user sorts the Problems applet by column Problem
  Then the Problems applet is sorted in alphabetic order based on Problem
  When the user sorts the Problems applet by column Problem
  Then the Problems applet is sorted in reverse alphabetic order based on Problem

@US2411c @DE5921 @problem_expand_view_details
Scenario: User uses the active problems expanded to view modal
  When the user expands the Problems Applet
  And the user views a problem applet row's details
  And problems detail view contain fields
     | Fields		|
     | Primary ICD-9-CM |
     | SNOMED CT |
     | Onset |
     | Acuity|
     | Status|
     | Responsible provider|
     | Facility|
     | Location|
     | Entered by|
     | Updated on|

@US2411d @DE1056 @problem_expand_view_filter
Scenario: User uses the expanded active problems applet to filter 
  When the user expands the Problems Applet
  And the user clicks the "Problems Filter Button"
  And the user filters the Problems Applet by text "Dia"
  Then the problems table only diplays rows including text "Dia"

@US2411d @problem_expand_view_sort
Scenario: User uses the expanded active problems applet to sort
  When the user expands the Problems Applet
  When the user sorts the Problems applet by column Problem
  Then the Problems applet is sorted in alphabetic order based on Problem
  When the user sorts the Problems applet by column Problem
  Then the Problems applet is sorted in reverse alphabetic order based on Problem
    
@f144_problems_on_coversheet_expand_view_refresh 
Scenario: Problems Expanded view from coversheet view displays all of the same details after applet is refreshed
  When the Problems applet displays
  Then the Problems applet is titled "PROBLEMS"
  When the user clicks the Problems Expand Button
  Then the expanded Problems Applet is displayed
  And the Problems Applet contains data rows
  When user refreshes Problems Applet
  Then the message on the Problems Applet does not say "An error has occurred"

  
	