@F353 @regression @triage
Feature: F353 - stacked graphs

@US6312 @debug @DE3444
Scenario: Stacked Graph has a quick view button
	Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	And Default Screen is active
	When the user navigates to the Diabetes Mellitus CBW
	And the applets are displayed on the Diabetes Mellitus CBW
      | applet                 |
      | CONDITIONS             |
      | STACKED GRAPHS         |
      | APPOINTMENTS & VISITS  |
      | CLINICAL REMINDERS     |
      | MEDICATIONS REVIEW     |
      | TIMELINE               |
      | ORDERS                 |
      | DOCUMENTS              |
      | VISTA HEALTH SUMMARIES |
	Then the Stacked Graphs applet displays at least 1 row
	When the user selects the first row in the Stacked Graph applet
	Then a toolbar displays with a quick view icon
	When the user selects the Stacked Graphs quick view icon
	Then a Stacked Graph quick view table is displayed

@US4503
Scenario: Create Stacked Graph Container
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Overview is active
  And the user clicks the "Workspace Manager"
  Then the user deletes all user defined workspaces
  When the user clicks "Plus Button"
  And the user clicks "Customize"
  When the user adds an expanded Stacked Graphs applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the User Defined Workspace 1 is active
  And the applets are displayed are
      | applet                 |
      | STACKED GRAPHS         |
