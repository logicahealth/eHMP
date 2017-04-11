@f513_encounter_form_data @regression @future @DE4560

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
  
@f513_2_pob_set_visit_from_clinic_appointment
Scenario: Set new encounter for a patient from clinic appointment
  When user searches for and selects "appointment,inpatient"
  And Overview is active
  And the POB user selects change current encounter
  And POB user chooses to set a clinic appointments
  And POB user chooses the first clinic appointment
  And the POB set visit button is enabled
  And POB user selects set to apply changes
  Then POB new clinic appointment encounter is set
  
@f513_3_pob_set_visit_from_hosptial_admission 
Scenario: Set new encounter for a patient from hospital admission
  When user searches for and selects "zzzretiredonenineteen,patient"
  And Overview is active
  And the POB user selects change current encounter
  And POB user chooses to set a hospital admissions
  And POB user chooses the first hospital admission
  And the POB set visit button is enabled
  And POB user selects set to apply changes
  And POB new hospital admission encounter is set
  
@f513_3_pob_encounter_form
Scenario: Verify encounter form 
  When user searches for and selects "twenty,patient"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  And POB user opens the encounter form
  And POB user chooses primary provider
  And POB user accepts the encounter
  And the POB user selects change current encounter
  Then POB user verifies clinic appointment is set to the location "Cardiology"
  
@f513_4_pob_encounter_form_diagnosis_list
Scenario: Verify encounter form diagnosis list is interactable
  When user searches for and selects "twenty,patient"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  And POB user opens the encounter form
  Then POB user is able to select a diagnosis from the list
  And POB user can add another diagnosis code
  
@f513_5_pob_encounter_form_visit_type
Scenario: Verify encounter form Visit Type is interactable
  When user searches for and selects "twenty,patient"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  And POB user opens the encounter form
  Then POB user is able to select a visit type from the options listed
  And POB user can add another visit type modifier
  
@f513_6_pob_encounter_form_remove_primary_provider
Scenario: Verify encounter form Primary provider remove button functions
  When user searches for and selects "twenty,patient"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  And POB user opens the encounter form
  Then POB user is able to remove the option primary provider
  
@f513_7_pob_encounter_form_procedure
Scenario: Verify encounter form Procedure is interactable
  When user searches for and selects "twenty,patient"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  And POB user opens the encounter form
  Then POB user is able to select a procedure from the options listed
