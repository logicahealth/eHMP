@F1135 @reg2 @US17147 @TC7133 
Feature: Improve Document applet data load performance with Serverside Pagination

Background:
  Given browser size is "1280" by "800"
  Given user searches for and selects "Fortysix,Patient"

@clear_filter1
Scenario: User can clear a filter on Summary Screen
  Given Summary View is active
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"

  When the user clears the Documents applet filter input

  Then the Documents Applet grid is loaded
  And the Documents Applet title does not indicate a filter is applied

@clear_filter2
Scenario: User can clear a single filter on UDW 
  Given user navigates to Documents Screen
  And the Documents Expanded applet is displayed
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"
  And the Documents Applet displays filter 1 pills

  When the user removes the Document applet filter for "Pathology,One"

  Then the Documents Applet grid is loaded
  And the Documents Applet title does not indicate a filter is applied
  And the Documents Applet displays filter 0 pills

@clear_filter3
Scenario: User can clear all filters on UDW 
  Given user navigates to Documents Screen
  And the Documents Expanded applet is displayed
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"
  And the Documents Applet displays filter 1 pills

  When the user removes all filters on Document applet

  Then the Documents Applet grid is loaded
  And the Documents Applet title does not indicate a filter is applied
  And the Documents Applet displays filter 0 pills

@F1135_filter_1
Scenario: Predefined Screen Document filter persists when user leaves / returns to predefined screen
  Given Summary View is active
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"

  When the user has navigated away and then back to Summary view

  Then the Documents Applet title indicates a filter is applied
  And the Documents Applet filter field is displayed
  And the Documents Applet filter field is populated with text "Pathology,One"
  And the Documents table only diplays rows including text "Pathology,One"


@F1135_filter_2
Scenario: Predefined Screen Document filter persists when user expands / minimizes documents applet
  Given Summary View is active
  And the user has selected All within the global date picker
  And Summary View is active
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"

  When the user expands and then minimizes the Documents Applet

  Then the Documents Applet title indicates a filter is applied
  And the Documents Applet filter field is displayed
  And the Documents Applet filter field is populated with text "Pathology,One"
  And the Documents table only diplays rows including text "Pathology,One"

@F1135_filter_5
Scenario: Filters applied to expanded Documents applet should not persist to Summary Screen, but should persist after user returns to expanded Documents applet
# Go to Documents screen - add filter - navigate summary ( no filter on documents ) - expand documents - should have original filter only
  Given user navigates to Documents Screen
  And the Documents Expanded applet is displayed
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"

  When the user navigates to Summary Screen
  Then the Documents Applet title does not indicate a filter is applied
  And the Documents Applet filter field is not displayed

  When user navigates to Documents Screen
  Then the Documents Applet title indicates a filter is applied
  And the Documents Applet filter field is displayed
  And the Documents Applet displays filter pill "Pathology,One"
  And the Documents table only diplays rows including text "Pathology,One"


@F1135_filter_3
Scenario: Predefined Screen Document filter does not persist when user logs out / logs back in
  Given Summary View is active
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"

  When the user logs out and then logs back in
  And user searches for and selects "Fortysix,Patient"
  And Summary View is active
  And the user has selected All within the global date picker

  Then the Documents Applet title does not indicate a filter is applied
  And the Documents Applet filter field is not displayed

@F1135_filter_6
Scenario: UDW with summary document - add 2 filters, should display pills
  Given Summary View is active
  And the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  And the user creates a user defined workspace named "documentsfilter2"
  And the user customizes the "documentsfilter2" workspace
  And the user adds an summary "documents" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  And the "DOCUMENTSFILTER2" screen is active
  And the active screen displays 1 applets
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user opens the text search filter in Documents Applet
  And the user filters the Document Applet by text "Provider Eight"

  And the Documents Applet title indicates a filter is applied
  And the Documents Applet displays filter pill "Provider"
  And the Documents Applet displays filter pill "Eight"

@F1135_filter_7
Scenario: Documents Screen - add 2 filters, should display pills
  Given user navigates to Documents Screen
  And the Documents Expanded applet is displayed
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded

  When the user opens the text search filter in Documents Applet
  And the user filters the Document Applet by text "Provider Eight"

  Then the Documents Applet title indicates a filter is applied
  And the Documents Applet displays filter pill "Provider"
  And the Documents Applet displays filter pill "Eight"

@F1135_filter_8
Scenario: Expanded Documents - add 2 filters, should display pills
  Given Summary View is active
  And the user expands the Documents applet
   And the Documents Expanded applet is displayed
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded

  When the user opens the text search filter in Documents Applet
  And the user filters the Document Applet by text "Provider Eight"

  Then the Documents Applet title indicates a filter is applied
  And the Documents Applet displays filter pill "Provider"
  And the Documents Applet displays filter pill "Eight"

@F1135_filter_9
Scenario: Documents on Summary screen - add 2 filters, should not display pills
  Given Summary View is active
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  When the user opens the text search filter in Documents Applet
  And the user filters the Document Applet by text "Provider Eight"

  Then the Documents Applet title indicates a filter is applied
  And the Documents Applet filter field is displayed
  And the Documents Applet displays filter 0 pills
