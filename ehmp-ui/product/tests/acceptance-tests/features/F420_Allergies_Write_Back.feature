@f420_allergies_write_back @regression @future @DE4560

Feature: F420 : Enter and Store an Allergy including Entered in Error

@f420_1_allergies_form_validation
Scenario: Validate add allergy form

  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then user adds a new allergy
  And add allergy modal detail title says "Allergies"
  And the add allergy detail modal displays labels
  | modal_item_labels 			|
  | allergen			 		|
  | observed					|
  | historical					|
  | reaction date				|
  | reaction time				|
  | severity					|
  | nature of reaction			|
  | signs/symptoms				|
  | available 					|
  | selected 					|
  | date						|
  | time						|
  | comments					|
  And add allergy detail modal displays fields
  | modal_item_form_fields				|
  | allergen search input drop down		|
  | observed check box					|
  | historical check box				|
  | nature of reaction drop down		|
  | signs/symptoms input box			| 
  | comments input box					|
  And add allergy detail modal has disabled the fields
  | modal_item_form_fields			|
  | reaction date input box			|
  | reaction time input box			|
  | severity drop down				|
  And the add allergy detail modal has "Add" and "Cancel" buttons
  
@f420_2_add_allergy_historical @debug @DE5088
Scenario: Create a new allergy and Save it.

  # Given user is logged into eHMP-UI
  Given user searches for and selects "twenty,patient"
  And Cover Sheet is active
  And patient does not have a "CHOCOLATE LAXATIVE" allergy
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  When user adds a new allergy
  And the user adds "historical" allergy "CHOCOLATE LAXATIVE"
  And user closes the new observation window
  And the user expands the Allergies Applet
  Then the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  And verifies the above "CHOCOLATE LAXATIVE" allergy is added to patient record 
  And user opens allergy row "CHOCOLATE LAXATIVE" and marks as "entered in error"  
  
@f420_2_add_allergy_observed
Scenario: Create a new allergy and Save it.
  Given user searches for and selects "twenty,patient"
  And Cover Sheet is active
  And patient does not have a "CHOCOLATE LAXATIVE" allergy
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  When user adds a new allergy
  And the user adds "observed" allergy "CHOCOLATE LAXATIVE"
  And user closes the new observation window
  And the user expands the Allergies Applet
  Then the expanded Allergies Applet is displayed
  And the Allergies Applet expand view contains data rows
  And verifies the above "CHOCOLATE LAXATIVE" allergy is added to patient record 
  And user opens allergy row "CHOCOLATE LAXATIVE" and marks as "entered in error" 
  
  