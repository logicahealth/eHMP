@F1142 @US17414
Feature: Home Page Usability (Staff View) - Implement Recent Patient list tray

Background:
  # Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "TWO1234" verifycode as  "TWO1234!!"
  #Then staff view screen is displayed
  And user searches for and selects "Eight,PATIENT"
  Then Overview is active
  And user navigates to the staff view screen
  Then staff view screen is displayed

@US17414_1
Scenario: Verify Recent Patients search display
   Then the staff view screen displays Recent Patients in the sidebar tray

@US17414_2
Scenario: Verify Recent Patients tray display
    When the user opens the Recent Patients tray
    And the Recent Patients tray displays a close x button
    And the Recent Patients tray displays a help button
    And the Recent Patients Tray table headers are 
    | header        |
    | Patient Name  |
    | Date of Birth |
    And the Recent Patients Tray contains search results
    And the Recent Patients Tray patient name search results are in format Last Name, First Name + (First Letter in Last Name + Last 4 SSN )
    And the Recent Patients Tray date of birth search results are in format Date (Agey) - Gender (first letter)

@US17414_3
Scenario: Verify user can load a patient from a Recent Patients Tray
    Given the user opens the Recent Patients tray
    And the Recent Patients Tray contains search results
    When user chooses to load a patient from the Recent Patients results list
    Then Overview is active
    And the Global Header displays the selected user name

