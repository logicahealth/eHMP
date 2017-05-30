@F1213 @reg1
Feature: Enhance Patient Record Search Usability

#Team Application
  
@f1213_text_search_clear @US17883 
Scenario: Clear search text from PRS text box
  Given user searches for and selects "EIGHT,PATIENT"
  When user searches for "glucose"
  Then text search results are grouped
  And user navigates to Documents Screen
  And the Documents Applet grid is loaded
  And the PRS text box is cleared
 
@f1213_close_PRS_result @US17882 
Scenario: Close PRS results view
  Given user searches for and selects "BCMA,EIGHT"
  And Summary View is active
  And user navigates to Documents Screen
  When user searches for "bmi"
  Then the Search Results header displays statement in format Displaying number of result for searched term
  And user selects the close icon in serach record workspace
  Then the Documents Expanded applet is displayed