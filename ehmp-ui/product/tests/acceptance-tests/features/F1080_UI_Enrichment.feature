@F1080
Feature: V2.0 UI Enrichment

@US15746 @TC5410 @TC5410_clinic_1
Scenario: Verify user can clear clinics filter
  Given user has option to search for patients via Clinics
  And user chooses to search for patients via Clinics
  And a Clinic filter is displayed
  When user filters the Clinics by term "testingfilter"
  And no results are displayed in word
  Then a clear clinic filter icon ( X ) is displayed 
  And the clear clinic filter icon clears the filter when selected

@US15746 @TC5410 @TC5410_clinic_2
Scenario: Verify clinic filter has a filter icon
  Given user has option to search for patients via Clinics
  When user chooses to search for patients via Clinics
  And a Clinic filter is displayed
  Then the Clinic filter has a filter icon

@US15746 @TC5410 @TC5410_ward_1
Scenario: Verify ward filter has a filter icon
  Given user has option to search for patients via Wards
  When user chooses to search for patients via Wards
  And a Ward filter is displayed
  Then the Ward filter has a filter icon

@US15746 @TC5410 @TC5410_ward_2
Scenario: Verify user can clear wards filter
  Given user has option to search for patients via Wards
  And user chooses to search for patients via Wards
  And a Ward filter is displayed
  When user filters the Wards by term "testingfilter"
  And no results are displayed in word
  Then a clear ward filter icon ( X ) is displayed 
  And the clear ward filter icon clears the filter when selected

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
