@F144 @DE1757 @regression @triage
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

	And the Narrative Lab Results applet contains buttons
	    | buttons  |
	    | Refresh  |
	    | Help     |
	    | Filter Toggle   |
	    | Minimize View |
	And the Narrative Lab Results expanded contains headers
       | Headers     |
       | Date | 
       | Description |
       | Type |
       | Author or Verifier |
       |Facility |
    And Narrative Lab Results applet loads without issue

# non numeric labs were removed from numeric lab results and put in narrative lab results
@US2467 @TA7888 @modal_test @DE2903 @DE2969 @DE3334 @DE4032 @DE4051 @DE4554
Scenario: Narrative Lab Results Modal - no Lab History graph is displayed for non-numerical result types.
  Given user navigates to expanded Narrative Lab Results Applet
  And Narrative Lab Results applet loads without issue
  And the user clicks the date control "All" in the "Narrative Lab Results applet"
  And Narrative Lab Results applet loads without issue
  And the Narrative Lab results applet displays at least 1 row
  When the user views the first narrative lab result in a modal
  Then the modal is displayed
  And the modal's title is "pathology report"
  And the "Lab Graph" should be "Hidden" in the "Numeric Lab Results modal"
 



