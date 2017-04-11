@F144_allergy_applet @US2801 @DE621 @regression @triage
Feature: F144 - eHMP viewer GUI - Allergies Expanded

Background:
 Given user is logged into eHMP-UI
  And user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Allergies Gist
  When the user expands the Allergies Applet
  

@DE1478 @DE1095 
Scenario: Verify Expanded Allergies Applet contains expected buttons
  When the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  Then the Allergies expand Applet contains buttons
    | buttons  |
    | Refresh  |
    | Help     |
    | Minimize View |
  And the Allergies expand Applet does not contain buttons
    | buttons |
    | Filter Toggle |
    | Expand View   |