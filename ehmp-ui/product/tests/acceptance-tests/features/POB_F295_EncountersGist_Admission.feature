@F295_encounters_trend_view_admission @regression
Feature: F295 - Encounters Applet - Admission 

Background:
  
  Given user searches for and selects "zzzretiredonenineteen,Patient "
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  
@pob_f295_encounter_trend_view_admission @US3706 @US4001 @US4154 @US5126
Scenario: Encounters trend view Applet displays encounter type Admission
  And Encounter trend view applet contains type Admissions
  
@pob_f295_encounter_trend_view_admission_headers @US3706 @US4001 @US4154 @US5126
Scenario: Encounters trend view Applet displays encounter type Admission
  When the user expands type Admissions in Encounters trend view applet
  And Encounter trend view applet type Admissions contain headers
  | header    		|
  | Diagnosis		|
  | Last	  		|
  | Hx Occurrence	|
  
@pob_f295_admission_detail_view @F295-35.4 @US4154 @US5126 @US4805 @DE1388 @DE6882
Scenario: Encounters trend view applet Admission type details can be viewed
  When the user views the details for the first Admission type encounter
  Then the detail modal is displayed
  And the Timeline event "Admission" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Location        | 
      | Stop Code       | 
      | Facility        | 
      | Movements		|
      | Reason			|

@pob_f295_admission_quick_look_view @F295-35.4 @US4154 @US5126 @US4805 @DE1388
Scenario: Encounters trend view applet Admission type quick look can be viewed
  When the user views the quick look for the first Admission type encounter
  Then the quick look table is displayed
  And the Admission type quick look table contain headers
  | header			|
  | Date			|
  | Location		|
  | Facility		|
  
@pob_f295_admission_right_click_quick_look_view  @F295-5.6 @US4154 @US5126 @DE1388 @DE6517 @debug
Scenario: Encounters trend view applet Admission right click quick look can be viewed
  When the user selects the right side of Admission type encounter
  Then the quick look table is displayed
  And the Admission quick look table contain headers
  | header			|
  | Date			|
  | Diagnosis		|
  | Facility		|
  