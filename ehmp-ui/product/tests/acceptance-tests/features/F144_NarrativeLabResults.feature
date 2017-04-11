@F144 @DE1757 @regression @triage
Feature: Narrative Lab Results


Background:
  Given user is logged into eHMP-UI  
  And user searches for and selects "Bcma,Eight"
  Then Default Screen is active
  When user navigates to expanded Narrative Lab Results Applet
  And Narrative Lab Results applet loads without issue

@DE1757_view
Scenario: User views the Narrative Lab Results
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
       | Lab Test | 
       | Flag | 
       | Result |
       | Unit |
       |Ref Range |
       |Facility |
    And Narrative Lab Results applet loads without issue

# non numeric labs were removed from numeric lab results and put in narrative lab results
@f144_narrative_lab_results_modal_non_numeric_no_graph @US2467 @TA7888 @modal_test @DE2903 @DE2969 @debug @DE3334
Scenario: Narrative Lab Results Modal - no Lab History graph is displayed for non-numerical result types.
  When the user clicks the date control "All" in the "Narrative Lab Results applet"
  And Narrative Lab Results applet loads without issue
  And the Narrative Lab results applet displays at least 1 row
  When the user views the first narrative lab result in a modal
  Then the modal is displayed
  And the modal's title is "pathology report Details"
  And the "Lab Graph" should be "Hidden" in the "Numeric Lab Results modal"

