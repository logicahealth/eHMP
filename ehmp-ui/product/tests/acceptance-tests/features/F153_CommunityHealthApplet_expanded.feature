@F153_community_health_summaries @US2113 @DE460 @US4283 @chs_expanded @reg2
Feature:F153-HIE C32 - Community Health Summaries - expanded

Background:
  Given user searches for and selects "Eight,Patient"
  And user navigates to expanded Community Health Summaries

@chs_expanded_display
Scenario: Verify the expanded Community Health Summary display
  Then the community health summary applet has headers
      | header                |
      | Date                  |
      | Description           |
      | Authoring Institution |
  And the community health summary applet filter is not visible
  Given the Community Health Summary displays at least 2 rows
  Then the community health summary applet date column is in correct format MM/dd/YYYY - HH:SS
 
@chs_expanded_sort
Scenario: Verify the expanded Community Health Summary sorting
  Given the Community Health Summary displays at least 2 rows
  When the user sorts the community health summary applet by column Authoring Institution
  Then Authoring Institution column is sorted in ascending order in expanded Community Health Summaries

  When the user sorts the community health summary applet by column Authoring Institution
  Then Authoring Institution column is sorted in descending order in expanded Community Health Summaries

@chs_expanded_filter
Scenario: Verify Community Health Summary filtering
  Given the Community Health Summary displays at least 2 rows
  When the user filters the community health summary applet by text "Clinic"
  Then the community health summary table only diplays rows including text "Clinic"

@chs_expanded_detail
Scenario: Verify Community Health Summary detail view
  Given the Community Health Summary displays at least 1 rows
  When the user views the first expanded Community Health Summary detail view
  Then the modal is displayed
  And the community health summary detail title is correct
  And the community health summary detail view displays patient name, birthdate, age, ssn
  And the community health summary detail view displays Next / Previous buttons

@chs_detail_view_step
Scenario: 
  Given the Community Health Summary displays at least 3 rows
  And the user notes the first 3 rows of the expanded Community Health Summary detail view
  When the user views the first expanded Community Health Summary detail view
  Then the Community Health Summary View detail view displays
  And the user can step through the community health summaries using the next button
  And the user can step through the community health summaries using the previous button

@f153_community_health_expand_view_refresh @DE4084 
Scenario: Community Health Summary expand view (which is Timeline) displays all of the same details after applet is refreshed
  When user refreshes Community Health Summary Applet
  Then the message on the Community Health Summary Applet does not say "An error has occurred"
