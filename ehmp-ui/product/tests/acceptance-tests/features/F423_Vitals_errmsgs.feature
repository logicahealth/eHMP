@f423_vitals_write_back_errmsgs @vitals_applet
Feature: F423 : Enter and Store Vitals

# US7939, TC993: cannot automate

Background:
  And user searches for and selects "twenty,inpatient"
  Then Cover Sheet is active
  Then user adds a new vitals
  And user chooses to "Expand All" on add vitals modal detail screen

@US8587 @TC1258 @US7939 @TC989
Scenario Outline: Update Respiration error messages
  When user adds a Vital record for the current visit
  | vital type    | vital field             | value             |
  | Respiration   | Respiration Input Box   | <invalid_resp>    |
  Then the Respiration error message displays "<error_message>"
Examples:
 | invalid_resp | error_message |
 |  105         | Respiration must be between 0 and 100 /min |
 | -5           | Respiration must be between 0 and 100 /min |
 | abc          | Respiration must be a whole numeric value  |

@US8587 @TC1259_1 @US7939 @TC989
Scenario Outline: Update Pulse Ox error messages
  When user adds a Vital record for the current visit
  | vital type      | vital field       | value      |
  | Pulse Oximetry  | PO Input Box      | <pulse_ox> |
  Then the Pulse Oximetry error message displays "<error_message>"
Examples:
 | pulse_ox | error_message |
 |  20      | O2 Concentration must be between 21 and 100 |
 | 101      | O2 Concentration must be between 21 and 100 | 
 | abc      | O2 Concentration must be a whole numeric value  | 

@US8587 @TC1259_2 @US7939 @TC989 @future
Scenario Outline: Update Pulse Ox error messages - Supplemental Oxygen error message
  When user adds a Vital record for the current visit
  | vital type     | vital field                                 | value     |
  | Pulse Oximetry | PO Input Box                                | 22        |
  | Pulse Oximetry | PO Supplemental Oxygen Flow Rate Input Box  | <supp_ox> |
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

