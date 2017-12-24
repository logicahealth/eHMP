@F144_sensitivepatient  
Feature: user selects sensitive patient

#POC: Team Mercury

Background:
    Given staff view screen is displayed

@select_sensitive_patient
Scenario: user selects sensitive patient
    When the user searchs My Site with search term Zzzretfivefifty
    And the user select patient name "Zzzretfivefifty, Patient"
    And the user clicks on acknowledge restricted record
    And the user click on Confirm Selection
    And Overview is active
    Then the Patient View Current Patient displays the user name "Zzzretfivefifty,Patient (Z2121)"

