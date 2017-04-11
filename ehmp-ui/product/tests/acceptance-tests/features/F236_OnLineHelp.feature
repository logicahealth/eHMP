@F236_OnLineHelp @regression @heather

Feature: F236 - OnLineHelp
#"As an an eHMP user, I need to be able to click on help icons in strategic areas in he eHMP UI in order to display contextual help information and create PDF documents;  so that I can access and print PDF documents of help content."

@F236_0_OnLineHelp @non_default_login
Scenario: Verify if OnLineHelp icons are present
  Given the On-line Help icon on login page of eHMP-UI

#POC: Team Venus
@F236_1_OnLineHelp @US4520 @DE1591 @F236-1.1  @DE2668
Scenario: Verify if OnLineHelp icons are present
  Given user is logged into eHMP-UI
  And the user has navigated to the patient search screen
  Then the On-line Help icon is present on Patient Search page
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  And the coversheet is displayed
  Then the On-line Help icon is present on "Coversheet" page
  When user navigates to Documents Applet
  Then "Documents" is active
  Then the On-line Help icon is present on Documents page
  When user navigates to Timeline Applet
  Then "Timeline" is active
  Then the On-line Help icon is present on Timeline page

@F236_2_OnLineHelp @US4520
Scenario: Verify if OnLineHelp icon is clickable
  Given user is logged into eHMP-UI
  And the user has navigated to the patient search screen
  Then the On-line Help page is opened by clicking on the On-line Help icon

