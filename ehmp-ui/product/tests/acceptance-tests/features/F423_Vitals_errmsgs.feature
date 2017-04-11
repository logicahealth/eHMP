@f423_vitals_write_back @regression
Feature: F423 : Enter and Store Vitals

Background:
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And user selects and sets new encounter
  Then user adds a new vitals
  And user chooses to "Expand All" on add vitals modal detail screen



@US8587 @TC1258 @US7939 @TC989
Scenario Outline: Update Respiration error messages
  When user adds a Vital record for the current visit
  | vital type    | vital field       | value   |
  | Respiration   | Respiration Input Box   | <invalid_resp>    |
  And user attempts to add vital
  Then the Respiration error message displays "<error_message>"
Examples:
 | invalid_resp | error_message |
 |  105         | Respiration must be between 0 and 100 /min |
 | -5           | Respiration must be between 0 and 100 /min |
 | abc          | Respiration must be a whole numeric value  |

@US8587 @TC1259_1 @US7939 @TC989
Scenario Outline: Update Pulse Ox error messages
  When user adds a Vital record for the current visit
  | vital type    | vital field       | value   |
  | Pulse Oximetry  | PO Input Box        | <pulse_ox>    |
  And user attempts to add vital
  Then the Pulse Oximetry error message displays "<error_message>"
Examples:
 | pulse_ox | error_message |
 |  20      | O2 Concentration must be between 21 and 100 |
 | 101      | O2 Concentration must be between 21 and 100 | 
 | abc      | O2 Concentration must be a whole numeric value  | 

@US8587 @TC1259_2 @US7939 @TC989
Scenario Outline: Update Pulse Ox error messages - Supplemental Oxygen error message
  When user adds a Vital record for the current visit
  | vital type     | vital field                                 | value   |
  | Pulse Oximetry | PO Input Box                                | 22        |
  | Pulse Oximetry | PO Supplemental Oxygen Flow Rate Input Box  | <supp_ox> |
  And user attempts to add vital
  Then the Supplemental Oxygen error message displays "<error_message>"
Examples:
 | supp_ox  | error_message |
 |  0       | Flow Rate must be between 0.5 and 20 (liters/minute) |
 | 25       | Flow Rate must be between 0.5 and 20 (liters/minute) | 
 | abc      | Flow Rate must be a numeric value  | 

@US7701 @TC937 @DE3080
Scenario: Verify default Time / Date
  Then the Date Taken field defaults to Today
  Then the Time Taken field defaults to time in specific format

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