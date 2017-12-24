@F352   @DE6991 @DE6976 @reg1 
Feature: Tile Sorting

Background:
  Given user searches for and selects "Nineteen,Patient"
  And Overview is active
  And the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  #And the user creates a user defined workspace named "tilesort"
  

@US4513 @TC246
Scenario: Complete drag-drop in-applet sorting for Conditions
  Given the user creates and views a udw with a trend "problems" applet

  And Problems trend view has data rows
  And the Problems applet starts without Manual Sort
  And the user notes the order of the problems in the Problems Gist
  
  When the user clicks the last row in the problems applet
  Then the toolbar displays with a Tile Sort button

  When the user moves the problem row to the top of the applet
  Then the Problems applet reports Manual sort

  When user refreshes Problems Applet
  Then problems gist is loaded successfully
  And the Problems applet reports Manual sort
  And Problem column is sorted in manual order in Problems Gist

  When user clicks on the column header "Problem" in Problems Gist
  Then Problem column is sorted in default order in Problems Gist

  When user clicks on the column header "Problem" in Problems Gist
  Then Problem column is sorted in ascending order in Problems Gist

  When user clicks on the column header "Problem" in Problems Gist
  Then Problem column is sorted in descending order in Problems Gist

  When user clicks on the column header "Problem" in Problems Gist
  Then Problem column is sorted in manual order in Problems Gist

  When user clicks on the column header "Problem" in Problems Gist
  Then Problem column is sorted in default order in Problems Gist

@DE5953 @DE5953_problems
Scenario: User can clear a manual sort on the problems applet
  # Given the user customizes the "tilesort" workspace
  # And the user adds an trend "problems" applet to the user defined workspace
  # And the user selects done to complete customizing the user defined workspace
  # And the "TILESORT" screen is active
  Given the user creates and views a udw with a trend "problems" applet
  And Problems trend view has data rows
  And the Problems applet starts without Manual Sort
  And the user notes the order of the problems in the Problems Gist
  
  When the user clicks the last row in the problems applet
  Then the toolbar displays with a Tile Sort button

  When the user moves the problem row to the top of the applet
  Then the Problems applet reports Manual sort

  When the user clicks Manual sort to remove it
  Then the Problems applet does not report Manual sort
  And Problem column is sorted in default order in Problems Gist


@US5794 @TC248 
Scenario: Complete drag-drop in-applet sorting for Lab Results
  # Given the user customizes the "tilesort" workspace
  # And the user adds an trend "lab_results_grid" applet to the user defined workspace
  # And the user selects done to complete customizing the user defined workspace
  # And the "TILESORT" screen is active
  And the user creates and views a udw with a trend "lab_results_grid" applet

  And the user has selected All within the global date picker
  And the Numeric Lab Results Gist applet displays data
  And the Numeric Lab Results applet starts without Manual Sort
  And the user notes the order of the numeric lab results in the Numeric Lab Results Gist

  When the user clicks the first row in the Numeric Lab Results Gist applet
  Then the toolbar displays with a Tile Sort button

  When the user moves the numeric lab gist row to the bottom of the applet
  Then the Numeric Lab Results applet reports Manual sort

  When user refreshes Numeric Lab Result Gist Applet
  Then the Numeric Lab Results Gist applet displays data
  And the Numeric Lab Results applet reports Manual sort
  And Lab Test column is sorted in manual order in Numeric Lab Results Gist

  When user clicks on the column header Lab Test in Numeric Lab Results Gist
  Then Lab Test column is sorted in default order in Numeric Lab Results Gist

  When user clicks on the column header Lab Test in Numeric Lab Results Gist
  Then Lab Test column is sorted in ascending order in Numeric Lab Results Gist

  When user clicks on the column header Lab Test in Numeric Lab Results Gist
  Then Lab Test column is sorted in descending order in Numeric Lab Results Gist

  When user clicks on the column header Lab Test in Numeric Lab Results Gist
  Then Lab Test column is sorted in manual order in Numeric Lab Results Gist

  When user clicks on the column header Lab Test in Numeric Lab Results Gist
  Then Lab Test column is sorted in default order in Numeric Lab Results Gist


@DE5953 @DE5953_lab
Scenario: User can clear a manual sort on the lab results applet
  Given the user creates and views a udw with a trend "lab_results_grid" applet

  And the user has selected All within the global date picker
  And the Numeric Lab Results Gist applet displays data
  And the Numeric Lab Results applet starts without Manual Sort
  And the user notes the order of the numeric lab results in the Numeric Lab Results Gist

  When the user clicks the first row in the Numeric Lab Results Gist applet
  Then the toolbar displays with a Tile Sort button

  When the user moves the numeric lab gist row to the bottom of the applet
  Then the Numeric Lab Results applet reports Manual sort

  When the user clicks Manual sort to remove it
  Then the Numeric Lab Results applet does not report Manual sort
  Then Lab Test column is sorted in default order in Numeric Lab Results Gist


@US5819 @TC249 @DE6064
Scenario: Complete drag-drop in-applet sorting for Vitals
  And the user creates and views a udw with a trend "vitals" applet

  And the Vitals Gist applet starts without Manual Sort
  And the user has selected All within the global date picker
  And the Vitals Gist Applet contains data rows
  And the user notes the order of the vitals in the Vitals Gist

  When the user clicks the first row in the Vitals Gist applet
  Then the toolbar displays with a Tile Sort button

  When the user moves the vital gist row to the bottom of the applet
  Then the Vitals Gist applet reports Manual sort

  When user refreshes Vitals Gist Applet
  Then the Vitals Gist Applet contains data rows
  And the Vitals Gist applet reports Manual sort
  And Vital Type column is sorted in manual order in Vitals Gist

  When the user sorts the Vitals Gist grid by "Type"
  Then the Vitals gist is sorted in default order

  When the user sorts the Vitals Gist grid by "Type"
  Then the Vitals gist is sorted in alphabetic order based on Type

  When the user sorts the Vitals Gist grid by "Type"
  Then the Vitals gist is sorted in reverse alphabetic order based on Type

  When the user sorts the Vitals Gist grid by "Type"
  Then Vital Type column is sorted in manual order in Vitals Gist

  When the user sorts the Vitals Gist grid by "Type"
  Then the Vitals gist is sorted in default order

@DE5953 @DE5953_vitals
Scenario: User can clear a manual sort on the vitals applet
  And the user creates and views a udw with a trend "vitals" applet

  And the Vitals Gist applet starts without Manual Sort
  And the user has selected All within the global date picker
  And the Vitals Gist Applet contains data rows
  And the user notes the order of the vitals in the Vitals Gist

  When the user clicks the first row in the Vitals Gist applet
  Then the toolbar displays with a Tile Sort button

  When the user moves the vital gist row to the bottom of the applet
  Then the Vitals Gist applet reports Manual sort

  When the user clicks Manual sort to remove it
  Then the Vitals applet does not report Manual sort
  Then the Vitals gist is sorted in default order
