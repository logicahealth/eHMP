@F457
Feature: eHMP Release 1.3 Provisioning & Authorization

Background:
    Given user views the login screen
    When user attempts login
        |field     | value  |
        |Facility  |PANORAMA|
        |AccessCode|PW      |
        |VerifyCode|PW    !!|
        |SignIn    ||
    And the patient search screen is displayed

@US7760 @TC888
Scenario: verify there is an option to navigate to CAC Screen
   Given the patient search screen is displayed
   Then user can view the Access Control Applet

@US7760 @TC889
Scenario: Verify from the CAC screen there is a way go navigate back to the patient search screen
   Given the patient search screen is displayed
   When user views the Access Control Applet
   Then the Administrator screen is displayed
   When the user selects Patient Selection from navigation bar
   And the patient search screen is displayed

