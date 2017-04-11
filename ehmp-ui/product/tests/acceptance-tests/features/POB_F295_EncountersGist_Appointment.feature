@F295_encounters_trend_view_appointment @regression
Feature: F295 - Encounters Applet - Appointment 

Background:
  
  Given user searches for and selects "SIXHUNDRED,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  
@pob_f295_encounter_trend_view_appointment @US3706 @US4001 @US4154 @US5126 @DE2923
Scenario: Encounters trend view Applet displays encounter type Appointment
  And Encounter trend view applet contains type Appointments
  
@pob_f295_encounter_trend_view_appointment_headers @US3706 @US4001 @US4154 @US5126 @DE2923
Scenario: Encounters trend view Applet displays encounter type Appointment
  When the user expands type Appointments in Encounters trend view applet
  And Encounter trend view applet type Appointments contain headers
  | header    			|
  | Appointment Type	|
  | Last	  			|
  | Hx Occurrence		|
  
@pob_f295_appointment_detail_view @F295-32.5 @US4154 @US5126 @DE1388 @DE2923 @DE6882
Scenario: Encounters trend view applet Appointent type details can be viewed
  When the user views the details for the first Appointment type encounter
  Then the detail modal is displayed
  And the Timeline event "Appointment" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Appointment Status|
      | Location        | 
      | Stop Code       | 
      | Facility        | 

@pob_f295_appointment_quick_look_view @F295-5.7 @F295-5.8 @US4154 @US5126
Scenario: Encounters trend view applet Appointment type quick look can be viewed
  When the user views the quick look for the first Appointment type encounter
  Then the quick look table is displayed
  And the Appointment type quick look table contain headers
  | header			|
  | Date			|
  | Appt Status		|
  | Location		|
  | Provider		|
  | Facility		|
  
@pob_f295_appointment_right_click_quick_look_view @F295-5.6 @US4154 @US5126 @DE1388 @DE6517 @debug
Scenario: Encounters trend view applet Appointment right click quick look can be viewed
  When the user selects the right side of Appointment type encounter
  Then the quick look table is displayed
  And the Appointment quick look table contain headers
  | header			|
  | Date			|
  | Appt Status		|
  | Clinic Name		|
  | Provider		|
  | Facility		|
  