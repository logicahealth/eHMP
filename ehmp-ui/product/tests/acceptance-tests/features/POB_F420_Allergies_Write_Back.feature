@f420_pob_allergies_write_back @regression @future

Feature: F420 : POB - Enter and Store an Allergy including Entered in Error

@f420_pob_allergies_form_field_title_validation
Scenario: Validate add allergy form head fields

  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user adds a new allergy
  And POB add allergy modal detail title says "Allergies"
  And POB add allergy detail modal displays labels
  | modal_item_labels 			|
  | Allergen			 		|
  | choose an option			|
  | Observed					|
  | Historical					|
  | Reaction Date				|
  | Time						|
  | Severity					|
  | Nature of Reaction			|
  | Comments					|
  And POB add allergy detail modal displays Table rows
  | table_cells					|
  | Available Signs / Symptoms	|
  | Selected Signs / Symptoms	|
  | Date						|
  | Time						|

@f420_pob_allergies_input_field_validation
Scenario: Validate add allergy form input field

  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user adds a new allergy 
  And add allergy detail modal displays allergen search input drop down
  And add allergy detail modal displays historical check box
  And add allergy detail modal displays observed check box
  And add allergy detail modal displays reaction date input box
  And add allergy detail modal displays reaction time input box
  And add allergy detail modal displays severity drop down
  And add allergy detail modal displays nature of reaction drop down
  And add allergy detail modal displays available signs/symptoms input box
  And add allergy detail modal displays comments input box
  And add allergy detail modal displays buttons "Add" and "Cancel"
  
@f420_pob_add_allergy_historical
Scenario: Create a new allergy and Save it.

  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user adds a new allergy 
  And POB user adds historical allergy "CHOCOLATE LAXATIVE"
  When POB user expands the Allergies Applet
  Then POB expanded Allergies Applet is displayed
  And POB Allergies Applet expand view contains data rows
  And POB user verifies the above "CHOCOLATE LAXATIVE" allergy is added to patient record 
  And POB user opens allergy row "CHOCOLATE LAXATIVE" and marks as "entered in error"  
