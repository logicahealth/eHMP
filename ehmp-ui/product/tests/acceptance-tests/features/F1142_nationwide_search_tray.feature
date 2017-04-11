@F1142 @US17413 @reg1
Feature: Home Page Usability (Staff View) - Implement Nationwide search tray

Background:
  Given staff view screen is displayed

@F1142_nationwide_1
Scenario: User has option to perform nationwide search
   Then the staff view screen displays Nationwide in the sidebar tray

@F1142_nationwide_2
Scenario: Verify nationwide search tray display
    When the user opens the Nationwide tray
    And the Nationwide tray displays a close x button
    # And the Nationwide tray displays a help button
    And the Nationwide tray displays a Last name selection box
    And the Nationwide tray displays a First name selection box
    And the Nationwide tray displays a DOB selection box
    And the Nationwide tray displays a SSN selection box

@F1142_nationwide_2b
Scenario: Verify nationwide tray displays a help button
    When the user opens the Nationwide tray
    And the Nationwide tray displays a help button

@F1142_nationwide_3
Scenario: Verify nationwide search results are in correct format
  When the user opens the Nationwide tray
  And the user enters last name "Eight" in nationwide tray
  And the user enters first name "Patient" in nationwide tray
  And the user enter dob "04/07/1935" in nationwide tray
  And the user enters ssn "666-00-0008" in nationwide tray
  And the user selects Nationwide search button
  Then the Nationwide Tray contains search results
  And the Nationwide Tray table headers are 
    | header        |
    | Patient Name  |
    | Date of Birth |
  And the Nationwide Tray patient name search results are in format Last Name, First Name + (First Letter in Last Name + Last 4 SSN )
  And the Nationwide Tray date of birth search results are in format Date (Agey) - Gender (first letter)

@F1142_nationwide_4
Scenario: Verify correct error message displayed when no search results returned
  When the user opens the Nationwide tray
  And the user enters last name "Invalid" in nationwide tray
  And the user enters first name "Patient" in nationwide tray
  And the user enters ssn "555-66-7777" in nationwide tray
  And the user selects Nationwide search button
  Then the Nationwide Tray displays no results message displays

@F1142_nationwide_5 @TC561 @DE1491 @DE1722 @TC561_1 @DE4841
Scenario:
  When the user opens the Nationwide tray
  And the user enters last name "Dodonly" in nationwide tray
  And the user enters first name "Patient" in nationwide tray
  And the user enters ssn "432-11-1234" in nationwide tray
  And the user selects Nationwide search button
  Then the Nationwide Tray contains search results
  And the Nationwide search results contain "DODONLY, PATIENT"