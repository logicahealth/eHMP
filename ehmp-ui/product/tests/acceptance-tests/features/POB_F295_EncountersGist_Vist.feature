@F295_encounters_trend_view_visit @regression
Feature: F295 - Encounters Applet - Visit 

Background:
  
  Given user searches for and selects "SIXHUNDRED,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  
@pob_f295_encounter_trend_view_visit @F295-1.9 @295-10.1 @295-10.2 @295-10.3 @295-10.4 @295-10.5 @295-10.6 @295-10.7 @295-10.8 @295-10.9 @295-10.10 @US3706 @US4001 @US4154 @US5126
Scenario: Encounters trend view Applet displays encounter type Visit
  And Encounter trend view applet contains type Visits
  
@pob_f295_encounter_trend_view_visit_headers @F295-1.9 @295-10.1 @295-10.2 @295-10.3 @295-10.4 @295-10.5 @295-10.6 @295-10.7 @295-10.8 @295-10.9 @295-10.10 @US3706 @US4001 @US4154 @US5126
Scenario: Encounters trend view Applet displays encounter type Visit
  When the user expands type Visits in Encounters trend view applet
  And Encounter trend view applet type Visits contain headers
  | header    		|
  | Visit Type		|
  | Last	  		|
  | Hx Occurrence	|
 
@pob_f295_encounter_trend_view_visit_arrow 
Scenario: Encounters trend view Applet displays a dynamic arrow for encounter type Visit
  And Encounters trend view applet displays a dynamic arrow in "right" position
  When the user expands type Visits in Encounters trend view applet
  Then Encounters trend view applet displays a dynamic arrow in "down" position
  
@pob_f295_visit_detail_view @DE6882 
Scenario: Encounters trend view applet Visit type details can be viewed
  When the user views the details for the first Visit type encounter
  Then the detail modal is displayed
  And the Timeline event "Visit" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Location        | 
      | Stop Code       | 
      | Facility        | 

@pob_f295_visit_quick_look_view @F295-4.7 @F295-4.8 @F295-14.1 @F295-14.2 @F295-14.3 @F295-14.4 @F295-14.5 @F295-14.5 @F295-14.6 @F295-14.7 @F295-14.8 @US4154 @US5126
Scenario: Encounters trend view applet Visit type quick look can be viewed
  When the user views the quick look for the first Visit type encounter
  Then the quick look table is displayed
  And the Visit type quick look table contain headers
  | header			|
  | Date			|
  | Appt Status		|
  | Location		|
  | Provider		|
  | Facility		|
  
@pob_f295_visit_right_click_quick_look_view @F295-4.1 @F295-4.2 @F295-4.3 @F295-4.4 @F295-4.5 @F295-4.6 @US4154 @US5126 @DE6517 @debug
Scenario: Encounters trend view applet Visit right click quick look can be viewed
  When the user selects the right side of Visit type encounter
  Then the quick look table is displayed
  And the Visit quick look table contain headers
  | header			|
  | Date			|
  | Appt Status		|
  | Clinic Name		|
  | Provider		|
  | Facility		|
  