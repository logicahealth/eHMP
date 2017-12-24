@F172 @F339  
Feature: 

Background:
  
  And user searches for and selects "bcma,eight"
  Then Overview is active
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces

@US4330 @TC60_3
Scenario: Verify can add multiple copies of same applet
  And the user creates a user defined workspace named "addapplets"
  When the user customizes the "addapplets" workspace
  And the user adds an summary "allergy_grid" applet to the user defined workspace
  And the user adds an summary "allergy_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "ADDAPPLETS" screen is active
  And the active screen displays 2 applets
  And the applet "1" Allergies summary applet is displayed
  And the applet "2" Allergies summary applet is displayed

@US4330 @TC60_4
Scenario: Verify can add different views of same applet
  And the user creates a user defined workspace named "addapplets"
  When the user customizes the "addapplets" workspace
  And the user adds an trend "allergy_grid" applet to the user defined workspace
  And the user adds an summary "allergy_grid" applet to the user defined workspace
  And the user adds an expanded "allergy_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "ADDAPPLETS" screen is active
  And the active screen displays 3 applets
  Then the applet "1" Allergies Trend applet is displayed
  And the applet "2" Allergies summary applet is displayed
  And the applet "3" Allergies expanded applet is displayed


@US4330 @TC60_5
Scenario: Verify can change view of an existing applet
  And the user creates a user defined workspace named "addapplets"
  When the user customizes the "addapplets" workspace
  And the user adds an trend "allergy_grid" applet to the user defined workspace
  And the user adds an expanded "allergy_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "ADDAPPLETS" screen is active
  And the active screen displays 2 applets
  Then the applet "1" Allergies Trend applet is displayed
  And the applet "2" Allergies expanded applet is displayed
  When the user edits the user defined workspace
  And the user changes applet "1" to a Summary View
  And the user selects done to complete customizing the user defined workspace

  Then the "ADDAPPLETS" screen is active
  And the active screen displays 2 applets
  Then the applet "1" Allergies summary applet is displayed
  And the applet "2" Allergies expanded applet is displayed


@US4330 @TC60_6
Scenario: Verify can remove view of an existing applet
  And the user creates a user defined workspace named "removeapplet"
  When the user customizes the "removeapplet" workspace
  And the user adds an trend "allergy_grid" applet to the user defined workspace
  And the user adds an summary "allergy_grid" applet to the user defined workspace
  And the user adds an expanded "allergy_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "REMOVEAPPLET" screen is active
  And the active screen displays 3 applets
  Then the applet "1" Allergies Trend applet is displayed
  And the applet "2" Allergies summary applet is displayed
  And the applet "3" Allergies expanded applet is displayed
  When the user edits the user defined workspace
  And the user removes applet "2" from workspace
  And the user selects done to complete customizing the user defined workspace
   Then the "REMOVEAPPLET" screen is active
  And the active screen displays 2 applets
  Then the applet "1" Allergies Trend applet is displayed
  And the applet "3" Allergies expanded applet is displayed
  And no Allergy applet with id "2" is displayed

@US5040 @TC71 @TC71_add
Scenario: Verify view displays Trend when adding applet to view
  And the user creates a user defined workspace named "trendnotgist"
  When the user customizes the "trendnotgist" workspace
  And the user adds a "allergy_grid" applet to the user defined workspace
  Then the user is presented with an option for "Trend View"


@US5040 @TC71 @TC71_edit
Scenario: Verify view displays Trend when editing applet view
  Given the user creates a user defined workspace named "trendnotgist"
  And the user customizes the "trendnotgist" workspace
  And the user adds an expanded "allergy_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  And the "TRENDNOTGIST" screen is active
  And the active screen displays 1 applets
  And the applet "1" Allergies expanded applet is displayed
  When the user chooses the option button for applet "1" Allergies applet
  Then the user is presented with an option to edit view to "Trend View"

