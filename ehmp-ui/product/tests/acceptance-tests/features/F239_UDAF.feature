@F239_UDAF @regression @triage
Feature: F239 - User-Defined Applet Filters

Background:
  #Given user is logged into eHMP-UI
  And user searches for and selects "eight,patient"
  Then Overview is active
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  Given the user creates a user defined workspace named "udaffilter"
  When the user customizes the "udaffilter" workspace
  And the user adds an summary "lab_results_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "UDAFFILTER" screen is active
  And the active screen displays 1 applets
  Then the applet "1" grid loads without issue
  And the user has selected All within the global date picker

@F239_1 @DE4722 @US13456
Scenario: Verify elements for UDAF are displayed
  Given the Numeric Lab Results Applet displays at least 1 row of data
  When the user clicks the Numeric Lab Results Applet Filter button 
  And the Numeric Lab Results Applet Text Filter is displayed
  And the user filters applet "1" grid by text "SERUM"
  Then a udaf tag is displayed for term "SERUM"
  And a udaf remove all button is displayed
  And a udaf filter name input box is displayed
  And the Numeric Lab Results applet header indicates the applet is filtered


@F239_2 @DE4794
Scenario: Verify within the same applet, multiple text filter words, separated by a space, can be added at one time 
  Given the Numeric Lab Results Applet displays at least 1 row of data
  When the user clicks the Numeric Lab Results Applet Filter button 
  And the Numeric Lab Results Applet Text Filter is displayed 
  And the user filters applet "1" grid by text "Hemoglobin SERUM"
  Then a udaf tag is displayed for term "Hemoglobin"
  And a udaf tag is displayed for term "SERUM"

@F239_3 @US5353 @TC103_1 @DE4722 @US13456
Scenario: Verify user can rename UDAF
  Given the Numeric Lab Results Applet displays at least 1 row of data
  When the user clicks the Numeric Lab Results Applet Filter button 
  And the Numeric Lab Results Applet Text Filter is displayed
  And the user filters applet "1" grid by text "SERUM"
  Then a udaf filter name input box is displayed
  And the user renames the filter to "SERUM FILTER"
  And the Numeric Lab Results Filter Title is "SERUM FILTER"


@F239_3 @US5353 @TC103_2 @DE4156 @DE4722
Scenario: Verify user can rename UDAF
  Given the Numeric Lab Results Applet displays at least 1 row of data
  When the user clicks the Numeric Lab Results Applet Filter button 
  Then the Numeric Lab Results Applet Text Filter is displayed
  When the user filters applet "1" grid by text "SERUM"
  And a udaf filter name input box is displayed
  When the user renames the filter to "SERUM FILTER"
  Then the Numeric Lab Results Filter Title is "SERUM FILTER"
  When user navigates to Timeline Applet
  And the user navigates to "#/patient/udaffilter" 
  Then the "UDAFFILTER" screen is active
  And the Numeric Lab Results Filter Title is "SERUM FILTER"
  When the user clicks the Numeric Lab Results Applet Filter button 
  Then the Numeric Lab Results Applet Text Filter is displayed 
  And a udaf tag is displayed for term "SERUM"

@F239_4 @DE4794
Scenario: Verify user can remove single UDAF
  Given the Numeric Lab Results Applet displays at least 1 row of data
  When the user clicks the Numeric Lab Results Applet Filter button 
  Then the Numeric Lab Results Applet Text Filter is displayed 
  When the user filters applet "1" grid by text "Hemoglobin SERUM"
  Then a udaf tag is displayed for term "Hemoglobin"
  And a udaf tag is displayed for term "SERUM"
  When the user removes the udaf tag for term "Hemoglobin"
  Then a udaf tag is displayed for term "SERUM"
  And a udaf tag is not displayed for term "Hemoglobin"

@F239_5 @DE4794
Scenario: Verify user can remove all UDAF
  Given the Numeric Lab Results Applet displays at least 1 row of data
  When the user clicks the Numeric Lab Results Applet Filter button 
  Then the Numeric Lab Results Applet Text Filter is displayed 
  When the user filters applet "1" grid by text "Hemoglobin SERUM"
  Then a udaf tag is displayed for term "Hemoglobin"
  And a udaf tag is displayed for term "SERUM"
  When the user removes all udaf tags
  And a udaf tag is not displayed for term "Hemoglobin"
  And a udaf tag is not displayed for term "SERUM"
  
  

