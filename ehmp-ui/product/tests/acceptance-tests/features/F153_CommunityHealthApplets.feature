#Team Neptune
@US2113 @DE460 @US4283  @regression
Feature:F153-HIE C32 - Community Health Summaries

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  When Cover Sheet is active
  Then the Community Health Summary finishes loading


    

@US2113_sort
Scenario: Community Health Sorting - Authoring Institution
    When the Community Health Summary displays at least 2 rows
    And user clicks on the column header "Authoring Institution" in CHS Gist
    Then Authoring Institution column is sorted in "ascending" order in CHS Gist
    When user clicks on the column header "Authoring Institution" in CHS Gist
    Then Authoring Institution column is sorted in "descending" order in CHS Gist

@US2113_expand @DE4084 @debug @DE6976
Scenario: User will be able to expand and minimize community health sumamry
  When the user clicks the Community Health Summary Expand Button
  Then the Expanded Community Health Summary applet displays
  Then the Community Health Summary finishes loading
  When the user clicks the Community Health Summary Minimize Button
  Then the user returns to the coversheet

@US2113_detail
Scenario: User will be able to view details
  When the user views the details for the first Community Health Summary
  Then the modal is displayed
  And the Community Health Summary View detail view displays
  
@f153_community_health_modal_details @data_specific
Scenario: Users will be able to view modal popup for a particular community health summary from summary view
  When the user views the first Community Health Summary detail view
  Then the modal is displayed
  And the modal's title is "Continuity of Care Document - Kaiser Permanente Mid-Atlantic STSTMA2"
  
@f153_community_health_modal_details @data_specific @DE4084 
Scenario: Users will be able to view modal popup for a particular community health summary from expand view
  When the user clicks the Community Health Summary Expand Button
  Then the Expanded Community Health Summary applet displays	
  When the user views the first Community Health Summary detail view
  Then the modal is displayed
  And the modal's title is "Continuity of Care Document - Kaiser Permanente Mid-Atlantic STSTMA2"
  
@f153_community_health_refresh 
Scenario: Community Health Summary Applet displays all of the same details after applet is refreshed
  And the Community Health Summary Applet contains data rows
  When user refreshes Community Health Summary Applet
  Then the message on the Community Health Summary Applet does not say "An error has occurred"
  
@f153_community_health_expand_view_refresh @DE4084 
Scenario: Community Health Summary expand view (which is Timeline) displays all of the same details after applet is refreshed
  When the user clicks the Community Health Summary Expand Button
  Then the Expanded Community Health Summary applet displays	
  And the Community Health Summary Applet contains data rows
  When user refreshes Community Health Summary Applet
  Then the message on the Community Health Summary Applet does not say "An error has occurred"

   

		