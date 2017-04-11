@F144_Lab_Results_Date_Filter @Lab_Results @regression
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

# Team: Andromeda

Background:
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@f144_numeric_lab_results_date_filter_preset_dates @US2221 @TA6057b @manual
Scenario: Date filtering using the preset buttons.
	When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
	Then the "Date Filter" should be "Displayed" in the "Numeric Lab Results applet"
	And the following choices should be displayed for the "Numeric Lab Results applet" Date Filter
		| All | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |
	When the user clicks the date control "All" in the "Numeric Lab Results applet"
	Then the "Numeric Lab Results Applet" table contains 357 rows
	When the user clicks the date control "2yr" in the "Numeric Lab Results applet"
	Then the "Numeric Lab Results Applet" table contains 33 rows
	When the user clicks the date control "1yr" in the "Numeric Lab Results applet"
	Then no results should be found in the "Numeric Lab Results applet"
	When the user clicks the date control "3mo" in the "Numeric Lab Results applet"
	Then no results should be found in the "Numeric Lab Results applet"
	When the user clicks the date control "1mo" in the "Numeric Lab Results applet"
	Then no results should be found in the "Numeric Lab Results applet"
	When the user clicks the date control "7d" in the "Numeric Lab Results applet"
	Then no results should be found in the "Numeric Lab Results applet"
	When the user clicks the date control "72hr" in the "Numeric Lab Results applet"
	Then no results should be found in the "Numeric Lab Results applet"
	When the user clicks the date control "24hr" in the "Numeric Lab Results applet"
	Then no results should be found in the "Numeric Lab Results applet"



@f144_numeric_lab_results_coversheet_default_date @US2481 @TA7508 @reworked_in_firefox
Scenario: Default date range of the applet is 18 months past and 6 months in the future.
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  Then the "From Date" input should be set to "18" months in the "past" in the "Numeric Lab Results applet"
  And the "To Date" input should be set to "6" months in the "future" in the "Numeric Lab Results applet"

@f144_numeric_lab_results_date_filter_custom_from_to @US2221 @TA6057c @reworked_in_firefox
Scenario: Date filtering using the Custom button.
	When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
	And the user inputs "04/11/2013" in the "From Date" control in the "Numeric Lab Results applet"
	And the user inputs "05/04/2013" in the "To Date" control in the "Numeric Lab Results applet"
	And the user clicks the control "Apply" in the "Numeric Lab Results applet"
	Then the "Numeric Lab Results Applet" table contains 7 rows




