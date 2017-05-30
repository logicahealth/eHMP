@F144_narrative_labs @DE1757 @reg1 
Feature: Narrative Lab Results


Background:
    Given user searches for and selects "Bcma,Eight"
    And Default Screen is active
 
@DE1757_view
Scenario: User views the Narrative Lab Results  
  Given the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  And the user creates a user defined workspace named "narrative"
  And the user customizes the "narrative" workspace
  And the user adds an summary "narrative_lab_results_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  And the "NARRATIVE" screen is active
  When the user expands/maximizes the Narrative Lab Results applet
  And Narrative Lab Results applet loads without issue
	Then the narrative lab results applet title is "NARRATIVE LAB RESULTS"

	And the Narrative Lab Results applet contains buttons Refresh, Help, Filter Toggle and Minimize
	And the Narrative Lab Results expanded contains headers
       | Headers     |
       | Date | 
       | Description |
       | Type |
       | Author/Verifier |
       |Facility |
    And Narrative Lab Results applet loads without issue

# non numeric labs were removed from numeric lab results and put in narrative lab results
@US2467 @TA7888 @narrative_modal_test @DE2903 @DE2969 @DE3334 @DE4032 @DE4051 @DE4554 @DE6755
Scenario: Narrative Lab Results Modal - no Lab History graph is displayed for non-numerical result types.
  Given user navigates to expanded Narrative Lab Results Applet
  And Narrative Lab Results applet loads without issue
  And the user clicks the date control "All" in the "Narrative Lab Results applet"
  And Narrative Lab Results applet loads without issue
  And the Narrative Lab results applet displays at least 1 row
  When the user views the first narrative lab result in a modal
  Then the modal is displayed
  And the modal's title is "Pathology - [A] =bronch wash {1. PLEURAL FLUID}, [A] frozen =BONE MARROW {1. BONE MARROW}"
  And the "Lab Graph" should be "Hidden" in the "Numeric Lab Results modal"
 
@f144_narrative_labs_filter
Scenario: User is able to filter Narrative lab result applet 
  And the user changes the global date filter to All
  When user navigates to Narrative Lab Results Applet expanded view
  And user filters the Narrative Lab Results expand view applet by text "pathology"
  Then Narrative Lab Results expand view applet table only displays rows including text "pathology"
  
@f144_narrative_labs_sorting
Scenario: User is able to sort Narrative lab result applet 
  And the user changes the global date filter to All
  When user navigates to Narrative Lab Results Applet expanded view
  And the user sorts the Narrative Lab Results expand view applet by column Description
  Then the Narrative Lab Results applet exapnd view applet is sorted in alphabetic order based on Description
  And the user sorts the Narrative Lab Results expand view applet by column Description
  Then the Narrative Lab Results applet expand view applet is sorted in reverse alphabetic order based on Description

@f144_narrative_labs_detail_view @DE6776
Scenario: User is able to view details of Narrative lab result applet 
  And the user changes the global date filter to All
  When user navigates to Narrative Lab Results Applet expanded view
  And the user views the details of the first Narrative Lab Results 
  Then the detail modal is displayed
  And the Narrative Lab Results Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time       | 