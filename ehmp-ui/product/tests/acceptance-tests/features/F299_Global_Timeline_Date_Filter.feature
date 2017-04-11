@F299_Global_Timeline_Date_Filter @regression @triage 

Feature: F299 : Global timeline date filter

#POC: Team Pluto

@US5552 @debug @DE6815
Scenario: Verify Inpatient / Outpatient Bins
  Given user searches for and selects "Eight,Patient"
  And Overview is active 
  When the user opens the Global Date Filter
  Then the Global Date Filter displays an Inpatient legend
  And the Global Date Filter displays Inpatient bins
  And the Global Date Filter displays an Outpatient legend
  And the Global Date Filter displays Outpatient bins

@F299 @US4237
Scenario: As a user, when I view the global date timeline picker I will see a summary list of encounters (visits) for the selected time period.
  Given user searches for and selects "Eight,Patient"
  And Overview is active 
  When the user opens the Global Date Filter
  Then the GDF headers are 
   | header      |
   | Date & Time |
   | Activity    |
   | Type        |
   
@f299-3.3_form_date_masking_and_validation @US4025 @TA13178c @debug @DE3145
Scenario: F299-3.3 From date text field masking and validation

Given user searches for and selects "Eight,Patient"
Then Cover Sheet is active
When the user opens the Global Date Filter
And the Date Filter displays "18" months in the past and "6" months in the future
Then the Custom date fields should be "enabled" on the "Coversheet"
When user enters "01/01/2019" in the from field
And the from tooltip contains text "Please select a date in the past."
Then the Custom date field "Apply" button should be "disabled" on the "Coversheet"
When user enters today's date in from field
And the from tooltip contains text "Please select a date in the past."
Then the Custom date field "Apply" button should be "disabled" on the "Coversheet"

@US4182 @debug @DE6793
Scenario: When a user clicks on a line item in the summary list view the detail timeline modal view for the item will display
  Given user searches for and selects "Eight,Patient"
  And Overview is active 
  When the user opens the Global Date Filter
  Then the GDF displays rows in the Timeline Summary
  When the user selects the first row in the Timeline Summary
  Then a Timeline detail displays

@US5593
Scenario: Verify the From Date is set to patient birth date after User selects pre-defined All button
  Given user searches for and selects "Eight,Patient"
  #And Overview is active 
  Then Cover Sheet is active
  When the user opens the Global Date Filter
  And the user clicks the Global Date Filter All button
  Then the From Date is set to the patient's birth date
  
@f299-3.4_to_date_masking_and_validation @US4025 @TA13178d @DE5133
Scenario: F299-3.4 To date text field masking and validation

  Given user searches for and selects "Eight,Patient"
  And Overview is active
  When the user opens the Global Date Filter
  And user enters "01/01/2014" in the to field
  Then the To Field resets to blank
  
@US4228_a @US4342 @F916_55
Scenario: Verify
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  Then the GDF displays a "Cancel" button
  And the GDF Panel Title is "Timeline Summary"

@DE6230 @DE6897_a
Scenario: F299-3.15 Update menu selections to include 6 months future: Verify GDF from/to input boxes updates 
  When POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
Given user searches for and selects "Eight,Patient"
Then Cover Sheet is active
When the user opens the Global Date Filter
And the Date Filter displays "18" months in the past and "6" months in the future
And the Global Date Filter contains expected buttons

When the user clicks the Global Date Filter 2yr button
Then the "From Date" input is correctly set to "24" months in the "past"
And the "To Date" input is correctly set to "6" months in the "future"

When the user clicks the Global Date Filter 1yr button
Then the "From Date" input is correctly set to "12" months in the "past"
And the "To Date" input is correctly set to "6" months in the "future" 

When the user clicks the Global Date Filter 3mo button
Then the "From Date" input is correctly set to "3" months in the "past"
And the "To Date" input is correctly set to "6" months in the "future"

When the user clicks the Global Date Filter 1mo button
Then the "From Date" input is correctly set to "1" months in the "past"
And the "To Date" input is correctly set to "6" months in the "future"

When the user clicks the Global Date Filter 7d button
Then the "From Date" input is correctly set to "7" days in the "past"
And the "To Date" input is correctly set to "6" months in the "future"

When the user clicks the Global Date Filter 72hr button
Then the "From Date" input is correctly set to "3" days in the "past"
And the "To Date" input is correctly set to "6" months in the "future"

When the user clicks the Global Date Filter 24hr button
Then the "From Date" input is correctly set to "1" days in the "past"
And the "To Date" input is correctly set to "6" months in the "future"

@DE6230 @gdf_minimized
Scenario: F299-3.15 Update menu selections to include 6 months future: Verify GDF date range after dates applied
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  
  And the "Viewing __ to __" text is correctly set to "18" months in the past and "6" months in the future
  When the user changes the global date filter to All  
  Then the "Viewing __ to __" text is correctly set to "ALL"

  When the user changes the global date filter to 2YR 
  Then the "Viewing __ to __" text is correctly set to "24" months in the past and "6" months in the future

  When the user changes the global date filter to 1YR 
  Then the "Viewing __ to __" text is correctly set to "12" months in the past and "6" months in the future

  When the user changes the global date filter to 3M
  Then the "Viewing __ to __" text is correctly set to "3" months in the past and "6" months in the future

  When the user changes the global date filter to 1M
  Then the "Viewing __ to __" text is correctly set to "1" months in the past and "6" months in the future

  When the user changes the global date filter to 7D
  Then the "Viewing __ to __" text is correctly set to "7" days in the past and "6" months in the future

  When the user changes the global date filter to 72HR
  Then the "Viewing __ to __" text is correctly set to "3" days in the past and "6" months in the future
  
  When the user changes the global date filter to 24HR
  Then the "Viewing __ to __" text is correctly set to "1" days in the past and "6" months in the future






