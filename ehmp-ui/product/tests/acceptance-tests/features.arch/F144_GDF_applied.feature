@F144_Global_Date_Filter  
Feature: F144 - eHMP Viewer GUI - Global Date Filter

# Team: Andromeda

Background:
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

 @f144_global_date_filter_persistence @US2761 @TA8896dd @modal_test @manual
Scenario: Modal view date changes to not carry back to global date filter.
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "All" on the "Coversheet"
  And the user clicks the control "Apply" on the "Coversheet"
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  And the active date control in the "Numeric Lab Results modal" is the "All" button
  When the user clicks the date control "2yr" in the "Numeric Lab Results modal"
  Then the "Lab History" table contains 5 rows
  When the user closes modal by clicking the "Close" control
  Then the active date control in the "Numeric Lab Results applet" is the "All" button
  When the user clicks the control "Minimize View" in the "Numeric Lab Results applet"
  Then the coversheet is displayed