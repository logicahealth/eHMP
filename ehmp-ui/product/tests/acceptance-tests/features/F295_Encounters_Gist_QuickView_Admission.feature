@F295_encounters_gist @regression
Feature: F295 - Encounters Applet

Background:
  # Given user is logged into eHMP-UI
  Given user searches for and selects "zzzretiredonenineteen,Patient"
  Then Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker

@F295_encounterGist_quick_view_admissions @F295-5.6 @US4154 @US5126 @DE1388 
Scenario: Encounters Applet Gist - quick view of admissions
  When user hovers over and selects the right side of the "Admissions" tile
  Then quick view table with title "Recent Admissions" appears
  And the "Encounters Gist Quick View - Admissions" table contains headers
    | Date	| Diagnosis | Facility |
  And the Encounters Gist Quick View - Recent "Admissions" table contains rows
	When user hovers over and selects the right side of the "Admissions" tile
	Then Quick View draw box for "Admissions" closes

@F295_diagnosis_quick_view @F295-5.8 @F295-20a1 @F295-20a2 @F295-20a3 @F295-20a4 @F295-20a5 @F295-20a6 @US4154 @US5126 @DE1388
Scenario: Encounters Applet Gist - quick view of a particular Diagnosis 
  	
  When the user expands "Admissions" in Encounters Gist Applet
 	When user clicks on the "Right" hand side of the "Diagnosis" "OBSERVATION"
  Then the "Encounters Gist Quick View - Diagnosis" table contains headers
    | Date	| Location | Facility |
  And the Encounters Gist Quick View - "Admissions" Type table contains rows
	When user clicks on the "Right" hand side of the "Diagnosis" "OBSERVATION"	
	Then Quick View draw box for "Diagnosis" closes

@F295_multioption_menu_admission_quick_view @F295-5.7 @F295-5.8 @US4154 @US5126 
Scenario: Encounters Applet Gist - quick view of a particular admission thro' multi option menu
  	
  When the user expands "Admissions" in Encounters Gist Applet
 	When user clicks on the "Left" hand side of the "Diagnosis" "OBSERVATION"
  Then a Menu appears on the Encounters Gist 
  When user select the menu "Quick View Button" in Encounters Gist
  Then the "Encounters Gist Quick View - Diagnosis" table contains headers
    | Date	| Location | Facility |
  And the Encounters Gist Quick View - "Admissions" Type table contains rows
	When user select the menu "Quick View Button" in Encounters Gist
	Then Quick View draw box for "Diagnosis" closes