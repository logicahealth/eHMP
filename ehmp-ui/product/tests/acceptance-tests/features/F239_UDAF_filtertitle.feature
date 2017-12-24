@F239_UDAF   @DE6991 @DE6976 @reg4 
Feature: F239 - User-Defined Applet Filters

Background:
  #Given user is logged into eHMP-UI
  And user searches for and selects "eight,patient"
  Then Overview is active
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  Given the user creates a unique user defined workspace 
  When the user customizes the unique workspace
  And the user adds an summary "lab_results_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the unique screen is active
  And the active screen displays 1 applets
  Then the applet "1" grid loads without issue

  And the user has selected All within the global date picker

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
  And the user navigates to the unique workspace
  Then the unique screen is active
  And the applet "1" grid loads without issue
  And the Numeric Lab Results Filter Title is "SERUM FILTER"  
  When the user opens applet "1" Filter section
  Then a udaf tag is displayed for term "SERUM"