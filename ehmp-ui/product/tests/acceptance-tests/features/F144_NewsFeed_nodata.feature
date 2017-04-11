@F144_NewsFeedApplet_NoData @regression @triage
Feature: F144-eHMP Viewer GUI - Timeline(NewsFeed)

@f144_newsFeed_navigate_thro_dropdown @US2457 
Scenario: News feed applet is displayed when selecting Timeline from coversheet dropdown
  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  Then Overview is active
  When user selects Timeline from Coversheet dropdown
  Then "Timeline" is active
  Then the search results say "No Records Found" in NewsFeed Applet

@f144_newsfeed_filter @US1946
Scenario: News feed applet is able to filter data based on search
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user opens newsfeed search filter
  And the user filters the Newsfeed Applet by text "CALCANEUS"
  Then the Newsfeed table only diplays rows including text "CALCANEUS"

@f144_newsfeed_sorting @US2683 @DE776 @debug @DE3810
Scenario: Newsfeed applet displays sorting by Type correctly
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user sorts the Timeline grid by "Type" 
  Then the Timeline grid is sorted in "alphabetic" order based on "Type"
  And the user sorts the Timeline grid by "Type" 
  Then the Timeline grid is sorted in "reverse alphabetic" order based on "Type"
  And the user sorts the Timeline grid by "Type" 
  And the default sorting by Date/Time is in descending in Newsfeed Applet



@f144_newsfeed_data_display @US1946 @US5422
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  When user navigates to Timeline Applet
  And the user has selected All within the global date picker
  And the NewsFeed Applet table contains data rows

@f144_newsfeed_data_display @US1946 @US5422
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  When user navigates to Timeline Applet
  And the user has selected All within the global date picker
  And the NewsFeed Applet table contains data rows
  
@f144_newsfeed_appointments @US2845 @DE713
Scenario: News feed applet displays all of the appointments for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen, Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then the NewsFeed Applet table contains rows of type "Appointment"
  
@f144_newsfeed_DoD_appointments @US2845 @DE713
Scenario: News feed applet displays all of the appointments for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen, Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then the NewsFeed Applet table contains rows of type "DoD Appointment"

@f144_newsfeed_labs @US2845 @DE713
Scenario: News feed applet displays all of the lab visits for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFORTYSEVEN"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then the NewsFeed Applet table contains rows of type "Laboratory"
  
@f144_newsfeed_refresh 
Scenario: News feed applet displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFORTYSEVEN"
  When user navigates to Timeline Applet
  And the user has selected All within the global date picker
  And the NewsFeed Applet table contains data rows
  When user refreshes Timeline Applet
  Then the message on the Timline Applet does not say "An error has occurred"

  
