@F236_OnLineHelp @regression

Feature: F236 - OnLineHelp
#"As an an eHMP user, I need to be able to click on help icons in strategic areas in he eHMP UI in order to display contextual help information and create PDF documents;  so that I can access and print PDF documents of help content."

@F236_0_OnLineHelp @non_default_login
Scenario: Verify if OnLineHelp icons are present
  Given the On-line Help icon on login page of eHMP-UI

@F236_1_OnLineHelp_search_page @US4520 @DE1591 @F236-1.1  @DE2668
Scenario: Verify if OnLineHelp icons are present
  And the patient search screen is displayed
  Then the On-line Help icon is present on Patient Search page
  
@F236_2_OnLineHelp_Overview
Scenario: Verify if OnLineHelp icons are present on Overview page on all 9 applets
  When user searches for and selects "Eight,Patient"
  And Overview is active
  Then the On-line Help icon is present on Overview page
  
@F236_3_OnLineHelp_Coversheet
Scenario: Verify if OnLineHelp icons are present on Coversheet page on all 9 applets
  When user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  And the coversheet is displayed
  Then the On-line Help icon is present on Coversheet page
  
@F236_4_OnLineHelp_docuemnts
Scenario: Verify if OnLineHelp icons are present on Documents applet
  When user searches for and selects "Eight,Patient"  
  And user navigates to Documents Applet
  Then "Documents" is active
  And the On-line Help icon is present on Documents page
  
@F236_5_OnLineHelp_timeline
Scenario: Verify if OnLineHelp icons are present on timeline applet
  When user searches for and selects "Eight,Patient" 
  And user navigates to Timeline Applet
  Then "Timeline" is active
  And the On-line Help icon is present on Timeline page
  
@F236_6_OnLineHelp_medsreview
Scenario: Verify if OnLineHelp icons are present on Meds Review applet
  When user searches for and selects "Eight,Patient"   
  And user navigates to Meds Review Applet
  Then "Meds Review" is active
  And the On-line Help icon is present on Meds Review page

@F236_7_OnLineHelp @US4520
Scenario: Verify if OnLineHelp icon is clickable
  And the user has navigated to the patient search screen
  Then the On-line Help page is opened by clicking on the On-line Help icon


