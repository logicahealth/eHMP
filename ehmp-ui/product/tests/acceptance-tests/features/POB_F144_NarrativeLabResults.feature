#@F144 @DE1757 @regression @triage
@future
Feature: Narrative Lab Results

# non numeric labs were removed from numeric lab results and put in narrative lab results
@f144_narrative_lab_results_modal_non_numeric_no_graph @US2467 @TA7888 @modal_test @DE2903 @DE2969
Scenario: Narrative Lab Results Modal - no Lab History graph is displayed for non-numerical result types.
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB Overview is active
  And POB the "Numeric Lab Results" Overview applet is displayed
  And POB the user clicks the Numeric Lab Results Expand Button
  And POB Narrative Lab results applet loaded successfully
  And POB the user clicks the date control All in the Narrative Lab Results applet
  And POB the user click on any lab test result
  Then POB verify lab results modal is displayed
  Then POB verify user can close the lab results modal

