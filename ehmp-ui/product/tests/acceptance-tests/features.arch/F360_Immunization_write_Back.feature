@f360_immunization_write_back @regression

Feature: F360 : Enter and Store Immunizations

@US6509 @TC1362 @data_specific @triage @debug @DE3738
Scenario: Filter out duplicate immunization records
  Given user is logged into eHMP-UI
  And user searches for and selects "eighty,patient"
  And Cover Sheet is active
  And the Immunizations applet displays 
  When the user clicks the Immunizations Expand Button
  And the user is viewing the Immunizations expanded view
  Then the Immunization applet contains 1 row with vaccine name "INFLUENZA, UNSPECIFIED FORMULATION (HISTORICAL)"
  
#administered immunization form no longer has these fields.
@f360_2_immunization_create_form_validation @US6516 @future @US11272
Scenario: Validate 'add immunization' form fields validation
  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  Then the Immunizations applet displays
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  
  Then user adds a new immunization
  And add immunization modal detail title says "Enter Immunization"
  When the user chooses an Administered Immunization
  And the add immunization administered detail modal displays labels
      | modal_item_labels           |
      | VIS                         |
      | VIS Date Offered            |
  And add immunization administered detail modal displays disabled fields
      | modal_item_form_fields                |
      | VIS input box                         |
      | VIS Date Offered input box            |
      
# the following two tests are tested thro' the feature : Feature: F893 : Enhanced Immunization Detail View with VIMM Fields
@f360_2_add_immunization_historical @US6521 @TC467 @US7733 @TC642 @future
Scenario: Create a new historical immunization and Save it.
  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  
  Then user adds a new immunization
  And the user adds the immunization "MUMPS"
  When the user clicks the Immunizations Expand Button
  And the user is viewing the Immunizations expanded view
  And the Immunization Applet contains data rows
  And verifies the above "MUMPS" immunization is added to patient record 
  
@f360_3_add_immunization_administered @US6521 @TC474 @US7733 @TC643 @future
Scenario: Create a new administered immunization and Save it.
  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  
  Then user adds a new immunization
  And the user adds the administered immunization "HEP A, ADULT"
  When the user clicks the Immunizations Expand Button
  And the user is viewing the Immunizations expanded view
  And the Immunization Applet contains data rows
  And verifies the above "TDAP" immunization is added to patient record   
 