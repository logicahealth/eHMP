@f423_vitals_write_back_errmsgs @vitals_applet @future
Feature: F423 : Enter and Store Vitals

# US7939, TC993: cannot automate

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then user adds a new vitals
  And user chooses to "Expand All" on add vitals modal detail screen


@US7939 @TC955 @TC955_b
Scenario: This test case will verify the functions of global UI components for Add button.
  And user attempts to add vital
  # #alert-region h4.modal-title
  Then an alert is displayed with title "No Data Entered"
  When user chooses "No" button on the alert
  Then the alert is closed
  And add vital modal detail title says "Enter Vitals"  

@US7939 @TC955 @TC955_c
Scenario: This test case will verify the functions of global UI components for Add button.
  And user attempts to add vital
  # #alert-region h4.modal-title
  Then an alert is displayed with title "No Data Entered"
  When user chooses "Yes" button on the alert
  Then the alert is closed
  And the modal is closed