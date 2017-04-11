@F299_Global_Date_Timeline @regression
Feature: F299 - Global Timeline Date Filter
# The date menu selection will no longer show 6 months into the future.

# Team: Andromeda

Background:
  Given user is logged into eHMP-UI

@US4228_a
Scenario: Verify
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  Then the GDF displays a "Cancel" button
  And the GDF AllActivities Title is "All Events"
  And the GDF Panel Title is "Timeline Summary"


@f299-3.17_date_menu_only_selects_past_to_present @US4228 @TA14378a @DE842 @vimm
Scenario: F299-3.15 Update menu selections to exclude 6 months future

Given user searches for and selects "Eight,Patient"
Then Cover Sheet is active
When the user clicks the control "Date Filter Toggle" on the "Coversheet"
And the user waits for 5 seconds
And the Date Filter displays "18" months in the past and "6" months in the future
Then the following choices should be displayed for the "Coversheet" Date Filter
    | All | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |    
When the user clicks the date control "2yr" in the "Coversheet" 
Then the "From Date" input is correctly set to "24" months in the "past"
Then the "To Date" input is correctly set to "0" months in the "future"

When the user clicks the control "Date Filter Toggle" on the "Coversheet"
When the user clicks the date control "1yr" in the "Coversheet" 
Then the "From Date" input is correctly set to "12" months in the "past"
Then the "To Date" input is correctly set to "0" months in the "future" 

When the user clicks the control "Date Filter Toggle" on the "Coversheet"
When the user clicks the date control "3mo" in the "Coversheet" 
Then the "From Date" input is correctly set to "3" months in the "past"
Then the "To Date" input is correctly set to "0" months in the "future"

When the user clicks the control "Date Filter Toggle" on the "Coversheet"
When the user clicks the date control "1mo" in the "Coversheet" 
Then the "From Date" input is correctly set to "1" months in the "past"
Then the "To Date" input is correctly set to "0" months in the "future"

When the user clicks the control "Date Filter Toggle" on the "Coversheet" 
When the user clicks the date control "7d" in the "Coversheet" 
Then the "From Date" input is correctly set to "7" days in the "past"
Then the "To Date" input is correctly set to "0" days in the "future"

When the user clicks the control "Date Filter Toggle" on the "Coversheet" 
And the user clicks the date control "72hr" on the "Coversheet"
Then the "From Date" input is correctly set to "3" days in the "past"
Then the "To Date" input is correctly set to "0" days in the "future"

When the user clicks the control "Date Filter Toggle" on the "Coversheet" 
And the user clicks the date control "24hr" on the "Coversheet" 
Then the "From Date" input is correctly set to "1" days in the "past"
Then the "To Date" input is correctly set to "0" days in the "future"

@TC348 @DE2923
Scenario: TC348 verify the correct values are displayed for all btn
  Given user searches for and selects "Ten,Patient"
  Then Overview is active
  When the user opens the Global Date Filter
  And the user sets Global Date Filter to All
  Then the "To Date" input is correctly set to "0" days in the "future"
  And the "From Date" input is set to the patients birthday "04/07/1935"
