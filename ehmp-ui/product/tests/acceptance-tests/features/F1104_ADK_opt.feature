@F1104 @regression @triage
Feature: ADK Optimization - Create Summary workspace

@US15919 @US15919_screen
Scenario: User views the Summary screen
  Given user searches for and selects "BCMA,Eight"
  Then the Summary View is active by default

@US15919 @US15919_screen @base
Scenario: User views the Summary screen
  Given user searches for and selects "BCMA,Eight"
  Then Summary View is active
  And the "Tasks" ("todo_list") summary applet is displayed
  And the "Problems" ("problems") trend applet is displayed
  And the "Allergies" ("allergy_grid") trend applet is displayed
  And the "Documents" ("documents") summary applet is displayed
  And the "Numeric Lab Results" ("lab_results_grid") trend applet is displayed
  And the "Narrative Lab Results" ("narrative_lab_results_grid") summary applet is displayed
  And the "Active & Recent Meds" ("activeMeds") trend applet is displayed
  And the "Activities" ("activities") expanded applet is displayed
  And the "Stacked Graphs" ("stackedGraph") expanded applet is displayed
  And the "Appointment & Visits" ("appointments") summary applet is displayed
  And the Stacked Graphs applet displays a row for "Blood Pressure Systolic"
  And the Stacked Graphs applet displays a row for "Creatinine"

@US15919 @US15919_nav
Scenario: Users will be able to see Summary option in coversheet for screen selection
	And user searches for and selects "Eight,Patient"
	Then Cover Sheet is active
	When the user clicks the "CoversheetDropdown Button"
	Then the CoversheetDropdown table contains headers
	| headers |
	| Summary |

@US6295 @US15919 @summary_pre
Scenario: visual Indicator for locked workspaces
	And user searches for and selects "Eight,Patient"
    Then Overview is active
    When the user clicks the Workspace Manager
    And the Workspace Manager is displayed
    And the predefined screens have a visual indicator indicating they are locked
    | screen  |
    | Summary |
