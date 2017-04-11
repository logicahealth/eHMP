@F140_AllPatientSearch @regression @triage
Feature: F140 – All Patient Search

#This feature will allow a user to search for patients globally in eHMP through a global patient search feature MVI.  Once the search criteria is entered, a maximum of 10 results will be shown. If there are more than 10 results, than no results will be returned.  This also searches for sensitive patient.

# Team Andromeda
@f140_1_lastNameSSNSearch @US1977 @base @DE3047 
Scenario: Perform nationwide search with first name, last name and ssn
    And the patient search screen is displayed
    When the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    When user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Eight"
    And user enters ssn in all patient search "666000008"
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
    Then Overview is active
    And the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Eight,Patient              |


@f140_5_firstLastNameDOBSSNSearch @US1977 @DE1807 @DE3047
Scenario: Perform nationwide search with first name, last name, date of birth and ssn
#    Given user is logged into eHMP-UI
    And the patient search screen is displayed
    When the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    When user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Eight"
    And user enters date of birth in all patient search "04071935"
    And user enters ssn in all patient search "666000008"
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

@f140_6_ssnSearchError @US1977 @DE4841
Scenario: Verify error message for malformed SSN
#    Given user is logged into eHMP-UI
    Given the patient search screen is displayed
    When the User selects All Patient
    And the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Eight"
    And user enters ssn in all patient search "0008"

    Then the user verifies the "Error: SSN must match the format: 123-45-6789 or 123456789"

@f140_7_searchCountError @US1977
Scenario: Verify error message when search result contains more then 10 results
#    Given user is logged into eHMP-UI
    Given the patient search screen is displayed
    When the User selects All Patient
    And the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "John"
    And user enters full last name in all patient search "Smith"
    And user enters ssn in all patient search "000000000"
    And the user click on All Patient Search
    Then the user verifies the "Search returned too many results please refine your search criteria and try again."

@f140_8_searchNoResultError @US1977
Scenario: Verify message when search result contains 0 results
#    Given user is logged into eHMP-UI
    Given the patient search screen is displayed
    When the User selects All Patient
    And the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Unknown"
    And user enters ssn in all patient search "000000000"
    And the user click on All Patient Search
    Then the user verifies the "No results were found."

@f140_9_sensitivePatientSearch @US2438 @debug @DE3248
Scenario: user searches and selects sensitive patient
#    Given user is logged into eHMP-UI
    And the patient search screen is displayed
    When the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    When user enters full last name in all patient search "zzzretfivefifty"
    And user enters first name in all patient search "Patient"
    And the user click on All Patient Search
    When the user select all patient result patient name "ZZZRETFIVEFIFTY, PATIENT"
    Then the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                      |
        | patient identifying name  | ZZZRETFIVEFIFTY, PATIENT    |
    And the all patient "acknowledgement message" is displayed on acknowledgement confirm section
        | field                | value                      |
        | acknowledgement message  | This record is protected by the Privacy Act of 1974 and the Health Insurance Portability and Accountability Act of 1996. If you elect to proceed, you will be required to prove you have a need to know. Accessing this patient is tracked, and your station Security Officer will contact you for your justification.                               |
    When the user click on acknowledge restricted record
    Then the all patient "patient identifying traits" is displayed on confirm section
        | field         | value                      |
        | dob           | 04/07/1935                 |
        | age           | FORMATTED                  |
        | gender        | Male                       |
        | ssn           | 666-21-2121                |
    When the user click on Confirm Selection
    Then Default Screen is active

@f140_10_KodakOnlyPatient_1 @DE271 @debug @DE3047
Scenario: All Patient search with first name and full last name that is in Kodak only and is not in Panorama. User logs on as panorama
    # Given user is logged into eHMP-UI
    Then the patient search screen is displayed
    And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Eighteen-Patient"
    And user enters full last name in all patient search "Bcma"
    And the user click on All Patient Search
    And the user select all patient result patient name "BCMA, EIGHTEEN-PATIENT"
    Then the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                 |
        | patient identifying name  | BCMA, EIGHTEEN-PATIENT |
    Then the all patient "patient identifying traits" is displayed on confirm section
        | field         | value         |
        | dob           | 04/07/1935    |
        | age           | FORMATTED                  |
        | gender        | Male          |
        | ssn           | ***-**-0018   |
    And the user click on Confirm Selection
    Then Default Screen is active
    Then the "patient identifying traits" is displayed with information
        | field         | value                  |
        | patient name  | Bcma,Eighteen-Patient  |

@f140_11_PatientNotInAnyVistaSearch @DE271 @US5857 @US6769 @DE2937 @DE3148 @debug @DE3660
Scenario: All Patient search with first name and full last name that is not in Kodak or Panorama (JDS)
    # Given user is logged into eHMP-UI
    Then the patient search screen is displayed
    And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Patient"
    And user enters full last name in all patient search "Dodonly"
    And the user click on All Patient Search
    And the user select all patient result patient name "DODONLY, PATIENT"
    Then the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                 |
        | patient identifying name  | DODONLY, PATIENT       |
    Then the all patient "patient identifying traits" is displayed on confirm section
        | field         | value         |
        | dob           | 09/09/1967    |
        | age           | FORMATTED     |
        | gender        | Male          |
        | ssn           | 1234          |
    And the user waits 10 seconds for sync to complete
    And the user click on Confirm Selection
    And the user waits 10 seconds for sync to complete
    Then Default Screen is active
    Then the "patient identifying traits" is displayed with information
        | field         | value                  |
        | patient name  | DODONLY,PATIENT       |

@f140_12_KodakOnlyPatient_2 @DE271 @debug @DE3047 
Scenario: All Patient search with first name and full last name that is in Kodak only and is not in Panorama. User logs on as kodak.
    Given user views the login screen
    When user attempts login
        | field      | value    |
        | Facility   | Kodak    |
        | AccessCode | PW       |
        | VerifyCode | PW    !! |
        | SignIn     |          |
    Then the patient search screen is displayed
    And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "Eighteen-Patient"
    And user enters full last name in all patient search "Bcma"
    And the user click on All Patient Search
    And the user select all patient result patient name "BCMA, EIGHTEEN-PATIENT"
    Then the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                 |
        | patient identifying name  | BCMA, EIGHTEEN-PATIENT |
    Then the all patient "patient identifying traits" is displayed on confirm section
        | field         | value         |
        | dob           | 04/07/1935    |
        | age           | FORMATTED     |
        | gender        | Male          |
        | ssn           | ***-**-0018   |
    And the user click on Confirm Selection
    Then Default Screen is active
    Then the "patient identifying traits" is displayed with information
        | field         | value                  |
        | patient name  | Bcma,Eighteen-Patient  |

@f140_13_firstLastNameSearch @DE220 @DE3047
Scenario: search with first name and full last name with white spaces in beginning and end
    # Given user is logged into eHMP-UI
    Then the patient search screen is displayed
    And the User selects All Patient
    Then the user is on all patient tab "Nationwide"
    And user enters first name in all patient search "   Patient   "
    And user enters full last name in all patient search "   Eight     "
    
    And user enters ssn in all patient search "666000008"
    And the user click on All Patient Search
    And the user select all patient result patient name "EIGHT, PATIENT"
    Then the all patient "patient identifying name" is displayed on confirm section header
        | field                     | value                      |
        | patient identifying name  | EIGHT, PATIENT              |
    Then the all patient "patient identifying traits" is displayed on confirm section
        | field         | value                      |
        | dob           | 04/07/1935                 |
        | age           | FORMATTED                  |
        | gender        | Male                       |
        | ssn           | ***-**-0008                |
    And the user click on Confirm Selection
    And the user clears though the Confirm Flag
    Then Default Screen is active
    Then the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Eight,Patient              |
