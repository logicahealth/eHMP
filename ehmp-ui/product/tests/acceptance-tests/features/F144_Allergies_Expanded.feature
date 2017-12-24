@F144_allergy_applet_expanded @allergies_applet @US2801 @DE621 @reg4
Feature: F144 - eHMP viewer GUI - Allergies Expanded
  
@DE1478 @DE1095 @US4005 
Scenario: Verify Expanded Allergies Applet contains expected buttons
  Given user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Allergies Gist
  When the user expands the Allergies Applet
  And the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  Then the Allergies Applet title is "ALLERGIES"
  Then the Allergies expand Applet contains buttons Refresh, Help and Minimize
  And the Allergies expand Applet does not contain buttons Filter Toggle or Expand

@allergies_gist_exapnd_view_refresh 
Scenario: Allergies Gist expand view displays all of the same details after applet is refreshed
  Given user searches for and selects "FORTYSIX,PATIENT"
  And user navigates to allergies expanded view
  And the Allergies Applet expand view contains data rows
  When user refreshes Allergies Applet
  Then the message on the Allergies Applet does not say "An error has occurred"

@AllergiesGist_detail_from_expand_view 
Scenario: Verfy details for a pariticular allergy for patient using expand view applet
  Given user searches for and selects "FORTYSIX,PATIENT"
  And user navigates to allergies expanded view
  And the Allergies Applet expand view contains data rows
  When the user views the first Allergies detail view
  Then the modal is displayed
  And the Allergy modal's title starts with "ALLERGEN"

@US2801 @F144_1_allergy_applet_display @DE3371
Scenario: User views the Allergy applet on the coversheet page
  Given user searches for and selects "FORTYSIX,PATIENT"
  And user navigates to allergies expanded view
  And Applet ALLERGIES expanded view have the below table header
  | headers               |
  | Allergen Name         |
  | Standardized Allergen |
  | Reaction              |
  | Severity              |
  | Drug Class            |
  | Entered By            |
  | Facility              |

@US2801 @F144_6_allergy_applet_sort
Scenario: Sort allergies applet by standardized name
  Given user searches for and selects "FORTYSIX,PATIENT"
  And user navigates to allergies expanded view
  And user sorts the Expanded Allergies Applet by the Standardized Allergen
  Then the Allergies Applet is sorted in alphabetic order based on Standardized Allergen
  And user sorts the Expanded Allergies Applet by the Allergen Name
  And the Allergies Applet is sorted in alphabetic order based on Allergen Name

@f144_allergy_applet_expand_view_refresh 
Scenario: Allergies Gist displays all of the same details after applet is refreshed
  Given user searches for and selects "FORTYSIX,PATIENT"
  And user navigates to allergies expanded view
  And the user notes the number of expanded allergy rows
  When user refreshes Allergies Applet
  Then the message on the Allergies Applet does not say "An error has occurred"
  And the expanded Allergies applet displays the expected number of allergy rows

@allergy_next
Scenario: Verify user can step through the allergies using the next button / previous button
  Given user searches for and selects "FORTYSIX,PATIENT"
  And user navigates to allergies expanded view
  And the allergies applet displays at least 3 allergy rows
  And the user notes the first 3 allergies
  When user opens the first allergy row detail
  Then the modal is displayed
  And the user can step through the allergies using the next button
  And the user can step through the allergies using the previous button
