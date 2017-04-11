@F172 @F339 @regression @triage
Feature: User Defined Work Spaces - Preview

Background:
  Given user searches for and selects "Eight,Patient"
  Then Overview is active
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces

@UAT_script1 @US5244 @TC141
Scenario: Verify Preview is disabled for newly created user-defined workspaces
  And the user creates a user defined workspace named "firstpreview"
  And the user defined workspace name "firstpreview" is listed
  Then the "firstpreview" preview option is disabled

 @UAT_script2
 Scenario: Verify Preview is enabled for customized user-defined workspaces
  And the user creates a user defined workspace named "secondpreview"
  And the user defined workspace name "secondpreview" is listed
  When the user customizes the "secondpreview" workspace
  And the user adds an trend "activeMeds" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "SECONDPREVIEW" screen is active
  When the user clicks the Workspace Manager
  Then the "secondpreview" preview option is enabled

@UAT_script3
Scenario: Verify Preview displays for customized user-defined workspaces
  And the user creates a user defined workspace named "thirdpreview"
  When the user customizes the "thirdpreview" workspace
  And the user adds an trend "allergy_grid" applet to the user defined workspace
  And the user adds an summary "allergy_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "THIRDPREVIEW" screen is active
  When the user clicks the Workspace Manager
  Then the "thirdpreview" preview option is enabled
  When the user previews the workspace for "thirdpreview"
  Then the preview displays applet "Allergies" of type "Trend"
  And the preview displays applet "Allergies" of type "Summary"

@US5244 @TC141_step7
Scenario: Verify Preview displays workspace name for user defined workspaces
  And the user creates a user defined workspace named "forthpreview"
  When the user customizes the "forthpreview" workspace
  And the user adds an trend "allergy_grid" applet to the user defined workspace
  And the user adds an summary "allergy_grid" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "FORTHPREVIEW" screen is active
  When the user clicks the Workspace Manager
  Then the "forthpreview" preview option is enabled
  When the user previews the workspace for "forthpreview"
  Then the preview title is "forthpreview"

@US5244 @US6172 @TC141_step16
Scenario: Verify Preview displays for pre defined workspaces (using Coversheet)
  When the user previews the workspace for "cover-sheet"
  Then the preview title is "Coversheet"
  Then the preview displays applet "Problems" of type "Summary"
  And the preview displays applet "Vitals" of type "Summary"
  And the preview displays applet "Allergies" of type "Trend"
  And the preview displays applet "Appointments & Visits" of type "Summary"
  And the preview displays applet "Numeric Lab Results" of type "Summary"
  And the preview displays applet "Community Health Summaries" of type "Summary"
  And the preview displays applet "Immunizations" of type "Summary"
  And the preview displays applet "Active & Recent Medications" of type "Summary"
  And the preview displays applet "Orders" of type "Summary"

