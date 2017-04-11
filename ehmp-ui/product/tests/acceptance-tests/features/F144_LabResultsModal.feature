@F144_Lab_Results_Modal @Lab_Results @regression @triage
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

# Team: Andromeda, inherited by Team Venus

Background:
  Given user is logged into eHMP-UI
  When user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  Given the user has selected All within the global date picker
  And the applet displays numeric lab results
  
@DE2627
Scenario: Verify able to see details for numeric lab result panels
  Given the Numeric Lab Results applet displays at least 1 panel
  When the user clicks the first numeric lab result panel row
  Then a popover menu is displayed on the first numeric lab result panel row
  When the user clicks the details icon in the popover menu 
  Then the numeric lab result applet displays panel rows
  When the user clicks a panel row
  Then a popover menu is displayed on the first numeric lab result panel row
  When the user clicks the details icon in the popover menu 
  Then the modal is displayed







# f144_US2498_labresults_spec.rb
@f144_numeric_lab_results_modal_non_numeric_table @US2498 @TA7551 @modal_test @vimm @debug @DE3709
Scenario: Numeric Lab Results Modal - history table containing non-numerical result types.
  Given user searches for and selects "Bcma,Eight"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the applet displays numeric lab results
  Given the user has filtered the numeric lab results on the term "HEPATITIS" down to 6 rows
  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  And the modal's title is "HEPATITIS C ANTIBODY - BLOOD"
  And the user clicks the date control "All" in the "Numeric Lab Results modal"
  And the "Lab History" table contains 6 rows
  And the Lab History table contains rows
    | Date             | Flag | Result    | Facility |
    | 05/29/2007 - 15:16 |      | P         | TST1     |
    | 05/29/2007 - 15:12 |      | P         | TST1     |
    | 05/29/2007 - 14:58 |      | N         | TST1     |
    | 05/29/2007 - 15:16 |      | P         | TST2     |
    | 05/29/2007 - 15:12 |      | P         | TST2     |
    | 05/29/2007 - 14:58 |      | N         | TST2     |
  And the "Total Tests" label has the value "6"






