@F1205 @reg1
Feature: Display Searched terms in PRS Results

#Team Application
  
@f1205_text_search_synonyms @US17835 @US17837 @US17836
Scenario: Display synonyms and searched terms in PRS Results
  Given user searches for and selects "EIGHT,PATIENT"
  When user searches for "glucose"
  Then the Search Results header displays statement in format Displaying number of result for searched term
  And user selects the View Synonyms Used button
  Then the View Synonyms Used button is enabled
  And the text search synonym popover line 1 displays text "eHMP Search includes synonyms. The following terms were also included in your search:"
  And the text search synonym popover displays synonyms "blood sugar, dextrose, glucose, sugar"
  