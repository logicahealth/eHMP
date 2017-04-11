@F333 @US6769 @regression @triage @DE4426 @debug @DE4767
Feature: Global search of patients outside local VistA

Background:
    # Given user is logged into eHMP-UI
    When the patient search screen is displayed
    Given the call to my cprs list is completed
    And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Icnonly"
    And the user click on All Patient Search
    And the user select all patient result patient name "ICNONLY, PATIENT"
    # ADD BELOW LINE FOR TIMING ISSUES
    Then the all patient "patient identifying name" is displayed on confirm section header
      | field                     | value                 |
      | patient identifying name  | ICNONLY, PATIENT       |
    And the user waits 10 seconds for sync to complete
    And the user click on Confirm Selection
    And the user waits 10 seconds for sync to complete
    Then Overview is active
    Then the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Icnonly,Patient              |

@TC561
Scenario: Verify that the Demographic information for secondary patients displays in demographic detail drop-down
    Then user selects Patient Name drop down
    And the Patient's "Home Phone" is "(301) 222-3334"
    And the Patient's "Home Address line1" is "Icn Street"
    And the Patient's "Home Address line2" is "Norfolk, VA, 20152"


@TC560 @TC560_expanded @TC560_expanded_allergy
Scenario: Verify that the Write Back is disabled Non-Vista patient in expanded applet - Allergy
    When the user expands the Allergies Applet
    When the expanded Allergies Applet is displayed
    And the Add Allergy button is not displayed on cover sheet
    And the New Observation button button is not displayed

@TC560 @TC560_expanded
Scenario: Verify that the Write Back is disabled Non-Vista patient in expanded applet - Problems
  When the user clicks the control "Expand View" in the "Problems Gist applet"
  Then the expanded Problems Applet is displayed
  And the Add Condition button is not displayed on cover sheet
  And the New Observation button button is not displayed

@TC560 @TC560_expanded
Scenario: Verify that the Write Back is disabled Non-Vista patient in expanded applet - Immunization
  When the user clicks the control "Expand View" in the "Immunization Gist applet"
  And the user is viewing the Immunizations expanded view
  And the Add Immunization button is not displayed on cover sheet
  And the New Observation button button is not displayed

@TC560 @TC560_expanded
Scenario: Verify that the Write Back is disabled Non-Vista patient in expanded applet - Vital
  Then the user expands the vitals applet
  And the Add Vital button is not displayed on cover sheet
  And the New Observation button button is not displayed