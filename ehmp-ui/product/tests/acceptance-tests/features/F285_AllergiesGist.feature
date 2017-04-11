@F285_allergies_gist @regression @triage
Feature: F285 : Overview Screen


# POC Team Jupiter

Background:
 Given user is logged into eHMP-UI
  And user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Allergies Gist

@F285_1_AllergiesGistDisplay @US4005
Scenario: View Allergies Gist View on the overview screen
  When the Allergies Gist applet is finished loading
  Then the Allergies Gist Applet contains buttons
    | buttons  |
    | Refresh  |
    | Help     |
    | Expand View |
  And the Allergies Gist Applet does not contain buttons
    | buttons |
    | Filter Toggle |

@F285_3_AllergiesGistDisplay
Scenario: Allergy Gist has popover menu
  When the Allergies Gist applet is finished loading
  And the Allergies Gist contains at least 1 pill
  When user clicks an allergy pill
  Then a popover displays with icons
  | icons |
  | info  |
  | detail|

  
@F285_2_AllergiesGistExpandView @US4005
Scenario: View Allergies Applet Single Page by clicking on Expand View
  When the user clicks the control "Expand View" in the "Allergies Applet"
  Then the Allergies Applet title is "ALLERGIES"

@F285_2b_AllergiesGistExpandView @US4005
Scenario: Verify expanded applet returns to overview
  When the user clicks the control "Expand View" in the "Allergies Applet"
  And the Allergies Applet expand view contains data rows
  And the user minimizes the expanded Allergies Applet
  Then Overview is active
  And user sees Allergies Gist

  
@f282_allergies_gist_refresh 
Scenario: Allergies Gist displays all of the same details after applet is refreshed
  And the Allergies Gist Applet contains data rows
  When user refreshes Allergies Gist Applet
  Then the message on the Allergies Gist Applet does not say "An error has occurred"
  
@f282_allergies_gist_exapnd_view_refresh 
Scenario: Allergies Gist expand view displays all of the same details after applet is refreshed
  When the user clicks the control "Expand View" in the "Allergies Applet"
  Then the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  When user refreshes Allergies Applet
  Then the message on the Allergies Applet does not say "An error has occurred"
  
@F282_AllergiesGist_detail_view 
Scenario: Verfy details for a particular allergy for patient using Gist view applet
	When the user views the first Allergies Gist detail view
    Then the modal is displayed
    And the modal's title is "Allergen - CHOCOLATE"
    
@F282_AllergiesGist_detail_from_expand_view 
Scenario: Verfy details for a pariticular allergy for patient using expand view applet
    When the user clicks the control "Expand View" in the "Allergies Applet"
    Then the expanded Allergies Applet is displayed
	When the user views the first Allergies detail view
    Then the modal is displayed
    And the modal's title is "Allergen - CHOCOLATE"
