@F144_allergy_applet @allergies_applet @US2801 @DE621 @reg4
Feature: F144 - eHMP viewer GUI - Allergies


@US2801 @F144_allergy_applet_display 
Scenario: User views the Allergy applet on the coversheet page
  When user searches for and selects "BCMA,Eight"
  And Cover Sheet is active
  Then The applet "ALLERGIES" on the coversheet page has been displayed

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
  And the user clicks the modal Close Button
  And the modal is closed

@US2801 @F144_3b_allergy_applet_modal_detail_display @modal_test @DE549 @no_data @DE3709
Scenario: User views the modal details when a particular allergy pill is chosen
	Given user searches for and selects "BCMA,Eight"
	And Cover Sheet is active
  And The applet "ALLERGIES" on the coversheet page has been displayed
	And the Allergies Gist contains at least 1 pill
	When user views the first allergy details
	Then the modal is displayed
  And the Allergy modal's title starts with "ALLERGEN"
	And the Allergy Detail modal displays
      | symptoms            |
      | drug classes        |
      | nature of reaction  |
      | entered by          |
      | originated          |
      | verified            |
      | observed/historical |
      | observed date       |

@US2801 @expand_minimize @DE4529 @DE6976
Scenario: Verify expanded Allergies applet returns to coversheet

	When user searches for and selects "BCMA,Eight"
	And Cover Sheet is active
  And The applet "ALLERGIES" on the coversheet page has been displayed
  And User clicks the Expand View in the Allergies Applet
  And the Allergy Applet table contains rows
	And the user minimizes the expanded Allergies Applet
  Then the user is returned to the coversheet

    
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
  
@DE234
Scenario: Verify applet is not affected by GDF
  And user searches for and selects "BCMA,Eight"
  Then Cover Sheet is active
  And The applet "ALLERGIES" on the coversheet page has been displayed
  And user notes number of reported allergies
  And the user has selected All within the global date picker
  Then the number of reported allergies is unchanged
  When the user has selected 24h within the global date picker
  Then the number of reported allergies is unchanged
  







