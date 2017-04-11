@F140_AllPatientSearch @regression @triage
Feature: F140 – All Patient Search

#This feature will allow a user to search for patients globally in eHMP through a global patient search feature MVI.  Once the search criteria is entered, a maximum of 10 results will be shown. If there are more than 10 results, than no results will be returned.  This also searches for sensitive patient.

# Team Andromeda
@f140_2_firstLastNameSearch @US1977 @DE3047 @DE4841
Scenario: search with first name and full last name
#    Given user is logged into eHMP-UI
    And the patient search screen is displayed
    When the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    When user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Eight"
    And the user click on All Patient Search
    Then the user select all patient result patient name "EIGHT, PATIENT"
    And the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                      |
        | patient identifying name  | EIGHT, PATIENT              |
    And the all patient "patient identifying traits" is displayed on confirm section
        | field         | value                      |
        | dob           | 04/07/1935                 |
        | age           | FORMATTED                  |
        | gender        | Male                       |
        | ssn           | DISPLAYED                  |
    When the user click on Confirm Selection
    And the user clears though the Confirm Flag
    Then Default Screen is active
    And the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Eight,Patient              |

@f140_3_lastNameDOBSearch @US1977 @DE3047 @DE4841
Scenario: search with full last name and date of birth
#    Given user is logged into eHMP-UI
    And the patient search screen is displayed
    When the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    When user enters full last name in all patient search "Eight"
    And user enters date of birth in all patient search "04071935"
    And the user click on All Patient Search
    Then the user select all patient result patient name "EIGHT, PATIENT"
    And the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                      |
        | patient identifying name  | EIGHT, PATIENT              |
    And the all patient "patient identifying traits" is displayed on confirm section
        | field         | value                      |
        | dob           | 04/07/1935                 |
        | age           | FORMATTED                  |
        | gender        | Male                       |
        | ssn           | DISPLAYED                  |
    When the user click on Confirm Selection
    And the user clears though the Confirm Flag
    Then Default Screen is active
    And the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Eight,Patient              |

@f140_4_firstLastNameDOBSearch @US1977 @DE3047 @DE4841
Scenario: Perform nationwide search with first name, last name and date of birth
#    Given user is logged into eHMP-UI
    And the patient search screen is displayed
    When the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    When user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Eight"
    And user enters date of birth in all patient search "04071935"
    And the user click on All Patient Search
    When the user select all patient result patient name "EIGHT, PATIENT"
    Then the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                      |
        | patient identifying name  | EIGHT, PATIENT              |
    And the all patient "patient identifying traits" is displayed on confirm section
        | field         | value                      |
        | dob           | 04/07/1935                 |
        | age           | FORMATTED                  |
        | gender        | Male                       |
        | ssn           | DISPLAYED                  |
    When the user click on Confirm Selection
    And the user clears though the Confirm Flag
    Then Default Screen is active
    And the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Eight,Patient              |
