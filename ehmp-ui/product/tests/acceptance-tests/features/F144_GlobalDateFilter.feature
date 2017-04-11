@F144_Global_Date_Filter  
Feature: F144 - eHMP Viewer GUI - Global Date Filter

# Team: Andromeda

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@f144_global_date_filter_open_close @US2640 @TA8566a
Scenario: Date filtering - opening and closing control by clicking outside of Date Filter.
  Given the coversheet is displayed
  And the "Date Filter" should be "Hidden" on the Coversheet
  When the user opens the Global Date Filter
  When user refreshes Community Health Summary Applet
  Then the "Date Filter" should be "Hidden" on the Coversheet

@f144_global_date_filter_open_close @US2640 @TA8566b
Scenario: Date filtering - opening and closing control using "X" button.
  Then the coversheet is displayed
  And the "Date Filter" should be "Hidden" on the Coversheet
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  #Then the "Date Filter" should be "Displayed" on the Coversheet
  #When the user clicks the control "Date Filter Close" on the "Coversheet"
  Then the "Date Filter" should be "Hidden" on the Coversheet

@f144_global_date_filter_open_close @US2640 @TA8566c 
Scenario: Date filtering - inclusion of the preset buttons.
  Then the coversheet is displayed
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the Global Date Filter contains expected buttons

#@f144_global_date_1yr_default @US2640 @TA8566d
#Scenario: Default date range of the applet is 1yr.
  #Then the "Viewing __ to __" text is correctly set to "18" months in the past and "6" months in the future

@f144_global_date_apply_enabled @US2640 @TA8566e @DE284
Scenario: Custom filters should be enabled by default.
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  Then the Custom date fields should be "enabled" on the "Coversheet"
  When the user inputs "01/01/2010" in the "From Date" control in the "Coversheet"
  And the user inputs "10/10/2020" in the "To Date" control in the "Coversheet"
  Then the Custom date field "Apply" button should be "enabled" on the "Coversheet"
  When the user clicks the Global Date Filter 2yr button
  And the user clicks the control "Date Filter Toggle" on the "Coversheet"
  Then the Custom date fields should be "enabled" on the "Coversheet"
  #And the Custom date field "Apply" button should be "disabled" on the "Coversheet"

@f144_global_date_filter_persistence_single_page @US2761 @TA8896a @DE4379
Scenario: Global date carry over to the single-page extended view.
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  When the user clicks the Global Date Filter 2yr button
  And the user clicks the Global Date Filter Apply button
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  Then the active date control in the Numeric Lab Results applet is the 2yr button
  



@f144_global_date_ui_functionality @US2746 @TA8851c
Scenario: The date menu options will not display as selected when a user applies a custom date filter.
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  When the user inputs "02/01/2010" in the "From Date" control on the "Coversheet"
  And the user inputs "10/10/2020" in the "To Date" control on the "Coversheet"
  And the user clicks the Global Date Filter Apply button
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  Then there is no active date control on the "Coversheet"

@f144_global_date_ui_functionality @DE284 @DE284_1 @DE6230
Scenario: The custom date range will NOT remain if a user changes to a default selection.
  When the user changes the global date filter to custom dates From "02/01/2010" and to "10/10/2020"
  Then the "Viewing __ to __" text is correctly set to "02/01/2010 - 10/10/2020"
  When the user opens the Global Date Filter
  And the user clicks the Global Date Filter 24hr button
  Then the "From Date" input is correctly set to "1" days in the "past"
  Then the "To Date" input is correctly set to "6" months in the "future"

