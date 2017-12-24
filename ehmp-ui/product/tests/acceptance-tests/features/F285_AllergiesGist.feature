@F285_allergies_gist @allergies_applet  @reg2
Feature: F285 : Overview Screen

Background:
  Given user searches for and selects "FORTYSIX,PATIENT"
  When Overview is active
  Then user sees Allergies Gist

@F285_1_AllergiesGistDisplay @US4005
Scenario: View Allergies Gist View on the overview screen
  When the Allergies Gist applet is finished loading
  Then the Allergies Gist Applet contains buttons Refresh, Help and Expand
  And the Allergies Gist Applet does not contain button Filter Toggle

@F285_2b_AllergiesGistExpandView @US4005
Scenario: Verify expanded applet returns to overview
  And User clicks the Expand View in the Allergies Applet
  And the Allergies Applet expand view contains data rows
  And the user minimizes the expanded Allergies Applet
  Then Overview is active
  And user sees Allergies Gist

  
@f282_allergies_gist_refresh 
Scenario: Allergies Gist displays all of the same details after applet is refreshed
  Given the Allergies Gist contains at least 1 pill
  And the user notes the number of allergy pills

  When user refreshes Allergies Gist Applet
  Then the message on the Allergies Gist Applet does not say "An error has occurred"
  And the Allergies Gist displays the expected number of allergy pills

@F282_AllergiesGist_detail_view 
Scenario: Verfy details for a particular allergy for patient using Gist view applet
  Given the Allergies Gist applet is finished loading
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

    

