@f360_immunization_write_back @regression

Feature: F360 : Enter and Store Immunizations

@f360_2_immunization_create_form_validation @US6516
Scenario: Validate 'add immunization' form fields validation
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  Then the Immunizations applet displays
  And user selects and sets new encounter
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

@f360_1_immunization_create_form_validation @US6516 @US6510
Scenario: Validate 'add immunization' form fields validation
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  Then the Immunizations applet displays
  And user selects and sets new encounter
  Then user adds a new immunization
  And add immunization modal detail title says "Enter Immunization"
  And the add immunization detail modal displays labels
      | modal_item_labels           |
      | choose an option            |
      | administered                |
      | historical                  |
      | select an immunization type |
      | information source          |
      | lot number                  |
      | expiration date             |
      | manufacturer                |
      # US6510
      | administration date         |
      | administered by             |
      | administered location       |
      | ordering provider           |
      | route of administration     |
      | anatomic location           |
      # US6516
      | dosage/unit                 |
      | series                      |
      | comments                    |
  And the add immunization detail modal has "Add" and "Cancel" buttons
  And add immunization detail modal displays enabled fields
  | modal_item_form_fields					|
  | administered radio button				|
  | historical radio button					|
  And add immunization detail modal displays disabled fields
      | modal_item_form_fields                |
      | information source drop down          |
      | select an immunization type drop down |
      | lot number input box                  |
      | expiration date input box             |
      | manufacturer input box                |
      # US6510
      | administration date input box         |
      | administered by input box             |
      | administered location input box       |
      | ordering provider input box           |
      | route of administration drop down     |
      | anatomic location drop down           |
      # US6516
      | dosage/unit input box                 |
      | series drop down                      |
      | comment input box                     |

@f360_2_add_immunization_historical @US6521 @TC467 @US7733 @TC642 @future
Scenario: Create a new historical immunization and Save it.
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And user selects and sets new encounter
  Then user adds a new immunization
  And the user adds the immunization "MUMPS"
  When the user clicks the Immunizations Expand Button
  And the user is viewing the Immunizations expanded view
  And the Immunization Applet contains data rows
  And verifies the above "MUMPS" immunization is added to patient record 
  
@f360_3_add_immunization_administered @US6521 @TC474 @US7733 @TC643 @future
Scenario: Create a new administered immunization and Save it.
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And user selects and sets new encounter
  Then user adds a new immunization
  And the user adds the administered immunization "TDAP"
  When the user clicks the Immunizations Expand Button
  And the user is viewing the Immunizations expanded view
  And the Immunization Applet contains data rows
  And verifies the above "TDAP" immunization is added to patient record   

 
 @US6521 @TC476 @triage
 Scenario: "No results" will be returned when the user try to search for none existed vaccine
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And user selects and sets new encounter
  Then user adds a new immunization
  When the user chooses an Historical Immunization
  And the user searches for immunization "qqqqq"
  Then the immunization suggestion list displays "No results found"

@US6521 @TC477 @triage
Scenario: Verify immunization search validation
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And user selects and sets new encounter
  Then user adds a new immunization
  When the user chooses an Historical Immunization
  And the user searches for immunization ""
  Then the immunization suggestion list displays "Please enter 2 or more characters"

@US6521 @TC477 @triage
Scenario: Verify immunization search validation
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And user selects and sets new encounter
  Then user adds a new immunization
  When the user chooses an Historical Immunization
  When the user searches for immunization "a"
  Then the immunization suggestion list displays "Please enter 1 or more characters"


@US6521 @TC497 @traige
Scenario: Verify search vaccine name is not case sensitive
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Default Screen is active
  Then Cover Sheet is active
  And user selects and sets new encounter
  Then user adds a new immunization
  When the user chooses an Historical Immunization
  And the user searches for immunization "MUMPS"
  Then the immunization suggestion list displays "MUMPS"
  And the user searches for immunization "mumps"
  Then the immunization suggestion list displays "MUMPS"

@US6509 @TC1362 @data_specific @triage @debug @DE3738
Scenario: Filter out duplicate immunization records
  Given user is logged into eHMP-UI
  And user searches for and selects "eighty,patient"
  And Cover Sheet is active
  And the Immunizations applet displays 
  When the user clicks the Immunizations Expand Button
  And the user is viewing the Immunizations expanded view
  Then the Immunization applet contains 1 row with vaccine name "INFLUENZA, UNSPECIFIED FORMULATION (HISTORICAL)"

