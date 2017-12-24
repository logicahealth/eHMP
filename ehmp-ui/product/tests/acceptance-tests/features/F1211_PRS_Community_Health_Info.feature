@F1211 @reg1 @CommunityHealthSummaries_applet
Feature: Add Community Health information to patient record text search results

#Team Application
  
@f1211_add_community_health_info @US17855 @US17856 
Scenario: View relevant C32 documents and it's details
  Given user searches for and selects "EIGHT,PATIENT"
  Then Summary View is active
  And user searches for "summarization"
  Then text search results are grouped
  When the user expands the main group "CommunityHealthSummaries"
  And the text search community health summaries "CommunityHealthSummaries" results display
     | field    | search_results                  |
     | title    | is a valid title                |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is present                      |
  And the search results containing search term "summarization" are highlighted 
  And the user views details of the first "Community Health Summaries" 
  Then the modal is displayed
  And community health summaries modal contains term "summarization" as highlighted

@f1211_add_community_health_info @US17857 @US17858 
Scenario: View relevant CCDA documents and it's details
  Given user searches for and selects "EIGHT,PATIENT"
  Then Summary View is active
  And user searches for "continuity"
  Then text search results are grouped
  When the user expands the main group "CommunityHealthSummaries"
  And the text search community health summaries "CommunityHealthSummaries" results display
     | field    | search_results                  |
     | title    | is a valid title                |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is present                      |
  And the search results containing search term "continuity" are highlighted 
  And the user views details of the first "Community Health Summaries"
  Then the modal is displayed
  And community health summaries modal contains term "continuity" as highlighted


@f1211_add_community_health_info @US17859 @US17860 
Scenario: Detail View Shows Synonyms are highlighted
  Given user searches for and selects "EIGHT,PATIENT"
  Then Summary View is active
  And user searches for "med"
  And text search results are grouped
  And the user expands the main group "CommunityHealthSummaries"
  And the user views details of the first "Community Health Summaries"
  Then the modal is displayed
  And community health summaries modal contains term "medications" as highlighted
  And the user clicks the modal Close Button
