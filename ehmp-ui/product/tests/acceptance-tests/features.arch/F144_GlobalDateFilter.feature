@F144_Global_Date_Filter @regression @triage
Feature: F144 - eHMP Viewer GUI - Global Date Filter

# Team: Andromeda

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@f144_global_date_filter_persistence_modal @US2761 @TA8896b @modal_test
Scenario: Global date carry over to the modal view.
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the Date Filter displays "18" months in the past and "6" months in the future
  And the user waits for 5 seconds
  And the user clicks the date control "2yr" on the "Coversheet"
  And the to date displays today's date
  And the user clicks the control "Apply" on the "Coversheet"
  And the "Viewing __ to __" text is correctly set to "24" months in the past and "0" months in the future  
  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  #And the active date control in the "Numeric Lab Results modal" is the "2yr" button

@f144_global_date_ui_functionality @US2746 @TA8851b
Scenario: The global date for 2yr, 1yr, (etc.) should default to 6 months into the future and the selected range into the past, from the current date.
  #Then the "Viewing __ to __" text is correctly set to "18" months in the past and "6" months in the future
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  #And the user clicks the date control "All" on the "Coversheet"
  #Then the "Viewing __ to __" text is correctly set to "Viewing All"
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "2yr" on the "Coversheet"
  #And the "Viewing __ to __" text is correctly set to "24" months in the past and "6" months in the future
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "1yr" on the "Coversheet"
  #And the "Viewing __ to __" text is correctly set to "12" months in the past and "6" months in the future
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "3mo" on the "Coversheet"
  #And the "Viewing __ to __" text is correctly set to "3" months in the past and "6" months in the future
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "1mo" on the "Coversheet"
  #And the "Viewing __ to __" text is correctly set to "1" months in the past and "6" months in the future
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "7d" on the "Coversheet"
  #And the "Viewing __ to __" text is correctly set to "7" days in the past and "6" months in the future
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "72hr" on the "Coversheet"
  #And the "Viewing __ to __" text is correctly set to "3" days in the past and "6" months in the future
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  And the user clicks the date control "24hr" on the "Coversheet"
  #And the "Viewing __ to __" text is correctly set to "1" days in the past and "6" months in the future