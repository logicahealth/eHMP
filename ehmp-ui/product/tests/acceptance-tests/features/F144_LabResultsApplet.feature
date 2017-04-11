@F144_Lab_Results_Base_Applet @Lab_Results @regression @triage
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

# Team: Andromeda, inherited by Team Venus

Background:
  Given user is logged into eHMP-UI


  
@F144_numericlabresults_3
Scenario: Expanded Numeric Lab results applet minimizes to Coversheet screen
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  And the coversheet is displayed
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  When the user is viewing the expanded Numeric Lab Results Applet
  And the user minimizes the expanded Numeric Lab Results Applet
  Then Cover Sheet is active

@f144_numeric_lab_results_microbiology @DE377 @future @obe
Scenario: Numeric Lab Results Applet - Ensure results for Microbiology labs are being shown.
  Given user searches for and selects "Zzzretfourthirtytwo,Patient"
  Then Cover Sheet is active
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  When the user clicks the date control "All" in the "Numeric Lab Results applet"
  When the user enters "Blood+Culture" into the "Numeric Lab Results Filter Field"
  #And the user inputs "Blood+Culture" in the "Text Filter" control in the "Numeric Lab Results applet"
  And the user waits for 5 seconds
  Then the "Numeric Lab Results Applet" table contains 1 rows
  And the "Numeric Lab Results Applet" table contains rows
    | Date             | Lab Test                     | Flag | Result      | Unit | Ref Range | Facility |
    | 01/03/1994 - 07:00 | BLOOD CULTURE SET #1 - BLOOD |      | View Report |      |           | TST1     |
    
@f144_labresults_applet_summary_view_refresh 
Scenario: Lab Results Summary applet displays all of the same details after applet is refreshed
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  And the coversheet is displayed
  And the user has selected All within the global date picker
  And the Lab Results Applet contains data rows
  When user refreshes Lab Results Applet
  Then the message on the Lab Results Applet does not say "An error has occurred"
  
@f144_labresults_applet_expand_view_refresh 
Scenario: Lab Results expand view applet displays all of the same details after applet is refreshed
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  And the coversheet is displayed
  And the user has selected All within the global date picker 
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  Given the user is viewing the expanded view of the Numeric Lab Results Applet
  And the Lab Results Applet contains data rows
  When user refreshes Lab Results Applet
  Then the message on the Lab Results Applet does not say "An error has occurred"

@f144_numeric_lab_results_flag_sort @US2493 @TA7528
Scenario: Numeric Lab Results Applet - Enable sorting flags by priority.
  Given user searches for and selects "Seven,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  And the Lab Results Applet contains data rows
  #When the user scrolls to the bottom of the Numeric Lab Results Applet
  When the user clicks the control "Flag column" in the "Numeric Lab Results applet"
  Then the Numeric Lab Results should be sorted by "FLAG"

@f144_1a_numeric_lab_results_base_applet_cover_sheet @DE2902 @DE2901 @DE3366 @debug @DE3268
Scenario: View ALL numeric lab results on Cover sheet
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the Lab Results Applet contains data rows
  Then the Numeric Lab Results Applet table contains less then 300 rows
  When the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Numeric Lab Results Applet table contains more then 300 rows
