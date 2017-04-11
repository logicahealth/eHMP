@F144_allergy_applet @US2801 @DE621 @regression @triage
Feature: F144 - eHMP viewer GUI - Allergies
#Team Jupiter - refactored

@US2801 @F144_allergy_applet_display 
Scenario: User views the Allergy applet on the coversheet page
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	Then the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Bcma,Eight 			|
	And user sees the allergy applet on the coversheet page

	
@US2801 @F144_1_allergy_applet_display @DE3371
Scenario: User views the Allergy applet on the coversheet page
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	Then the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Bcma,Eight 			|
	And user sees the allergy applet on the coversheet page
	And the Allergies Applet view contains
  	| Allergy name		|
	| ERYTHROMYCIN		|
	| ALCOHOL			|
	| PEANUTS			|
	| BACON				|
	| STRAWBERRIES		|

@US2801 @F144_2_allergy_applet_modal_display @modal_test
Scenario: User views the modal when a particular allergy pill is chosen
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	Then the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Bcma,Eight 			|
	And user sees the allergy applet on the coversheet page
	When the user clicks on the allergy pill "ERYTHROMYCIN"
	Then the modal is displayed
  And the modal's title is "Allergen - ERYTHROMYCIN"
  

@US2801 @F144_3_allergy_applet_modal_detail_display @DE3040 @debug @DE3709
Scenario: User views the modal details when a particular allergy pill is chosen
  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And user sees the allergy applet on the coversheet page
  And the Allergies Gist contains at least 1 pill
  When user views the first allergy details
  Then the modal is displayed
  And the Allergy Detail modal displays either "Entered in Error" or "Edit Error"
  And the user clicks the modal "Close Button"
  And the modal is closed

@US2801 @F144_3b_allergy_applet_modal_detail_display @modal_test @DE549 @no_data @debug @DE3709
Scenario: User views the modal details when a particular allergy pill is chosen
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	And user sees the allergy applet on the coversheet page
	And the Allergies Gist contains at least 1 pill
	When user views the first allergy details
	Then the modal is displayed
	And the Allergy Detail modal displays 
      | field               |
      | title               |
      | previous button     |
      | next button         |
      | close button        |
      | Symptoms            |
      | Severity            |
      | Drug Classes        |
      | Nature of Reaction  |
      | Entered By          |
      | Originated          |
      | Verified            |
      | Observed/Historical |
      | Observed Date       |
      | Site                |


@US2801 @F144_3_allergy_applet_modal_detail_display @modal_test @DE549 @triage @data_check @debug @DE3709
Scenario: User views the modal details when a particular allergy pill is chosen
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	And user sees the allergy applet on the coversheet page
	When the user clicks on the allergy pill "ERYTHROMYCIN"
	Then the modal is displayed
  	And the modal's title is "Allergen - ERYTHROMYCIN"
  	And the allergy applet modal detail contains
  	| field					| value									|
  	| Symptoms				| ANOREXIA; DIARRHEA; DROWSINESS; HIVES	|
  	| Entered By			| DOCWITH,POWER							|
  	| Nature of Reaction	| Allergy						|
  	| Drug Classes			|ERYTHROMYCINS/MACROLIDES, PHARMACEUTICAL AIDS/REAGENTS, ANTIBACTERIALS,TOPICAL OPHTHALMIC, ANTIACNE AGENTS,TOPICAL|
  	| Originated			| 12/19/2013 - 16:18					|
  	| Observed/Historical	| Observed								|
  	| Observed Date			| 12/19/2013         					|
  	| Verified				|										|
	| Obs dates/severity	| MODERATE								|
	| Site  				| CAMP MASTER							|
	And the user clicks the modal "Close Button"
  	And the modal is closed

@US2801 @expand_minimize
Scenario: Verify expanded Allergies applet returns to coversheet
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	And user sees the allergy applet on the coversheet page
	When the user clicks the control "Expand View" in the "Allergies Applet"
	And the user minimizes the expanded Allergies Applet
	Then Cover Sheet is active

@US2801 @F144_4_allergy_applet_expand_view @vimm_observed
Scenario: View Allergies Applet Single Page by clicking on Expand View
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	Then the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Bcma,Eight 			|
	And user sees the allergy applet on the coversheet page
	When the user clicks the control "Expand View" in the "Allergies Applet"
  Then the Allergies Applet title is "ALLERGIES"
  And the Allergy Applet table contains headers
    | Allergen Name | Standardized Allergen | Reaction | Severity | Drug Class | Entered By | Facility | Comment|
  And the Allergy Applet table contains rows

@US2801 @F144_6_allergy_applet_sort
Scenario: Sort allergies applet by standardized name
	Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	And user sees the allergy applet on the coversheet page
	When the user expands the Allergies Applet
    When user sorts by the Standardized Allergen
    Then the Allergies Applet is sorted in alphabetic order based on Standardized Allergen
    When user sorts by the Allergen Name
    Then the Allergies Applet is sorted in alphabetic order based on Allergen Name
    
@f144_allergy_applet_summary_view_refresh 
Scenario: Allergies Gist displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And user sees the allergy applet on the coversheet page
  And the Allergies Gist contains at least 1 pill
  When user refreshes Allergies Applet
  Then the message on the Allergies Applet does not say "An error has occurred"
  And the Allergies Gist contains at least 1 pill
  
@f144_allergy_applet_expand_view_refresh 
Scenario: Allergies Gist displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active 
  And user sees the allergy applet on the coversheet page
  When the user expands the Allergies Applet
  Then the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  When user refreshes Allergies Applet
  Then the message on the Allergies Applet does not say "An error has occurred"

@DE234
Scenario: Verify applet is not affected by GDF
  Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And user sees the allergy applet on the coversheet page
  And user notes number of reported allergies
  And the user has selected All within the global date picker
  Then the number of reported allergies is unchanged
  When the user has selected 24h within the global date picker
  Then the number of reported allergies is unchanged




