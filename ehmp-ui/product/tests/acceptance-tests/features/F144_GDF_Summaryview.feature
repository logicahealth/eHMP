@F144_Global_Date_Filter @regression @triage
Feature: F144 - eHMP Viewer GUI - Global Date Filter

# Team: Andromeda

Background:
  And user searches for and selects "Eight,Patient"
  Then Summary View is active

@f144_global_date_filter_persistence @US2761 @TA8896c
Scenario: Single-page extended view date changes to not carry back to global date filter.
  Given the "Viewing __ to __" text is correctly set to "18" months in the past and "6" months in the future
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  When the user is viewing the expanded Numeric Lab Results Applet
  And the user clicks the date control "All" on the "Numeric Lab Results applet"
  When the user is viewing the expanded Numeric Lab Results Applet
  And the user minimizes the expanded Numeric Lab Results Applet
  Then the user is returned to the summary view
  And the "Viewing __ to __" text is correctly set to "18" months in the past and "6" months in the future