@F144_NewsFeedApplet_NoData @regression @triage
Feature: F144-eHMP Viewer GUI - Timeline(NewsFeed)

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  And the user has selected All within the global date picker

@f144_newsfeed_data_display @US1946 @US5422
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  When user navigates to Timeline Applet
  Then the NewsFeed Applet table contains data rows

@f144_newsfeed_visits_display @US1946  @US5422
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  When user navigates to Timeline Applet
  Then the newsfeed table contains headers
      | headerNumber | headerTitle |
      | Header1      | Date & Time |
      | Header2      | Activity    |
      | Header3      | Type        |
      | Header4      | Entered By  |
      | Header5      | Facility    |

# RDK test verifies that this patient has visits
@f144_newsfeed_visits_display @US1946  @US5422
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  When user navigates to Timeline Applet
  Then the Timeline table diplays Type "Visit" rows

@f144_newsfeed_sorting_facility  @US2683 @DE776 @DE3810
Scenario: Newsfeed applet displays sorting by Facility correctly
  When user navigates to Timeline Applet
  And user clicks on "Facility" column header in Newsfeed Applet
  Then the Timeline grid is sorted in "alphabetic" order based on "Facility"

  When user clicks on "Facility" column header in Newsfeed Applet
  Then the Timeline grid is sorted in "reverse alphabetic" order based on "Facility"

  When user clicks on "Facility" column header in Newsfeed Applet
  And the default sorting by Date/Time is in descending in Newsfeed Applet

