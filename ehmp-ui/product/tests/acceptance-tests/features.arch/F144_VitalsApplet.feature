@f144_vitals @US2800    @DE6991 @DE6976 @reg2

Feature:F144 - eHMP viewer GUI - Vitals

#archived because of F1238, covered under that feature.

@f297_vitals_info_button_integration_overview
Scenario: Verify Vitals applet on overview page has info button toolbar
  When user searches for and selects "eight,patient"
  Then Overview is active
  And the user has selected All within the global date picker
  And vitals gist is loaded successfully
  When user opens the first vitals gist item
  Then vitals info button is displayed
 
@f297_vitals_info_button_integration_expand_view
Scenario: Verify Vitals applet expanded view has info button toolbar
  When user searches for and selects "eight,patient"
  Then Overview is active
  And user navigates to Vitals expanded view 
  And the user clicks the All vitals range
  When user opens the first Vitals row
  Then vitals info button is displayed
