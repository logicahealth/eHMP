@documents_NoData @regression @triage
Feature: F144 - eHMP Viewer GUI - Documents

@f144_documents_navigation_thro_dropdwon @US1914
Scenario: progress notes, clinical procedure and discharge summary are displayed in document applet
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  And Overview is active
  When user selects Documents from Coversheet dropdown
  Then "Documents" is active
  Then title of the Documents Applet says "Documents"
  Then the search results say "No Records Found" in Documents Applet
  
@f144_documents_default_display_gdf_all @US1914 @DE3038
Scenario: Procedure, Surgery, Imaging, Discharge Summary, Advance Directive and Consult report are displayed in document applet
  Given user is logged into eHMP-UI
  And user searches for and selects "NINETYNINE,PATIENT"
  When user navigates to Documents Applet
  Then "Documents" is active
  Then title of the Documents Applet says "Documents"
  Then the search results say "No Records Found" in Documents Applet
  And the user has selected All within the global date picker
  Then the Documents Applet table contains headers
      | Headers nos | Headers     |
      | Header1     | Date        |
      | Header2     | Description |
      | Header3     | Type        |
      | Header4     | Author or Verifier  |
      | Header5     | Facility    |
  Then the Docuemnts table diplays Type "Consult" rows
  Then the Docuemnts table diplays Type "Imaging" rows 
  Then the Docuemnts table diplays Type "Procedure" rows 
  Then the Docuemnts table diplays Type "Surgery" rows 
  Then the Docuemnts table diplays Type "Advance Directive" rows 
  Then the Docuemnts table diplays Type "Discharge Summary" rows 
  Then the Docuemnts table diplays Type "Progress Note" rows
  
@f144_documents_filter 
Scenario: Documents applet is able to filter data based on search
  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  And the user clicks on search filter in Documents Applet
  And the user filters the Document Applet by text "Surgery"
  Then the Documents table only diplays rows including text "Surgery"
  
@f144_documents_sorting_by_type @US2684 @DE3038 @debug @DE3844
Scenario: Documents applet displays sorting by Type correctly
  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  And the user sorts the Documents grid by "Type" 
  Then the Documents grid is sorted in "alphabetic" order based on "Type"
  And the user sorts the Documents grid by "Type" 
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Type"
  And the user sorts the Documents grid by "Type" 
  And the default sorting by Date/Time is in descending in Documents Applet 
  
@f144_documents_sorting_by_facility  @US2684 @DE3038 @debug @DE3844
Scenario: Documents applet displays sorting by Facility correctly

  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  And the user sorts the Documents grid by "Facility" 
  Then the Documents grid is sorted in "alphabetic" order based on "Facility"
  And the user sorts the Documents grid by "Facility"
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Facility"
  And the user sorts the Documents grid by "Facility"
  And the default sorting by Date/Time is in descending in Documents Applet
  
@f144_documents_sorting_by_author  @US2684 @DE3038 @debug @DE3844
Scenario: Documents applet displays sorting by Author correctly

  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  And the user sorts the Documents grid by "Author" 
  Then the Documents grid is sorted in "alphabetic" order based on "Author"
  And the user sorts the Documents grid by "Author"
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Author"
  And the user sorts the Documents grid by "Author"
  And the default sorting by Date/Time is in descending in Documents Applet

@f144_documents_sorting_by_desc  @US2684 @DE3038 @debug @DE3844
Scenario: Documents applet displays sorting by Description correctly

  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  And the user sorts the Documents grid by "Description" 
  Then the Documents grid is sorted in "alphabetic" order based on "Description"
  And the user sorts the Documents grid by "Description"
  Then the Documents grid is sorted in "reverse alphabetic" order based on "Description"
  And the user sorts the Documents grid by "Description"
  And the default sorting by Date/Time is in descending in Documents Applet
  
  
@f144_documents_refresh 
Scenario: Documents applet displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,Patient"
  When user navigates to Documents Applet
  And the user has selected All within the global date picker
  And the Documents Applet table contains data rows
  When user refreshes Documents Applet
  Then the message on the Documents Applet does not say "An error has occurred"
