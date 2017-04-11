@f513_encounter_form_data @regression @future @DE4560

Feature: F513 : Visit Management (Enter an Encounter Context)

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