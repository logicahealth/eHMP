@f423_vitals_write_back  @US7939_TC991 @US7939_TC992 @US11272 @DE4560 @DE7008 @reg3
Feature: F423 : Enter and Store Vitals

# US7939, TC993: cannot automate

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,inpatient"
  Then Cover Sheet is active
  And user navigates to Vitals expanded view 
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then user adds a new vitals
  And user chooses to "Expand All" on add vitals modal detail screen

@f423_add_vital_form_validation @US7939 @TC994 @TC995
Scenario: Validate Title and required fields on add vital modal screen.

  And add vital modal detail title says "Enter Vitals"  
  And the add vitals detail modal displays labels
  | modal_item_labels	|
  | Date Taken			|
  | Time Taken		 	|
  | Pass				|
  And the Date Taken is a mandatory field on the add vitals modal detail screen
  And the add vitals detail modal displays "Pass", "Add" and "Cancel" buttons
  
@f423_add_vital_BP_validation @US6485
Scenario: Validate Blood Pressure form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Blood Pressure"
  | modal_item_labels |
  | Blood Pressure 	  |
  | BP Unavailable	  |
  | BP Refused   	  |
  | BP Location	  	  |
  | BP Method		  |
  | BP Cuff Size	  |
  | BP Position		  | 
  | BP Units		  |
  And the add vitals detail modal displays form fields for Blood Pressure

  
@f423_add_vital_temperature_validation @US6477 @US7939 @TC990
Scenario: Validate temperature form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Temperature"
  | modal_item_labels |
  | Temperature 	  |
  | Temp Unavailable  |
  | Temp Refused   	  |
  | Temp Units F		  |
  | Temp Units C	      |
  | Temp Location	  |
  And the add vitals detail modal displays form fields for Temperature
  
@f423_add_vital_pulse_validation @US6482
Scenario: Validate pulse form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Pulse"
  | modal_item_labels 	|
  | Pulse 	  			|
  | Pulse Unavailable  	|
  | Pulse Refused   	|
  | Pulse Units			|
  | Pulse Method		|
  | Pulse Position	    |
  | Pulse Site			|
  | Pulse Location	  	|
  And the add vitals detail modal displays form fields for Pulse
  
@f423_add_vital_respiration_validation @US6478
Scenario: Validate respiration form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Respiration"
  | modal_item_labels 		|
  | Respiration 	  		|
  | Respiration Unavailable |
  | Respiration Refused   	|
  | Respiration Units		|
  | Respiration Method		|
  | Respiration Position	|
  And the add vitals detail modal displays form fields for Respiration

  
@f423_add_vital_PO_validation @US6480
Scenario: Validate Pulse Oximetry form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Pulse Oximetry"
  | modal_item_labels 				|
  | Pulse Oximetry 	  				|
  | PO Unavailable 					|
  | PO Refused   					|
  | PO Units						|
  | PO Supplemental Oxygen Flow Rate|
  | PO Method						|
  And the add vitals detail modal displays form fields for Pulse Oximetry

  
@f423_add_vital_height_validation @US6484 @US7939 @TC990
Scenario: Validate Height form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Height"
  | modal_item_labels 		|
  | Height 	  				|
  | Ht Unavailable 			|
  | Ht Refused   			|
  | Ht Units in				|
  | Ht Units cm				|
  | Ht Quality				|
  And the add vitals detail modal displays form fields for Height


@f423_add_vital_weight_validation @US6474 @US7939 @TC990
Scenario: Validate Weight form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Weight"
  | modal_item_labels 		|
  | Weight 	  				|
  | Wt Unavailable 			|
  | Wt Refused   			|
  | Wt Units lb				|
  | Wt Units kg				|
  | Wt Method				|
  | Wt Quality				|
  And the add vitals detail modal displays form fields for Weight
  
@f423_add_vital_pain_validation @US6483
Scenario: Validate Pain form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Pain"
  | modal_item_labels 		|
  | Pain 	  				|
  | Pain Unavailable 		|
  | Pain Refused   			|
  | Pain Unable to Respond	|
  And the add vitals detail modal displays form fields for "Pain"
  | modeal_item_form_fields			|
  | Pain Input Box					|
  | Pain Unavailable Input Box		|
  | Pain Refused Input Box			|
  | Pain Unable to Respond Input Box|
  
@f423_add_vital_cg_validation @US6473 @US7939 @TC990
Scenario: Validate Circumference/Girth form fields on add vital modal screen.

  And the add vitals detail modal displays labels and expanded labels for "Circumference/Girth"
  | modal_item_labels 		|
  | Circumference/Girth 	|
  | CG Unavailable 			|
  | CG Refused   			|
  | CG Units in				|
  | CG Units cm				|
  | CG Site					|
  | CG Location				|
  And the add vitals detail modal displays form fields for Circumference/Girth
  
@f423_add_vital @US6338 @US8923 @US7939 @TC955 @DE7425
Scenario: Add a vital record.

  And user adds a Vital record for the current visit
      | vital type     | vital field              | value   |
      | Blood Pressure | BP Input Box             | 130/80  |
      | Temperature    | Temp Input Box           | 98.4    |
      | Temperature    | Temp Location Drop Down  | ORAL    |
      | Pulse          | Pulse Input Box          | 70      |
      | Pulse          | Pulse Method Drop Down   | AT REST |
      | Pulse          | Pulse Position Drop Down | SITTING |
      | Respiration    | Respiration Input Box    | 80      |
      | Pulse Oximetry | PO Input Box             | 35      |
  And user chooses unavailable for the vitals 
      | vital type          | notation |
      | Height              | Ht       |
      | Pain                | Pain     |
      | Circumference/Girth | CG       |
  And user chooses refused for the vitals
      | vital type | notation |
      | Weight     | Wt       |
  Then user adds vitals to patient record 
  Then user closes the new observation window
  Then the "Vitals" applet is displayed
  And the recently added vital record is displayed
      | vital type 			   | value  |
      | Blood Pressure     | 130/80 |

@US7261 @TC949 @DE3732
Scenario: Patient On a Pass button on Vitals form
  When user chooses to Pass on entering vitals
  Then the form fields for "Blood Pressure" are disabled
  | modeal_item_form_fields |
  | BP Input Box      |
  | BP Unavailable Input Box|
  | BP Refused Input Box  |
  | BP Location Drop Down |
  | BP Method Drop Down   |
  | BP Cuff Size Drop Down  |
  | BP Position Drop Down |
Then the form fields for "Pulse" are disabled
  | modeal_item_form_fields   |
  | Pulse Input Box       |
  | Pulse Unavailable Input Box |
  | Pulse Refused Input Box   |
  | Pulse Method Drop Down    |
  | Pulse Position Drop Down  |
  | Pulse Site Drop Down    |
  | Pulse Location Drop Down  |
Then the form fields for "Respiration" are disabled
  | modeal_item_form_fields       |
  | Respiration Input Box       |
  | Respiration Unavailable Input Box |
  | Respiration Refused Input Box   |
  | Respiration Method Drop Down    |
  | Respiration Position Drop Down    |
Then the form fields for "Temperature" are disabled
  | modeal_item_form_fields   |
  | Temp Input Box        |
  | Temp Unavailable Input Box  |
  | Temp Refused Input Box    |
  | Temp Location Drop Down   |
  | Temp Units F Input Box    |
  | Temp Units C Input Box    |
Then the form fields for "Pulse Oximetry" are disabled
  | modeal_item_form_fields           |
  | PO Input Box                |
  | PO Unavailable Input Box          |
  | PO Refused Input Box            |
  | PO Supplemental Oxygen Flow Rate Input Box  |
  | PO Method Drop Down             |
Then the form fields for "Height" are disabled
  | modeal_item_form_fields   |
  | Ht Input Box        |
  | Ht Unavailable Input Box  |
  | Ht Refused Input Box    |
  | Ht Units in Input Box   |
  | Ht Units cm Input Box   |
  | Ht Quality Drop Down    |
Then the form fields for "Pain" are disabled
  | modeal_item_form_fields     |
  | Pain Input Box          |
  | Pain Unavailable Input Box    |
  | Pain Refused Input Box      |
  | Pain Unable to Respond Input Box|
Then the form fields for "Weight" are disabled
  | Wt Input Box        |
  | Wt Unavailable Input Box  |
  | Wt Refused Input Box    |
  | Wt Units lb Input Box   |
  | Wt Units kg Input Box   |
  | Wt Method Drop Down     |
  | Wt Quality Drop Down    |
Then the form fields for "Circumference/Girth" are disabled
  | modeal_item_form_fields   |
  | CG Input Box        |
  | CG Unavailable Input Box  |
  | CG Refused Input Box    |
  | CG Units in Input Box   |
  | CG Units cm Input Box   |
  | CG Site Drop Down     |
  | CG Location Drop Down   |
  

