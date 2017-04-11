@f513_encounter_form_data  @future @DE4560

Feature: F513 : Visit Management (Enter an Encounter Context)

@f513_1_pob_set_new_visit
Scenario: Set new encounter for a patient
  When user searches for and selects "twenty,patient"
  And Overview is active
  And the POB user selects change current encounter
  And POB user chooses to set a new visit
  Then the POB set visit button is disabled
  And POB user chooses new encounter location
  And POB user chooses new encounter provider
  And the POB set visit button is enabled
  And POB user selects set to apply changes
  And POB new visit encounter is set
  
@f513_2_pob_set_visit_from_clinic_appointment @DE6132 @DE6637
Scenario: Set new encounter for a patient from clinic appointment
  When user searches for and selects "appointment,inpatient"
  And Overview is active
  And the POB user selects change current encounter
  And POB user chooses to set a clinic appointments
  And POB user chooses the first clinic appointment
  And the POB set visit button is enabled
  And POB user selects set to apply changes
  Then POB new clinic appointment encounter is set
  
@f513_3_pob_set_visit_from_hosptial_admission @DE6637
Scenario: Set new encounter for a patient from hospital admission
  When user searches for and selects "zzzretiredonenineteen,patient"
  And Overview is active
  And the POB user selects change current encounter
  And POB user chooses to set a hospital admissions
  And POB user chooses the first hospital admission
  And the POB set visit button is enabled
  And POB user selects set to apply changes
  And POB new hospital admission encounter is set
  

