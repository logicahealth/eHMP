@F1080
Feature: V2.0 UI Enrichment

@US16108 @TC5613_previous
Scenario: Allergies: Disable Next and Previous End Modals
  Given user searches for and selects "eight,patient"
  And Overview is active
  And user navigates to allergies expanded view 
  And the allergies applet displays at least 2 allergy rows
  When user opens the first allergy row detail
  Then the modal is displayed
  And the Allergy Previous button is disabled

@US16108 @TC5613_next
Scenario: Allergies: Disable Next and Previous End Modals
  Given user searches for and selects "eight,patient"
  And Overview is active
  And user navigates to allergies expanded view 
  And the allergies applet displays at least 2 allergy rows
  When user opens the last allergy row detail
  Then the modal is displayed
  And the Allergy Next button is disabled
