@F144 @F144_numericlabresults @regression @triage @DE4084
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

Background:
  # Given user is logged into eHMP-UI
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  And user navigates to expanded Numeric Lab Results Applet
  And Numeric Lab Results applet loads without issue
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  And Numeric Lab Results applet loads without issue

@F144_numericlabresults_5 @data_specific
Scenario: DE250: Verify panels are seperated by facilities. ( Panels with same name but from different facilities are not grouped together )
  Given the user is viewing the expanded Numeric Lab Results Applet
  When the user scrolls to the bottom of the Numeric Lab Results Applet
  And Numeric Lab Results applet loads without issue
  Then the user verifies panels are seperated by facilities

@F144_numericlabresults_6 @data_specific @US5709
Scenario: User can filter Expanded Numeric Lab results applet by LOINC
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  And Numeric Lab Results applet loads without issue
  # LOINC CODE 736-9, 	Lymphocytes/​100 leukocytes in Blood by Automated count
  # http://s.details.loinc.org/LOINC/736-9.html?sections=Comprehensive
  When the user filters the Expanded Numeric Lab results by text "736-9"
  Then the Expanded Numeric Lab results table only diplays rows including text "Lymphocytes/100 Leukocytes"


@F144_numericlabresults_10 @US2481 @TA7508 
Scenario: User can hide the filter
  Given the user is viewing the expanded Numeric Lab Results Applet
  Then the Numeric Lab Results Applet Text Filter is displayed 
  When the user clicks the Numeric Lab Results Applet Filter button 
  Then the Numeric Lab Results Applet Text Filter is not displayed 
  And the Numeric Lab Results Applet Date Filter is not displayed

@F144_numericlabresults_11 
Scenario: Verify the table correctly reports when filter produces no results
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  And Numeric Lab Results applet loads without issue
  When the user filters the Expanded Numeric Lab results by text "noResults"
  Then the Numeric Lab Results applet displays empty record message
  
