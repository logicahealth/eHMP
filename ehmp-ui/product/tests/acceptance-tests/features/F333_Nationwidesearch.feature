@F333
@DE4426 @DE4767 @DE5113 @reg1
Feature: Global search of patients outside local VistA

Background:
  When the user opens the Nationwide tray
  And the user enters last name "Dodonly" in nationwide tray
  And the user enters first name "Patient" in nationwide tray
  And the user enters ssn "432-11-1234" in nationwide tray
  And the user selects Nationwide search button
  Then the Nationwide Tray contains search results
  And the Nationwide search results contain "DODONLY, PATIENT"

  @TC561 @DE1491 @DE1722 @TC561_1b @DE4841
Scenario: Verify that the Demographic information for secondary patients displays in demographic detail drop-down

    And the user selects nationwide search patient "DODONLY, PATIENT"

    Then Overview is active
    And user selects Patient Demographic drop down
    And the Patient's Home Phone is "(301) 222-3333"
    And the Patient's Home Address line is "Lost Street Norfolk, VA, 20152"


@TC560 @DE5056 @DE5054 @debug @DE7326
Scenario: Verify that the Write Back is disabled from CoverSheet for Non-Vista patient
    Given the user selects nationwide search patient "DODONLY, PATIENT"
    Then Cover Sheet is active
    And the Add Condition button is not displayed on cover sheet
    And the Add Immunization button is not displayed on cover sheet
    And the Add Vital button is not displayed on cover sheet
    And the New Observation button button is not displayed
    And the Add Allergy button is not displayed on cover sheet

@TC560 @debug @DE7326
Scenario: Verify that the Write Back is disabled from Overview for Non-Vista patient

    Given the user selects nationwide search patient "DODONLY, PATIENT"
    Then Overview is active

    And the Add Allergy button is not displayed on overview
    And the Add Condition button is not displayed on overview
    And the Add Immunization button is not displayed on overview
    And the Add Vital button is not displayed on overview
    And the New Observation button button is not displayed