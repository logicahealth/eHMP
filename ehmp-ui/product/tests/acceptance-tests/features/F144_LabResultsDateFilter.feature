@F144_Lab_Results_Date_Filter @Lab_Results @regression @triage
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

# Team: Andromeda

Background:
  # Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Cover Sheet is active

@f144_numeric_lab_results_date_filter_open_close @US2221 @TA6057a @reworked_in_firefox
Scenario: Date filtering - opening and closing control.
	When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
	Then the "Date Filter" should be "Displayed" in the "Numeric Lab Results applet"
	When the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
	Then the "Date Filter" should be "Hidden" in the "Numeric Lab Results applet"
	When the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
	Then the "Date Filter" should be "Displayed" in the "Numeric Lab Results applet"

@f144_numeric_lab_results_modal_apply_enabled @US2326 @TA6661b @DE284 @DE3867 @DE4267 @debug @DE4559
Scenario: Custom filters should retain their values.
  Then the "Numeric Lab Results" applet is finished loading
  And the user has selected All within the global date picker

  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  When the user inputs "01/01/2010" in the "From Date" control in the "Numeric Lab Results modal"
  And the user inputs "01/01/2013" in the "To Date" control in the "Numeric Lab Results modal"
  And the Custom date field "Apply" button should be "enabled" in the "Numeric Lab Results modal"
  When the user clicks the date control 2yr in the Numeric Lab Results modal
  Then the "From Date" input should have the value "01/01/2010" in the "Numeric Lab Results modal"
  And the "To Date" input should have the value "01/01/2013" in the "Numeric Lab Results modal"
  And the Custom date field "Apply" button should be "disabled" in the "Numeric Lab Results modal"

@f144_numeric_lab_results_modal_apply_enabled @US2326 @TA6661a @DE3867
Scenario: Apply button should be disabled unless valid dates are entered.
  And the user has selected All within the global date picker

  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  When the user inputs "" in the "From Date" control in the "Numeric Lab Results modal"
  And the user inputs "" in the "To Date" control in the "Numeric Lab Results modal"
  Then the Custom date field "Apply" button should be "disabled" in the "Numeric Lab Results modal"
  When the user inputs "01/01/2010" in the "From Date" control in the "Numeric Lab Results modal"
  And the user inputs "01/01/2013" in the "To Date" control in the "Numeric Lab Results modal"
  Then the Custom date field "Apply" button should be "enabled" in the "Numeric Lab Results modal"
  When the user inputs "" in the "From Date" control in the "Numeric Lab Results modal"
  And the user inputs "" in the "To Date" control in the "Numeric Lab Results modal"
  Then the Custom date field "Apply" button should be "disabled" in the "Numeric Lab Results modal"

