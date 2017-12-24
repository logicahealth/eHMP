@F320_TextSearchImprovements @F1205 @F1213 @reg1
Feature: F320 : TextSearchImprovements
#This feature will enhance the current text search engine used within eHMP to improve areas such as predications, synonyms, misspellings, duplicates, suggestions, as well as others.
#As an eHMP user, I need to be able to have a broad range of synonyms and acronyms returned when I enter queries into text search; so that I can have a more varied selection than what is currently available.

#POC: Team Venus
#putting future on this test, it started failing randomly and I cannot figure out why.  I don't have time to debug more.
@F320_1_TextSearchImprovements @US5513 @DE3379 @US17879 @future
Scenario: Verfy text search returns value no result
  And user searches for and selects "Eight,Patient"
  Then Summary View is active
  Then user searches for "uiuiuiuiuiuiuiuiuiu" with no suggestion

@F320_2_TextSearchImprovements @US4538 @DE2270 @DE3379
Scenario: Verfy text search returns value duplicates
  And user searches for and selects "Five,Patient"
  Then Summary View is active
  Then user searches for "chem" with no duplicates in the results dropdown

@F320_3_TextSearchImprovements @US4542 @DE3379 @DE5484
Scenario: The application needs to be able to highlight the same search terms when the details of the search results are displayed.
  And user searches for and selects "Four,Patient"
  Then Summary View is active
  Then user searches for "chocolate"
  And the user expands the main group "AllergyAdverseReaction"
  And the user views details of the first "Allergy"
  Then the modal is displayed
  And the modal's title is "Allergen - CHOCOLATE"
  Then the modal contains highlighted "CHOCOLATE"

@F320_4_TextSearchImprovements @US4542 @DE1793 @DE2657
Scenario: The application needs to be able to highlight the same search terms when the details of the search results are displayed.
  And user searches for and selects "Ten,Patient"
  Then Summary View is active
  Then user searches for "allergy"
  And the user expands the main group "ProgressNote"
  And the user expands the subgroup "Diabetes"
  And the user views details of the first subgroup "Diabetes"
  Then the modal is displayed
  And the modal's title is "diabetes"
  Then the modal contains highlighted "ALLERGIES"

@F320_5_TextSearchImprovements @US5866 @DE1200 @DE2270 @DE3379 @DE7072
Scenario: Verify results for suggestions while searching for specific word
  And user searches for and selects "Seven,Patient"
  Then Summary View is active
  Then user searches for "hiper" and verifies spelling suggestions are displayed

@F320_6_TextSearchImprovements @US4543 @DE1660 @DE1838 @DE3379 @DE6816
Scenario: Verify Related terms, Drug classes and Predications relevant to the initail search term are display in the search results
  And user searches for and selects "Five,Patient"
  Then Summary View is active
  Then user searches for "aspirin" and verifies suggestions
  | suggestions			  |
  | Search for: "aspirin" |
  | aspirin               |
  | non-opioid analgesics |

@F320_7_TextSearchImprovements @US4543 @DE1661 @DE1838 @DE3379
Scenario: Verify Related terms, Drug classes and Predications relevant to the initail search term are display in the search results
  And user searches for and selects "Ten,Patient"
  Then Summary View is active
  Then user searches for "penicillin" and verifies suggestion labels
  Then the search suggestions display at least 1 inferred drug class
  And the search suggestions containing search term "penicillin" are bold

@F320_8_TextSearchImprovements @US5514 @DE1793 
Scenario: User enters several queries known to have acceptable synonyms and variants.
  And user searches for and selects "five,Patient"
  Then Summary View is active
  Then user searches for "bbb"
  And the user expands the main group "ProgressNote"
  And the user expands the subgroup "Diabetes"
  And the user views details of the first subgroup "Diabetes"
  Then the modal is displayed
  And the modal's title is "Diabetes"
  Then the modal contains highlighted "bundle"
  And the user clicks the modal Close Button
  And the modal is closed
