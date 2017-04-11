@F144_NewsFeedApplet 

Feature: F144-eHMP Viewer GUI - Timeline(NewsFeed)

@f144_8_newsFeedDisplay	@US2638
Scenario: Groups created based on the Month and Year.
  # Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user sees the following groups in Newsfeed Applet
  | group # 	| groupName 	|
  | date_group1	| May 1996  	|
  | date_group2 | December 1995	|
  | date_group3	| September 1995|
  | date_group4	| July 1995		|
  | date_group5	| June 1995		|
  | date_group6 | January 1995	|
  | date_group7	| May 1993		|

@f144_9_newsFeedDisplay @US2638
Scenario: Date/time can be clicked and collapsed

  # Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  When the user clicks on date/time "May 1996" in the newsfeed applet
  Then the date/time collapses and shows "1" result for "May 1996" in the newsfeed applet
  When the user clicks on date/time "December 1995" in the newsfeed applet
  Then the date/time collapses and shows "2" result for "December 1995" in the newsfeed applet

@f144_13_newsFeedDisplay @US2683 @DE776 @debug @DE5726
Scenario: Newsfeed applet displays sorting by Date/Time correctly

  # Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the default sorting by Date/Time is in descending in Newsfeed Applet
  When user clicks on "Date/Time" column header in Newsfeed Applet
  Then the sorting by Date/Time is in ascending in Newsfeed Applet


 @f144_16_newsFeedDisplay @US2639
Scenario: Newsfeed applet is able to filter data based date filter search

  # Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  When user navigates to Timeline Applet
  Then "Timeline" is active
  And the user clicks the control "Date Filter" in the "NewsFeed Applet"
  And the Global Date Filter contains expected buttons

  When the user clicks the Global Date Filter 1yr button
  And the user clicks the control "Apply" on the "NewsFeed Applet"
  Then the search results say "No Records Found" in NewsFeed Applet

  And the user clicks the control "Date Filter" in the "NewsFeed Applet"
  When the user clicks the Global Date Filter 3mo button
  And the user clicks the control "Apply" on the "NewsFeed Applet"
  Then the search results say "No Records Found" in NewsFeed Applet

  And the user clicks the control "Date Filter" in the "NewsFeed Applet"
  When the user clicks the Global Date Filter 1mo button
  And the user clicks the control "Apply" on the "NewsFeed Applet"
  Then the search results say "No Records Found" in NewsFeed Applet

  And the user clicks the control "Date Filter" in the "NewsFeed Applet"
  When the user clicks the Global Date Filter 7d button
  And the user clicks the control "Apply" on the "NewsFeed Applet"
  Then the search results say "No Records Found" in NewsFeed Applet

  And the user clicks the control "Date Filter" in the "NewsFeed Applet"
  When the user clicks the Global Date Filter 72hr button
  And the user clicks the control "Apply" on the "NewsFeed Applet"
  Then the search results say "No Records Found" in NewsFeed Applet

  And the user clicks the control "Date Filter" in the "NewsFeed Applet"
  When the user clicks the Global Date Filter 24hr button
  And the user clicks the control "Apply" on the "NewsFeed Applet"
  Then the search results say "No Records Found" in NewsFeed Applet