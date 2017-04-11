@f513_encounter_form_data @regression

Feature: F513 : Visit Management (Enter an Encounter Context)

@f513_1_set_new_visit
Scenario: Set new encounter for a patient
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Overview is active
  And the user selects change current encounter
  And user chooses to set a new visit
  And the set visit button is disabled
  Then user chooses new encounter location
  And the set visit button is enabled
  And user selects set to apply changes
  And new encounter is set
  
@f513_1_set_new_encounter
Scenario: Set new encounter for a patient
  Given user is logged into eHMP-UI
  And user searches for and selects "eight,patient"
  Then Overview is active
  And user selects and sets new encounter
  
@f513_2_set_visit_from_clinic_appointment
Scenario: Set new encounter for a patient from clinic appointment
  Given user is logged into eHMP-UI
  And user searches for and selects "appointment,inpatient"
  Then Overview is active
  And the user selects change current encounter
  And user chooses to set a clinic appointments
  And user chooses the first clinic appointment
  And user selects set to apply changes
  And new encounter is set
  
@f513_3_set_visit_from_hosptial_admission @future
Scenario: Set new encounter for a patient from clinic appointment
  Given user is logged into eHMP-UI
  And user searches for and selects "onehundredninetysix,patient"
  Then Overview is active
  And the user selects change current encounter
  And user chooses to set a hospital admissions
  And user chooses the first hospital admission
  And user selects set to apply changes
  And new hospital admission encounter is set
