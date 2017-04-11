@F144_Lab_Results_Modal @Lab_Results @regression @triage
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results in expanded view

# Team: Andromeda, inherited by Team Venus

#Background:
  # Given user is logged into eHMP-UI

@f144_numeric_lab_results_graph @US2213 @TA6055 @modal_test @debug @DE1142
Scenario: Lab History modal graph.
  Given user searches for and selects "Seven,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the user is viewing the expanded "Numeric Lab Results" applet
  When the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  And the modal's title is "TRIGLYCERIDE - SERUM"
  And the user clicks the date control "All" in the "Numeric Lab Results modal"
  And the "Lab Graph" should be "Displayed" in the "Numeric Lab Results modal"
  And the "Lab Graph" title is "TRIGLYCERIDE - SERUM"
  And the "Y-axis Label" should be "Displayed" in the "Numeric Lab Results modal"
  And the "Y-axis Label" is "mg/dL"


@f144_numeric_lab_results_modal_graph_date_axis_years @US2562 @TA7868a @modal_test @debug @DE1142
Scenario: Numeric Lab Results Modal - ensure data ranges are appropriate for number of tests.
  Given user searches for and selects "Seven,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the user is viewing the expanded "Numeric Lab Results" applet
  When the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  And the modal's title is "TRIGLYCERIDE - SERUM"
  And the user clicks the date control "All" in the "Numeric Lab Results modal"
  And the "Total Tests" label has the value "22"
  And the number of "Graph Points" is "22" in the "Numeric Lab Results modal"
  And the number of "Date Range labels" is "3" in the "Numeric Lab Results modal"
  And the "Date Range labels" in the "Numeric Lab Results modal" are given as
    | Label       |
    | Jan 01 2008 |
    | Jan 01 2009 |
    | Jan 01 2010 |





