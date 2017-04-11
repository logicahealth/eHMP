@F372 @regression @triage
Feature: F372 - UI Component Library - Patient Selection Box (Component)

Background: 
    # Given user is logged into eHMP-UI
    And the user has navigated to the patient search screen
        And the User selects mysite
    And the User click on MySiteSearch
    And user enters full last name "Eight"
    
@US4982
Scenario: 
  When the user select patient name "Eight, Patient"
  Then the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                      |
        | patient identifying name  | EIGHT, PATIENT              |
  And the all patient "patient identifying traits" is displayed on confirm section
        | field         | value                      |
        | dob           | 04/07/1935                 |
        | age           | FORMATTED                  |
        | gender        | Male                       |
        | ssn           | ***-**-0008                |
   And a patient image is displayed