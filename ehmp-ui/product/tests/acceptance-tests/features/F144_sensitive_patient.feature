@F144_sensitivepatient @regression @triage
Feature: user selects sensitive patient

#POC: Team Mercury

Background:
    # Given user is logged into eHMP-UI
    And the user has navigated to the patient search screen

@select_sensitive_patient
Scenario: user selects sensitive patient
    #And the User selects mysite and All
    And the User selects mysite
    And the User click on MySiteSearch
    And user enters full last name "zzzretfivefifty"
    And the user select patient name "Zzzretfivefifty, Patient"
    And the user click on acknowledge restricted record
    #Then the user click on TestConfirm
    Then the user click on Confirm Selection
    Then the "patient identifying traits" is displayed with information
		| field			| value 				    |
		| patient name	| Zzzretfivefifty,Patient	|

