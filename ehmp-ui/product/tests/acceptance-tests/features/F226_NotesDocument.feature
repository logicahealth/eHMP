@F226   @reg2
Feature: Enter Plain Text Basic Progress Notes  (TIU)

@US8033 @TC999_1
Scenario: Launch the notes form from the documents applet - applet allows
  # Given user is logged into eHMP-UI
  And user searches for and selects "eight,patient"
  And Overview is active
  When user navigates to Documents Screen
  And "Documents" is active
  Then the Documents Applet contains buttons
     | buttons  |
     | Add      |

@US8033 @TC999_2 @DE3036
Scenario: Launch the notes form from the documents applet - preset current encounter
  Given user searches for and selects "eight,inpatient"
  And Overview is active
  When user navigates to Documents Screen
  Given "Documents" is active
  When the user chooses to Add Item to Documents
  Then New Note Modal is displayed
  

@US8033 @TC999_3 @DE3036
Scenario: Launch the notes form from the documents applet
  Given user searches for and selects "ten,patient"
  And user navigates to Documents Screen
  And "Documents" is active
  When the user chooses to Add Item to Documents
  Then Encounter modal is displayed
  