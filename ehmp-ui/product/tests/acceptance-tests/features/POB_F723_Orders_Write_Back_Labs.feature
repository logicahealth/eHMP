@f723_pob_lab_order_write_back @regression

Feature: F723 : Outpatient Labs Write Back Orders to VistA with File Locking and Order Checks

@f723_pob_lab_order_create_form_validation
Scenario: Validate Add Lab Order form.

  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user adds a new order
  And POB add order modal detail title says "ORDER A LAB TEST"
  And POB add order detail modal displays labels
  | modal_item_fields 	    	  	|
  | Available Lab Tests *     		|
  | Urgency *		  				|
  | Collection Date * 				|
  | Collection Time					|
  | How Often? *					|
  | How Long?						|
  | Collection Sample *				|
  | Collection Type *				|	
  | Specimen *						|
  | Problem Relationship			|
  | Annotation						|
  | Select an Activity				|
  And POB add order detail modal displays preview labels
  | preview_labels					|
  | Order Preview					|
  | Note Object Preview				|
  And POB add order detail modal has buttons
  | buttons					|
  | Delete 	     			|
  | Save & Close 			|
  And POB add order detail modal has button "Accept & Add Another"

@f723_pob_lab_order_create_new
Scenario: Create a Lab Order and Save it.

  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user adds a new order
  And POB user orders "24 hr urine calcium" lab test
  And POB user validates the order to be "24 hr urine calcium"
  And POB user accepts the order
  And POB user clicks the actions tray
  When POB user expands orders applet
  #When POB user navigates to orders expanded view
  And POB user verifies the above "24 hr urine calcium" order is added to patient record  

@f723_pob_lab_order_sign
Scenario: Create a Lab Order and Sign it.

  Given user views the login screen
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PW    " verifycode as  "PW    !!"
  Then the patient search screen is displayed
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter "Cardiology"
  When POB user expands orders applet
  And user verifies that the first row contains the order "24 hr urine calcium" with status "UNRELEASED"
  Then POB user opens the detail view of the order "24 hr urine calcium"
  And POB user signs the order as "PW    !!"
  And POB user verifies order status changes to "PENDING"
    
@f723_pob_lab_order_discontinue @future
Scenario: Create a Lab order and discontinue it.

  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And user selects and sets new encounter
  When POB user expands orders applet
  And user verifies that the first row contains the order "24 hr urine calcium" with status "PENDING"
  Then POB user opens the detail view of the order "24 hr urine calcium"
  And POB user discontinues the order
  And POB user verifies order status changes to "DISCONTINUED"
  


