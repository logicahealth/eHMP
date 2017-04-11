@F144_search @regression @triage

Feature: F144-eHMP Viewer GUI - Patient Search and Selection (MySite)

#POC: Team Mercury

Background: 
    Given user is logged into eHMP-UI
    And the user has navigated to the patient search screen

@validsearch @US1971
Scenario: search  with last name
    And the User selects mysite
    And the User click on MySiteSearch
    And user enters full last name "Eight"
    And the user select patient name "EIGHT, PATIENT"
    Then the user click on Confirm Selection
    And the user clears though the Confirm Flag
    Then Default Screen is active

    Then the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Eight,Patient              |
    
@searchscreen @US1971
Scenario: search screen has clinics  My site Global
    And user looks for  My site
    #below commented out -- "All" button has been removed
    #Then On my site User looks for All

@VPRresults @US1971
Scenario: search  with last name  and last 4 digits 
    Given the User selects mysite
    And the User click on MySiteSearch
    And user enters full last name "Bcma,Eight"
    And the user select patient name "BCMA, EIGHT"
    And the confirmation box displays info for "Bcma, Eight"
     | label  | value       |
     | DOB    | 04/07/1945  |
     | Age    | #y          |
     | Gender | male        |
     | SSN    | ***-**-0008 |

    Then the user click on Confirm Selection
    Then Default Screen is active
    Then the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Bcma,Eight                 |    

@validsearch2 @US1971
Scenario: search  with  one letter last name  and last 4 digits 
    And the User selects mysite
    And the User click on MySiteSearch
    And user enters full last name "E0008"
    And the user select patient name "EIGHT, PATIENT"
    #Then the user click on TestConfirm
    Then the user click on Confirm Selection
    And the user clears though the Confirm Flag
    Then Default Screen is active
    Then the "patient identifying traits" is displayed with information
        | field         | value                      |
        | patient name  | Eight,Patient              |    

@inValidSearch @US1971
Scenario: User attempts invalid search  with  one letter last name  and last 3 digits
    Given the User selects mysite
    And the User click on MySiteSearch
    And user enters full last name "E008" 
    Then no results are displayed in patient search
    Then the user verifies patient "No patient record found. Please make sure your search criteria is correct."
