@F1135 @documents_applet @reg2
Feature: Improve Document applet data load performance with Serverside Pagination

Background:
  Given browser size is "1280" by "800"

@US17150_docsscreen @TC6635 @test_screensize 
Scenario: User can navigate between different pages with an infinite scroll
  Given user searches for and selects "Fortysix,Patient"
  And user navigates to Documents Screen
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user notes number of rows displayed in the Documents Applet
  When the user scrolls the Documents Applet
  Then rows are added to the Documents Applet
  And the number of rows reported are the number of rows displayed

@US17150_summary @TC6635 
Scenario: User can navigate between different pages with an infinite scroll
  Given user searches for and selects "Fortysix,Patient"
  Then Summary View is active
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user notes number of rows displayed in the Documents Applet
  When the user scrolls the Documents Applet
  Then rows are added to the Documents Applet
  And the number of rows reported are the number of rows displayed

@f144_documents_sorting_by_date 
Scenario: Documents applet displays sorting by Date correctly
  And user searches for and selects "Fortysix,PATIENT"
  When user navigates to Documents Screen
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the default sorting by Date/Time is in descending in Documents Applet
  And the user sorts the Documents grid by Date 
  And the sorting by Date/Time is in ascending in Documents Applet