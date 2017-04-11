@F333 @regression @triage @DE4426 @DE4767 @debug @DE5113
Feature: Global search of patients outside local VistA

@TC561 @DE1491 @DE1722 @TC561_1
Scenario: Verify that the Demographic information for secondary patients displays in demographic detail drop-down
    When the patient search screen is displayed
    Given the call to my cprs list is completed
    And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Dodonly"
    And the user click on All Patient Search
    And the user select all patient result patient name "DODONLY, PATIENT"
    And the user click on Confirm Selection
    Then Default Screen is active
    And user selects Patient Demographic drop down
    And the Patient's Home Phone is "(301) 222-3333"
    And the Patient's Home Address line is "Lost Street Norfolk, VA, 20152"


@TC560 @DE5056 @debug @DE5054
Scenario: Verify that the Write Back is disabled from CoverSheet for Non-Vista patient
	# Given user is logged into eHMP-UI
	When the patient search screen is displayed
	Given the call to my cprs list is completed
	And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Dodonly"
    And the user click on All Patient Search
    And the user select all patient result patient name "DODONLY, PATIENT"
    And the user click on Confirm Selection
    And the user waits 10 seconds for sync to complete
    Then Cover Sheet is active

    
    And the Add Condition button is not displayed on cover sheet
    And the Add Immunization button is not displayed on cover sheet
    And the Add Vital button is not displayed on cover sheet
    And the New Observation button button is not displayed
    And the Add Allergy button is not displayed on cover sheet

@TC560
Scenario: Verify that the Write Back is disabled from Overview for Non-Vista patient
    # Given user is logged into eHMP-UI
    When the patient search screen is displayed
    Given the call to my cprs list is completed
    And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Dodonly"
    And the user click on All Patient Search
    And the user select all patient result patient name "DODONLY, PATIENT"
    And the user click on Confirm Selection
    And the user waits 10 seconds for sync to complete
    Then Overview is active

    And the Add Allergy button is not displayed on overview
    And the Add Condition button is not displayed on overview
    And the Add Immunization button is not displayed on overview
    And the Add Vital button is not displayed on overview
    And the New Observation button button is not displayed

