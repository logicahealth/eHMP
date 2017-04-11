@F226 @regression @triage
Feature: Enter Plain Text Basic Progress Notes  (TIU)

@US8033 @TC999_1
Scenario: Launch the notes form from the documents applet - applet allows
  Given user is logged into eHMP-UI
  And user searches for and selects "eight,patient"
  And Overview is active
  When user navigates to Documents Applet
  And "Documents" is active
  Then the Documents Applet contains buttons
     | buttons  |
     | Add      |

@US8033 @TC999_2 @DE3036 @future
Scenario: Launch the notes form from the documents applet - preset current encounter
  Given user is logged into eHMP-UI
  And user searches for and selects "eight,patient"
  And Overview is active
  When user navigates to Documents Applet
  Given "Documents" is active
  And user selects and sets new encounter
  When the user chooses to Add Item to Documents
  Then New Note Modal is displayed
  

@US8033 @TC999_3 @DE3036 @future
Scenario: Launch the notes form from the documents applet
    Given user views the login screen
    When user logs in with credentials
        |field | value|
        |Facility|PANORAMA|
        |AccessCode|ANES123|
        |VerifyCode|ANES123!!|
        |SignIn||
  And user searches for and selects "ten,patient"
  When user navigates to Documents Applet
  Given "Documents" is active
  When the user chooses to Add Item to Documents
  Then Change Current Encounter Modal is displayed
  