@documents_summary_and_details @regression @DE1786 @triage
Feature: F144 - eHMP Viewer GUI - Documents

#POC:Team Jupiter
    
@f144_16_documents_default_display  @US2593 @DE1480 @debug @DE1735
Scenario: Documents grouping by Date/Time
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  When user navigates to Documents Applet
  Then "Documents" is active
  Then the search results say "No Records Found" in Documents Applet
  And the user has selected All within the global date picker
  And the user sees the following groups in Documents Applet
      | group #     | groupName     |
      | date_group1 | April 1999    |
      | date_group2 | April 1998    |
      | date_group3 | February 1994 |
      | date_group4 | August 1992   |
      | date_group5 | January 1992  |
 
@f144_17_documents_default_display  @US2593 @DE1480 @debug @DE1735
Scenario: date/time can be clicked and collapsed
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  When user navigates to Documents Applet
  Then "Documents" is active
  Then the search results say "No Records Found" in Documents Applet
  And the user has selected All within the global date picker
  And the user clicks on date/time "August 1992" in the Documents Applet
  Then the date/time collapses and shows "1" result for "August 1992" in the Documents Applet  

@f144_24_documents_date_filter @US2594
Scenario: Documents applet is able to filter data based date filter search
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  When user navigates to Documents Applet
  Then "Documents" is active
  And the user clicks the control "Date Filter" in the "Documents Applet"
  Then the following choices should be displayed for the "Documents Applet" Date Filter
    | All | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |

  When the user clicks the date control "1yr" on the "Documents Applet"
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  And the user clicks the date control "3mo" on the "Documents Applet"
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  And the user clicks the date control "1mo" on the "Documents Applet"
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  And the user clicks the date control "7d" on the "Documents Applet"
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  And the user clicks the date control "72hr" on the "Documents Applet"
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

  When the user clicks the control "Date Filter" in the "Documents Applet"
  And the user clicks the date control "24hr" on the "Documents Applet"
  And the user clicks the control "Apply" on the "Documents Applet"
  Then the search results say "No Records Found" in Documents Applet

