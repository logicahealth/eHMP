@F495  @reg1 @US8462 @TC1140 @F1142 @DE7713
Feature: Handling Sensitive/Flagged Patients in PT Selection List

@F495_F1142_1
Scenario: As a user, I want to see any eHMP patient flagged as Sensitive ,to have their SSN/DOB to be displayed at "*SENSITIVE* so that if the patient identity information is not revealed. 
    Given staff view screen is displayed
    When the user searchs My Site with search term EMPLOYEE,ONE
    Then the My Site Tray displays
    And the My Site Tray contains search results
    And the My Site Tray results contain patient "EMPLOYEE,ONE(*SENSITIVE*)" with DOB "*SENSITIVE*" and gender "Male"

@F495_F1142_2
Scenario: If I have correct permissions, as a user, I do not want any Sensitive patients to have thier SSN/DOB masked
    Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Given staff view screen is displayed
    When the user searchs My Site with search term EMPLOYEE,ONE
    Then the My Site Tray displays
    And the My Site Tray contains search results
    And the My Site Tray results contain patient "EMPLOYEE,ONE(E3045)" with DOB "04/07/1935(81y)" and gender "Male"
