@f420_allergies_write_back @allergies_applet  

Feature: F420 : Enter and Store an Allergy including Entered in Error

@f420_pob_allergies_form_field_title_validation2
Scenario: Validate add allergy form head fields
  Given user searches for and selects "twenty,inpatient"
  #And Cover Sheet is active and ready for write back tests
  Then Cover Sheet is active
  And user navigates to allergies expanded view
  When POB user adds a new allergy
  Then POB add allergy modal detail title says "Allergies"
  And the allergy detail modal displays expected elements
  And add allergy detail modal displays buttons "Add" and "Cancel"
  
@f420_2_add_allergy_historical @DE5088 @future @DE4560 @debug @DE7307 @DE7381
Scenario: Create a new allergy and Save it.

  # Given user is logged into eHMP-UI
  Given user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And patient does not have a "CHOCOLATE LAXATIVE" allergy
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  When user adds a new allergy
  And POB user adds historical allergy "CHOCOLATE LAXATIVE"
  And user closes the new observation window
  And the user expands the Allergies Applet
  Then the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  And verifies the above "CHOCOLATE LAXATIVE" allergy is added to patient record 
  And user opens allergy row "CHOCOLATE LAXATIVE" and marks as "entered in error"  
  
@f420_2_add_allergy_observed @future @DE4560 @debug @DE7307 @DE7381
Scenario: Create a new allergy and Save it.
  Given user searches for and selects "twenty,inpatient"
  And Cover Sheet is active and ready for write back tests
  And patient does not have a "CHOCOLATE LAXATIVE" allergy
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  When user adds a new allergy
  And POB user adds observed allergy "CHOCOLATE LAXATIVE"
  And user closes the new observation window
  And user navigates to allergies expanded view
  And the Allergies Applet expand view contains data rows
  And verifies the above "CHOCOLATE LAXATIVE" allergy is added to patient record 
  And user opens allergy row "CHOCOLATE LAXATIVE" and marks as "entered in error" 
  
 
