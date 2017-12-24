@F144_NewsFeedApplet @timeline_applet
Feature: F144-eHMP Viewer GUI - Timeline(NewsFeed)

Background:
  Given user searches for and selects "Sixhundred,Patient"
  And the user has selected All within the global date picker
  And user navigates to Timeline Applet

@f144_8_newsFeedDisplay @US2638
Scenario: Groups created based on the Month and Year.
  Then the Timeline Applet has grouped headers in format MonthName YEAR
  And the headers are named for row dates

@f144_9_newsFeedDisplay @US2638 @test_nf_gdf
Scenario: Date/time can be clicked and collapsed
  Given the Timeline Applet displays grouped headers and rows
  And the user counts the rows displayed for a specific grouped header in the timeline applet
  When the user clicks on a group header in the timeline applet
  Then the group header collapses and a badge displays number of hidden rows in the timeline applet

@f144_13_newsFeedDisplay @US2683 @DE776 @debug @DE5726 
Scenario: Newsfeed applet displays sorting by Date/Time correctly
  Given the default sorting by Date/Time is in descending in Newsfeed Applet
  When user sorts on Date/Time column header in Newsfeed Applet
  Then the sorting by Date/Time is in ascending in Newsfeed Applet
