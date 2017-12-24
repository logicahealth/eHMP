@documents_NoData @regression @documents_applet @reg4
Feature: F144 - eHMP Viewer GUI - Documents

@f144_documents_navigation_thro_dropdown @US1914
Scenario: User can navigate to Documents applet through the menu dropdown
  Given user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  And Overview is active
  When user selects Documents from Coversheet dropdown
  Then "Documents" is active
  And title of the Documents Applet says "Documents"
  And the Documents Applet grid is loaded

@f144_documents_default_display_gdf_all @US1914 @DE3038
Scenario: Procedure, Surgery, Imaging, Discharge Summary, Advance Directive and Consult report are displayed in document applet
  Given user searches for and selects "NINETYNINE,PATIENT"
  And user navigates to Documents Screen
  And "Documents" is active

  When the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  Then the Documents Applet table contains headers
      | Headers     |
      | Date        |
      | Description |
      | Type        |
      | Author/Verifier |
      | Facility    |
  Then the Docuemnts table diplays Type "Consult" rows
  Then the Docuemnts table diplays Type "Imaging" rows
  Then the Docuemnts table diplays Type "Procedure" rows
  Then the Docuemnts table diplays Type "Surgery" rows
  Then the Docuemnts table diplays Type "Advance Directive" rows
  Then the Docuemnts table diplays Type "Discharge Summary" rows
  Then the Docuemnts table diplays Type "Progress Note" rows

@f144_documents_filter @F1135 @TC7133
Scenario: Documents applet is able to filter data based on search
  Given user searches for and selects "Fortysix,Patient"
  And the user has selected All within the global date picker
  And user navigates to Documents Screen
  And the user scrolls the Documents Applet
  And the user opens the text search filter in Documents Applet
  When the user filters the Document Applet by text "Surgery"
  Then the Documents table only diplays rows including text "Surgery"

@f144_documents_filter1 @F1135 @TC7133
Scenario: Documents applet is able to filter data based on search
  Given user searches for and selects "Ten,Patient"
  And the user has selected All within the global date picker
  And user navigates to Documents Screen
  # Don't start with a scroll 
  And the user opens the text search filter in Documents Applet
  When the user filters the Document Applet by text "Surgery"
  Then the Documents table only diplays rows including text "Surgery"

@f144_documents_sorting_by_type @US2684 @DE3038 @DE3844 @F1135
Scenario: Documents applet displays sorting by Type correctly
  # Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  When the user scrolls the Documents Applet
  And the user sorts the Documents grid by Type
   When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "alphabetic" order based on "Type"
  And the user sorts the Documents grid by Type
   When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Type"
  And the user sorts the Documents grid by Type
  When the user scrolls the Documents Applet
  And the default sorting by Date/Time is in descending in Documents Applet

@f144_documents_sorting_by_facility  @US2684 @DE3038 @DE3844 @F1135
Scenario: Documents applet displays sorting by Facility correctly
  # Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  When the user scrolls the Documents Applet
  And the user sorts the Documents grid by Facility
  When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "alphabetic" order based on "Facility"
  And the user sorts the Documents grid by Facility
  When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Facility"
  And the user sorts the Documents grid by Facility
  When the user scrolls the Documents Applet
  And the default sorting by Date/Time is in descending in Documents Applet

@f144_documents_sorting_by_author @US2684 @DE3038 @DE3844 @future @F1135
Scenario: Documents applet displays sorting by Author correctly
  # Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  When the user scrolls the Documents Applet
  And the user sorts the Documents grid by Author
  When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "alphabetic" order based on "Author"
  And the user sorts the Documents grid by Author
  When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Author"
  And the user sorts the Documents grid by Author
  When the user scrolls the Documents Applet
  And the default sorting by Date/Time is in descending in Documents Applet

@f144_documents_sorting_by_desc  @US2684 @DE3038 @DE3844 @future @F1135
Scenario: Documents applet displays sorting by Description correctly
  # Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  When the user scrolls the Documents Applet
  And the user sorts the Documents grid by Description
  When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "alphabetic" order based on "Description"
  And the user sorts the Documents grid by Description
  When the user scrolls the Documents Applet
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Description"
  And the user sorts the Documents grid by Description
  When the user scrolls the Documents Applet
  And the default sorting by Date/Time is in descending in Documents Applet

@f144_documents_refresh
Scenario: Documents applet displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,Patient"
  When user navigates to Documents Screen
  And the user has selected All within the global date picker
  And the Documents Applet table contains data rows
  When user refreshes Documents Applet
  Then the message on the Documents Applet does not say "An error has occurred"
