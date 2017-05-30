@F1135 @reg1 @US17147 @TC7133 
Feature: Improve Document applet data load performance with Serverside Pagination

Background:
  Given browser size is "1280" by "800"
  Given user searches for and selects "Fortysix,Patient"

@F1135_filter_4
Scenario:  UDW Document filter persists when user logs out / logs back in
  Given Summary View is active
  And the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  And the user creates a user defined workspace named "documentsfilter1"
  And the user customizes the "documentsfilter1" workspace
  And the user adds an summary "documents" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  And the "DOCUMENTSFILTER1" screen is active
  And the active screen displays 1 applets
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user has filtered the Documents Applet on text "Pathology,One"
  And the Documents Applet title indicates a filter is applied

  When the user logs out and then logs back in
  And user searches for, selects "Fortysix,Patient" and chooses to resume most recent workspace
  And the "DOCUMENTSFILTER1" screen is active
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded

  Then the Documents Applet filter field is displayed
  And the Documents Applet title indicates a filter is applied
  And the Documents Applet displays filter pill "Pathology,One"
  And the Documents table only diplays rows including text "Pathology,One"