@F144_Lab_Results_Modal @Lab_Results   @reg1
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

# Team: Andromeda, inherited by Team Venus
  
@DE2627
Scenario: Verify able to see details for numeric lab result panels
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  Given the user has selected All within the global date picker
  And the applet displays numeric lab results
  Given the Numeric Lab Results applet displays at least 1 panel
  When the user clicks the first numeric lab result panel row
  #Then a popover menu is displayed on the first numeric lab result panel row
  #When the user clicks the details icon in the popover menu 
  Then the numeric lab result applet displays panel rows
  When the user clicks a panel row
  Then a popover menu is displayed on the first numeric lab result panel row
  When the user clicks the details icon in the popover menu 
  Then the modal is displayed







# f144_US2498_labresults_spec.rb
@f144_numeric_lab_results_modal_non_numeric_table @US2498 @TA7551 @modal_test @vimm @DE3709 @DE6755
Scenario: Numeric Lab Results Modal - history table containing non-numerical result types.
  Given user searches for and selects "Bcma,Eight"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the applet displays numeric lab results
  Given the user has filtered the numeric lab results on the term "HEPATITIS" down to 6 rows
  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  And the modal's title is "HEPATITIS C ANTIBODY"
  And the user clicks the date control All in the Numeric Lab Results modal
  And the Lab History table contains rows with data
  And the Lab History table contains rows with data in correct format

 
@f144_numeric_lab_results_modal_non_numeric_table @US2498 @TA7551b @DE4786 @DE6755
Scenario: Numeric Lab Results Modal - history table containing non-numerical result types - displays total test count

  Given user searches for and selects "Bcma,Eight"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the applet displays numeric lab results
  Given the user has filtered the numeric lab results on the term "HEPATITIS" down to 6 rows
  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  And the modal's title is "HEPATITIS C ANTIBODY"
  And the user clicks the date control All in the Numeric Lab Results modal
  And the Lab History table contains rows with data
  And the Total Tests label matches number of rows



