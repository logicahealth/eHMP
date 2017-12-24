@f723_pob_lab_order_write_back @orders_applet @DE4560 @reg2 @DE7382

Feature: F723 : Outpatient Labs Write Back Orders to VistA with File Locking and Order Checks

@f723_pob_lab_order_create_form_validation @F844
Scenario: Validate Add Lab Order form.

  When user searches for and selects "twenty,inpatient"
  Then Summary View is active
  Then POB user adds a new order
  Then the add order modal detail title says "ORDER A LAB TEST"
  And POB add order detail modal displays labels
  | modal_item_fields 	    	  	|
  | Available Lab Tests      		|
  | Urgency 		  				|
  | Collection Type 				|
  | Collection Date 				|
  | Collection Time					|
  | Collection Sample 				|
  | Specimen						|
  | How Often?		   			    |
  | How Long?						|
  | Remind me if results are not received by|
  | Notification Date  				|
  | Problem Relationship			|
  And POB add order detail modal displays preview labels
  | preview_labels					|
  | Note Object Preview				|
  And POB add order detail modal has buttons Delete, Draft and Cancel
  And POB add order detail modal has button "Accept & Add Another"
  
@f723_pob_lab_order_create_new @F844 @F1044 @US15136 @F844 @DE7024 
Scenario: Create a Lab Order and accept it.

  When user searches for and selects "twenty,inpatient"
  Then Summary View is active
  When POB user navigates to orders expanded view
  And the user takes note of number of existing orders
  And POB user adds a new order
  And POB user orders "24 hr urine protein" lab test
  And POB user accepts the order
  Then an order is added to the applet  
  And POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user opens note objects button
  Then POB new order "24 hr urine protein" is added to the note objects

@f723_pob_lab_order_sign @F844 @DE5618 @DE7012 @DE7080
Scenario: Create a Lab Order and Sign it.

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  Then staff view screen is displayed
  When user searches for and selects "twenty,inpatient"
  Then Summary View is active
  And POB user navigates to orders expanded view
  And POB user opens the detail view of the order "24 hr urine protein" with status "UNRELEASED"
  Then POB user signs the order as "PW      "
  And POB user verifies order status changes to "PENDING" for the order "24 hr urine protein"
    
@f723_pob_lab_order_discontinue @F844 @DE5618 @DE7012 @DE7080
Scenario: Create a Lab order and discontinue it.

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  Then staff view screen is displayed
  When user searches for and selects "twenty,inpatient"
  Then Summary View is active
  And POB user navigates to orders expanded view
  And POB user opens the detail view of the order "24 hr urine protein" with status "PENDING"
  And POB user discontinues the order
  And POB user opens the detail view of the order "24 hr urine protein" with status "UNRELEASED"
  Then POB user signs the order as "PW      "
  Then POB user verifies order status changes to "DISCONTINUED" for the order "24 hr urine protein"
  
@f723_pob_lab_order_cancel @F844 @DE5618 @DE7012
Scenario: Create a Lab Order and cancel it.

  When user searches for and selects "twenty,inpatient"
  Then Summary View is active
  When POB user navigates to orders expanded view
  And the user takes note of number of existing orders
  And POB user adds a new order
  And POB user orders "11-DEOXYCORTISOL" lab test
  And POB user accepts the order
  Then an order is added to the applet 
  When POB user opens the detail view of the order "11-DEOXYCORTISOL" with status "UNRELEASED"
  And POB user cancels the order
  Then POB user verifies order status changes to "CANCELLED" for the order "11-DEOXYCORTISOL"
  
@f844_pob_lab_order_save @F844
Scenario: Create a Lab Order and Save it.

  When user searches for and selects "twenty,inpatient"
  Then Summary View is active
  And POB user adds a new order
  And POB user orders "11-DEOXYCORTISOL" lab test
  And POB user saves the order
  Then POB user verifies the above "11-DEOXYCORTISOL" order is saved in the action tray panel


