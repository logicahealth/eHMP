@F236_OnLineHelp  @reg2

Feature: F236 - OnLineHelp
#"As an an eHMP user, I need to be able to click on help icons in strategic areas in he eHMP UI in order to display contextual help information and create PDF documents;  so that I can access and print PDF documents of help content."

@F236_1_OnLineHelp_search_page @US4520 @DE1591 @F236-1.1  @DE2668
Scenario: Verify if OnLineHelp icons are present
  And the patient search screen is displayed
  Then the On-line Help icon is present on Patient Search page