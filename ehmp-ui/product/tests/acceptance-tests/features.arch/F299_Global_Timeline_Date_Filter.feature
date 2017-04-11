@F299_Global_Timeline_Date_Filter @regression @triage

Feature: F299 : Global timeline date filter


# Requirement changed by DE6230: in discussion
# [8/17/16, 11:26:02 AM] Ben Cushing: Good point.  Please add +6 months to all predefined date ranges from Today back
@f299-3.17_date_menu_only_selects_past_to_present @US4228 @TA14378a @DE842
Scenario: F299-3.15 Update menu selections to exclude 6 months future: Verify GDF from/to input boxes updates 

Given user searches for and selects "Eight,Patient"
Then Cover Sheet is active
When the user clicks the control "Date Filter Toggle" on the "Coversheet"
And the user waits for 5 seconds
And the Date Filter displays "18" months in the past and "6" months in the future
And the Global Date Filter contains expected buttons

When the user clicks the Global Date Filter 2yr button
Then the "From Date" input is correctly set to "24" months in the "past"
And the "To Date" input is correctly set to "0" months in the "future"

When the user clicks the Global Date Filter 1yr button
Then the "From Date" input is correctly set to "12" months in the "past"
And the "To Date" input is correctly set to "0" months in the "future" 

When the user clicks the Global Date Filter 3mo button
Then the "From Date" input is correctly set to "3" months in the "past"
And the "To Date" input is correctly set to "0" months in the "future"

When the user clicks the Global Date Filter 1mo button
Then the "From Date" input is correctly set to "1" months in the "past"
And the "To Date" input is correctly set to "0" months in the "future"

When the user clicks the Global Date Filter 7d button
Then the "From Date" input is correctly set to "7" days in the "past"
And the "To Date" input is correctly set to "0" days in the "future"

When the user clicks the Global Date Filter 72hr button
Then the "From Date" input is correctly set to "3" days in the "past"
And the "To Date" input is correctly set to "0" days in the "future"

When the user clicks the Global Date Filter 24hr button
Then the "From Date" input is correctly set to "1" days in the "past"
And the "To Date" input is correctly set to "0" days in the "future"

# Requirement changed by DE6230: in discussion
# [8/17/16, 11:26:02 AM] Ben Cushing: Good point.  Please add +6 months to all predefined date ranges from Today back
@US4228 @gdf_minimized
Scenario: F299-3.15 Update menu selections to exclude 6 months future: Verify GDF date range after dates applied
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  
  And the "Viewing __ to __" text is correctly set to "18" months in the past and "6" months in the future
  When the user changes the global date filter to All  
  Then the "Viewing __ to __" text is correctly set to "ALL"

  When the user changes the global date filter to 2YR 
  Then the "Viewing __ to __" text is correctly set to "24" months in the past and "0" months in the future

  When the user changes the global date filter to 1YR 
  Then the "Viewing __ to __" text is correctly set to "12" months in the past and "0" months in the future

  When the user changes the global date filter to 3M
  Then the "Viewing __ to __" text is correctly set to "3" months in the past and "0" months in the future

  When the user changes the global date filter to 1M
  Then the "Viewing __ to __" text is correctly set to "1" months in the past and "0" months in the future

  When the user changes the global date filter to 7D
  Then the "Viewing __ to __" text is correctly set to "7" days in the past and "0" months in the future

  When the user changes the global date filter to 72HR
  Then the "Viewing __ to __" text is correctly set to "3" days in the past and "0" months in the future
  
  When the user changes the global date filter to 24HR
  Then the "Viewing __ to __" text is correctly set to "1" days in the past and "0" months in the future