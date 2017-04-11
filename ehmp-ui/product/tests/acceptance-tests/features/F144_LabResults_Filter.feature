@F144_Lab_Results_Base_Applet_Filter @Lab_Results @regression
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results - Filtering

# Team: Andromeda

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@f144_numeric_lab_results_applet_filter_by_panel_pass @US2313 @TA6537a 
Scenario: Numeric Lab Results Applet - Filter numeric lab results outside of the panel.
  Given the user has selected All within the global date picker
  And the applet displays numeric lab results
  When the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
  And the user inputs "LDL" in the "Text Filter" control in the "Numeric Lab Results applet"
 # Then the "Numeric Lab Results Applet" table contains 22 rows
  Then the Lab Test column in the Numeric Lab Results Applet contains "LDL"

@f144_numeric_lab_results_text_filtering_lab_type @US2552 @TA7994a @triage @DE1226
Scenario: Numeric Lab Results Applet - Filtering by Lab Type inside the panel and view VistA results
  Given the user is viewing the expanded "Numeric Lab Results" applet
  When the user clicks the date control "All" on the "Numeric Lab Results applet"
  And the applet displays numeric lab results
  When the user inputs "inr" in the "Text Filter" control in the "Numeric Lab Results applet"
  Then the Lab Test column in the Numeric Lab Results Applet contains "inr"

@f144_numeric_lab_results_text_filtering_lab_type @US2552 @TA7994b @triage @DE1226
Scenario: User can filter by Lab Type inside the panel and view DoD results
  Given the user is viewing the expanded "Numeric Lab Results" applet
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  When the applet displays numeric lab results
  When the user inputs "hematocrit" in the "Text Filter" control in the "Numeric Lab Results applet"
  Then the Lab Test column in the Numeric Lab Results Applet contains "hematocrit"

@f144_numeric_lab_results_text_filtering_result @US2552 @TA7994c @triage @DE1226 
Scenario: Numeric Lab Results Applet - Filtering by Result.
  Given the user is viewing the expanded "Numeric Lab Results" applet
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  When the applet displays numeric lab results
  When the user inputs "185" in the "Text Filter" control in the "Numeric Lab Results applet"
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  Then the Result column in the Numeric Lab Results Applet contains "185"



