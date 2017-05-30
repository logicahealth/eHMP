#Team Neptune
@F153_community_health_summaries @US2113 @DE460 @US4283 @reg2
Feature:F153-HIE C32 - Community Health Summaries

Background:
  And user searches for and selects "Eight,Patient"
  When Cover Sheet is active
  Then the Community Health Summary finishes loading

@US2113_display
Scenario: Verify the summary Community Health Summary display
  Then the community health summary applet has headers
      | header                |
      | Date                  |
      | Authoring Institution |
  Given the Community Health Summary displays at least 1 rows
  Then the community health summary applet date column is in correct format MM/dd/YYYY

@US2113_sort
Scenario: Community Health Sorting - Authoring Institution
  Given the Community Health Summary displays at least 2 rows
  When the user sorts the community health summary applet by column Authoring Institution
  Then Authoring Institution column is sorted in ascending order in summary Community Health Summaries

  When the user sorts the community health summary applet by column Authoring Institution
  Then Authoring Institution column is sorted in descending order in summary Community Health Summaries

@US2113_expand @DE4084 @DE6976
Scenario: User will be able to expand and minimize community health sumamry
  When the user clicks the Community Health Summary Expand Button
  Then the Expanded Community Health Summary applet displays
  Then the Community Health Summary finishes loading
  When the user clicks the Community Health Summary Minimize Button
  Then the user returns to the coversheet

@US2113_detail
Scenario: User will be able to view details
  Given the Community Health Summary displays at least 1 rows
  When the user views the first summary Community Health Summary detail view
  Then the modal is displayed
  And the summary community health summary detail title is correct
  And the community health summary detail view displays patient name, birthdate, age, ssn
  And the community health summary detail view displays Next / Previous buttons

@f153_community_health_refresh 
Scenario: Community Health Summary Applet displays all of the same details after applet is refreshed
  And the Community Health Summary Applet contains data rows
  When user refreshes Community Health Summary Applet
  Then the message on the Community Health Summary Applet does not say "An error has occurred"
  


   

		