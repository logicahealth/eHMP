@F295_encounters_gist @regression
Feature: F295 - Encounters Applet

Background:
  Given user searches for and selects "Sixhundred,Patient"
  And Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker

@F295_encounterGist_quick_view_visits @F295-4.1 @F295-4.2 @F295-4.3 @F295-4.4 @F295-4.5 @F295-4.6 @US4154 @US5126
Scenario: Encounters Applet Gist - quick view of Visits
  When user hovers over and selects the right side of the "Visits" tile
  And quick view table with title "Recent Visits" appears
  And the "Encounters Gist Quick View - Visits" table contains headers
    | Date | Appt Status | Clinic Name | Provider	| Facility	|
  And the Encounters Gist Quick View - Recent "Visits" table contains rows
#  When user hovers over and selects the right side of the "Visits" tile
  And the user expands "Visits" in Encounters Gist Applet
  Then Quick View draw box for "Visits" closes

@F295_encounterGist_multioption_menu_quick_view @F295-4.7 @F295-4.8 @F295-14.1 @F295-14.2 @F295-14.3 @F295-14.4 @F295-14.5 @F295-14.5 @F295-14.6 @F295-14.7 @F295-14.8 @US4154 @US5126 @future @rework
Scenario: Encounters Applet Gist - quick view of Visit Type thro' multi option menu
  When the user expands "Visits" in Encounters Gist Applet
  And user clicks on the "Left" hand side of the "Visit Type" "GENERAL INTERNAL MEDICINE"
  And a Menu appears on the Encounters Gist
  And user select the menu "Quick View Icon" in Encounters Gist
  And the "Encounters Gist Quick View - Visit Type" table contains headers
    | Date | Appt status | Location | Provider | Facility |
  And the Encounters Gist Quick View - "Visits" Type table contains rows
#  When user select the menu "Quick View Icon" in Encounters Gist
  And the user expands "Visits" in Encounters Gist Applet
  Then Quick View draw box for "Visit Type" closes

@F295_visit_quick_view @F295-14.1 @F295-14.2 @F295-14.3 @F295-14.4 @F295-14.5 @F295-14.6 @F295-14.7 @F295-14.8 @US4154 @US5126 @DE1388 @rework
Scenario: Encounters Applet Gist - quick view of Visit Type by right clicking
  When the user expands "Visits" in Encounters Gist Applet
  And user clicks on the "Right" hand side of the "Visit Type" "GENERAL INTERNAL MEDICINE"
  And the "Encounters Gist Quick View - Visit Type" table contains headers
    | Date | Appt status | Location | Provider | Facility |
  And the Encounters Gist Quick View - "Visits" Type table contains rows
#	When user clicks on the "Right" hand side of the "Visit Type" "GENERAL INTERNAL MEDICINE"
  And the user expands "Visits" in Encounters Gist Applet
  Then Quick View draw box for "Visit Type" closes