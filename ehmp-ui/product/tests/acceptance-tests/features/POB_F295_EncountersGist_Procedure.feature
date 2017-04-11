@F295_encounters_trend_view_procedure  @reg1
Feature: F295 - Encounters Applet - Procedure

Background:
  
  Given user searches for and selects "SIXHUNDRED,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  
@pob_f295_encounter_trend_view_procedure @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US3706 @US4001 @US4154 @US5126
Scenario: Encounters trend view Applet displays encounter type Procedure
  And Encounter trend view applet contains type Procedures
  
@pob_f295_encounter_trend_view_procedure_headers @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US3706 @US4001 @US4154 @US5126
Scenario: Encounters trend view Applet displays encounter type Procedure
  When the user expands type Procedures in Encounters trend view applet
  And Encounter trend view applet type Procedures contain headers
  | header    		|
  | Procedure name	|
  | Last	  		|
  | Hx Occurrence	|
  
@pob_f295_procedure_detail_view @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US4154 @US5126 @DE3334 @DE4552 @DE6761 @debug @DE7021
Scenario: Encounters trend view applet procedure type details can be viewed
  When the user views the details for the first Procedure type encounter
  Then the detail modal is displayed
  And the Timeline event "Procedure" Detail modal displays 
      | modal item      |
      | Facility	    | 
      | Type            | 
      | Status          | 
      | Date/Time       | 

@pob_f295_procedure_quick_look_view @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US4154 @US5126 @DE1388
Scenario: Encounters trend view applet Procedure type quick look can be viewed
  When the user views the quick look for the first Procedure type encounter
  Then the quick look table is displayed
  And the Procedure type quick look table contain headers
  | header			|
  | Date			|
  | Service			|
  | Provider		|
  | Facility		|
  
@pob_f295_procedure_right_click_quick_look_view @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US4154 @US5126 @DE6517 @debug
Scenario: Encounters trend view applet Procedure right click quick look can be viewed
  When the user selects the right side of Procedure type encounter
  Then the quick look table is displayed
  And the Procedure quick look table contain headers
  | header			|
  | Date			|
  | Procedure Name	|
  | Service			|
  | Facility		|
  