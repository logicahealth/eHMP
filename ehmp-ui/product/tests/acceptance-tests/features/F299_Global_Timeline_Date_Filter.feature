@F299_Global_Timeline_Date_Filter @regression @triage

Feature: F299 : Global timeline date filter

#POC: Team Pluto

Background:
    Given user is logged into eHMP-UI

@F298-13.2 @US4052 @future
Scenario: Displaying on the coversheet and timeline - assuming the user has logged in and patient has data to display on the  "coversheet and timeline"
Given the timeline sheet is active
Then the inline timeline is not display
And the global data timeline picker is displayed
When the user clicks the global date picker
Then the timeline is active
When the user clicks a time frame on the global data picker
Then the timeline list is updated to reflect the selected data range

@F299 @US4237
Scenario: As a user, when I view the global date timeline picker I will see a summary list of encounters (visits) for the selected time period.
  And user searches for and selects "Eight,Patient"
  And Overview is active 
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  Then the GDF headers are 
   | header      |
   | Date & Time |
   | Activity    |
   | Type        |

@US4182
Scenario: When a user clicks on a line item in the summary list view the detail timeline modal view for the item will display
  And user searches for and selects "Eight,Patient"
  And Overview is active 
  When the user clicks the control "Date Filter Toggle" on the "Coversheet"
  Given the GDF displays rows in the Timeline Summary
  When the user selects the first row in the Timeline Summary
  Then a Timeline detail displays
