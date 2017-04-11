@documents_summary_and_details @regression @DE1786
Feature: F144 - eHMP Viewer GUI - Documents

#POC:Team Jupiter
    
@f144_16_documents_default_display  @US2593 @DE1480 @DE1735
Scenario: Documents grouping by Date/Time
  # Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  When user navigates to Documents Applet
  Then "Documents" is active
  Then the search results say "No Records Found" in Documents Applet
  And the user has selected All within the global date picker
  And the user sees date groups in the Documents Applet
 
@f144_17_documents_default_display  @US2593 @DE1480 @DE1735
Scenario: date/time can be clicked and collapsed
  # Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  When user navigates to Documents Applet
  Then "Documents" is active
  Then the search results say "No Records Found" in Documents Applet
  And the user has selected All within the global date picker
  And the user clicks on date/time "August 1992" in the Documents Applet
  Then the date/time collapses and shows "1" result for "August 1992" in the Documents Applet  

@f144_24_documents_date_filter @US2594
Scenario: Documents applet is able to filter data based date filter search
  # Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  When user navigates to Documents Applet
  Then "Documents" is active
  And the user clicks the control "Date Filter" in the "Documents Applet"
  And the Global Date Filter contains expected buttons

  When the user clicks the Global Date Filter 1yr button
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  When the user clicks the Global Date Filter 3mo button
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  When the user clicks the Global Date Filter 1mo button
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  When the user clicks the Global Date Filter 7d button
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  When the user clicks the Global Date Filter 72hr button
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  When the user clicks the Global Date Filter 24hr button
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

