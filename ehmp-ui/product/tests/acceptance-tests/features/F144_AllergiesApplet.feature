@F144_allergy_applet @US2801 @DE621 @regression
Feature: F144 - eHMP viewer GUI - Allergies
#  Team Jupiter - refactored

@US2801 @F144_allergy_applet_display 
Scenario: User views the Allergy applet on the coversheet page
	# Given user is logged into eHMP-UI
  When user searches for and selects "BCMA,Eight"
  And Cover Sheet is active
  And the "patient identifying traits" is displayed with information
  | field			| value 				|
  | patient name	| Bcma,Eight 			|
  Then The applet "ALLERGIES" on the coversheet page has been displayed
	
@US2801 @F144_1_allergy_applet_display @DE3371
Scenario: User views the Allergy applet on the coversheet page
	# Given user is logged into eHMP-UI
  When user searches for and selects "BCMA,Eight"
  And Cover Sheet is active
  And the "patient identifying traits" is displayed with information
  | field			| value 				|
  | patient name	| Bcma,Eight 			|
  Then The applet "ALLERGIES" on the coversheet page has been displayed
  And Applet ALLERGIES expanded view have the below table header
  | headers               |
  | Allergen Name         |
  | Standardized Allergen |
  | Reaction              |
  | Severity              |
  | Drug Class            |
  | Entered By            |
  | Facility              |

@US2801 @F144_2_allergy_applet_modal_display @modal_test
Scenario: User views the modal when a particular allergy pill is chosen
  Given user searches for and selects "BCMA,Eight"
  And Cover Sheet is active
  And the "patient identifying traits" is displayed with information
  | field     | value         |
  | patient name  | Bcma,Eight      |
  And The applet "ALLERGIES" on the coversheet page has been displayed
  And the Allergies Gist contains at least 1 pill
  When user views the first allergy details
  Then the modal is displayed
  And the modal's title matches the first pill
  

@US2801 @F144_3_allergy_applet_modal_detail_display @DE3040 @DE3709
Scenario: User views the modal details when a particular allergy pill is chosen
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And The applet "ALLERGIES" on the coversheet page has been displayed
  And the Allergies Gist contains at least 1 pill
  When user views the first allergy details
  Then the modal is displayed
  And the Allergy Detail modal displays either "Entered in Error" or "Edit Error"
  And the user clicks the modal "Close Button"
  And the modal is closed

@US2801 @F144_3b_allergy_applet_modal_detail_display @modal_test @DE549 @no_data @DE3709
Scenario: User views the modal details when a particular allergy pill is chosen
	# Given user is logged into eHMP-UI
	When user searches for and selects "BCMA,Eight"
	And Cover Sheet is active
    And The applet "ALLERGIES" on the coversheet page has been displayed
	And the Allergies Gist contains at least 1 pill
	And user views the first allergy details
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

@US2801 @expand_minimize @DE4529 @debug @DE6976
Scenario: Verify expanded Allergies applet returns to coversheet
	# Given user is logged into eHMP-UI
	When user searches for and selects "BCMA,Eight"
	And Cover Sheet is active
    And The applet "ALLERGIES" on the coversheet page has been displayed
#	Then the user clicks the control "Expand View" in the "Allergies Applet"
    And User clicks the Expand View in the Allergies Applet
	And the user minimizes the expanded Allergies Applet
    Then the user is returned to the coversheet

@US2801 @F144_4_allergy_applet_expand_view @vimm_observed
Scenario: View Allergies Applet Single Page by clicking on Expand View
	# Given user is logged into eHMP-UI
	And user searches for and selects "BCMA,Eight"
	Then Cover Sheet is active
	Then the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Bcma,Eight 			|
    And The applet "ALLERGIES" on the coversheet page has been displayed
    And User clicks the Expand View in the Allergies Applet
    And the expanded Allergies Applet title is "ALLERGIES"
    And the Allergy Applet table contains rows

@US2801 @F144_6_allergy_applet_sort
Scenario: Sort allergies applet by standardized name
	# Given user is logged into eHMP-UI
	When user searches for and selects "BCMA,Eight"
	And Cover Sheet is active
    And The applet "ALLERGIES" on the coversheet page has been displayed
    And User clicks the Expand View in the Allergies Applet
    And user sorts by the Standardized Allergen
    Then the Allergies Applet is sorted in alphabetic order based on Standardized Allergen
    And user sorts by the Allergen Name
    And the Allergies Applet is sorted in alphabetic order based on Allergen Name
    
@f144_allergy_applet_summary_view_refresh
Scenario: Allergies Gist displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And The applet "ALLERGIES" on the coversheet page has been displayed
  And the Allergies Gist contains at least 1 pill
  When user refreshes Allergies Applet
  Then the message on the Allergies Applet does not say "An error has occurred"
  And the Allergies Gist contains at least 1 pill
  
@f144_allergy_applet_expand_view_refresh 
Scenario: Allergies Gist displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And The applet "ALLERGIES" on the coversheet page has been displayed
  When the user expands the Allergies Applet
  Then the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  When user refreshes Allergies Applet
  Then the message on the Allergies Applet does not say "An error has occurred"

@DE234
Scenario: Verify applet is not affected by GDF
  # Given user is logged into eHMP-UI
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And The applet "ALLERGIES" on the coversheet page has been displayed
  And user notes number of reported allergies
  And the user has selected All within the global date picker
  Then the number of reported allergies is unchanged
  When the user has selected 24h within the global date picker
  Then the number of reported allergies is unchanged
  
@f297_allergies_info_button_integration_1
Scenario: Verify allergy applet on overview page has info button toolbar
  When user searches for and selects "eight,patient"
  And Overview is active
  And allergy gist is loaded successfully
  And user opens the first allergy pill
  Then allergies info button is displayed
  
@f297_allergies_info_button_integration_2
Scenario: Verify allergy applet expanded view has info button toolbar
  When user searches for and selects "eight,patient"
  And Overview is active
  And user navigates to allergies expanded view 
  And user opens the first allergy row
  Then allergies info button is displayed

@allergy_next
Scenario: Verify user can step through the allergies using the next button / previous button
  Given user searches for and selects "eight,patient"
  And Overview is active
  And user navigates to allergies expanded view 
  And the allergies applet displays at least 3 allergy rows
  And the user notes the first 3 allergies
  When user opens the first allergy row detail
  Then the modal is displayed
  And the user can step through the allergies using the next button
  And the user can step through the allergies using the previous button




