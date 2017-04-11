@f723_lab_order_write_back @future @DE4560
Feature: F723 : Outpatient Labs Write Back Orders to VistA with File Locking and Order Checks

# test re-written in page objects

@f723_1_lab_order_create_form_validation
Scenario: Validate Add Lab Order form.

  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then user adds a new order
  And add order modal detail title says "Order a Lab Test"
  And the add order detail modal displays labels
  | modal_item_labels 		|
  | available lab tests 	|
  | urgency			  		|
  | collection date   		|
  | collection time	  		|
  | how long				|
  | how often				|
  | collection sample		|
 # | collection type			|
  | specimen				|
  | select an activity		|
  | preview order			|
  | note object preview		|
  | problem relationship	|
  | annotation				|
  And the add order detail modal has the enabled buttons
  | buttons	|
  | Cancel 	|
  | Delete 	|
  And the add order detail modal has the disabled buttons
  | buttons	|
  | Accept  |
  And add order detail modal displays fields
  | modal_item_form_fields			|
  | available lab tests combo box	|
  | problem relationship drop down	|
  | annotation input box			|
  And add order detail modal has disabled the fields
  | modal_item_form_fields			|
  | collection date input box		|
  | collection time input box		| 
  | urgency drop down				|
  | how long input box				|
  | select an activity drop down	|
  | how often drop down				|
  | collection sample drop down		|
  | collection type drop down		|
  | specimen drop down				|
  
#@f723_2_lab_order_create
#Scenario: Create a Lab Order and Save it.

#  Given user is logged into eHMP-UI
#  And user searches for and selects "twenty,patient"
#  Then Cover Sheet is active
#  And user selects and sets new encounter
#  Then user adds a new order
#  And the user orders "BB CBC-TEST" lab test
#  And the user validates the order to be "BB CBC-TEST"
#  And user accepts the order
#  When the user clicks the control "Expand View" in the "Orders applet"
#  And verifies the above "BB CBC-TEST" order is added to patient record

@f723_2_lab_order_create_new @future
Scenario: Create a Lab Order and Save it.

  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then user adds a new order
  And the user orders "24 hr urine calcium" lab test
  And the user validates the order to be "24 hr urine calcium"
  And user accepts the order
  When the user clicks the control "Expand View" in the "Orders applet"
  And verifies the above "24 hr urine calcium" order is added to patient record  

@f723_3_lab_order_create_and_sign @future
Scenario: Create a Lab Order and Sign it.

  Given user views the login screen
  When user logs in with credentials
     | field      | value    |
     | Facility   | PANORAMA |
     | AccessCode | vk1234   |
     | VerifyCode | vk1234!! |
     | SignIn     |          |
  Then the patient search screen is displayed
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then user adds a new order
  And the user orders "24 hr urine calcium" lab test
  And the user validates the order to be "24 hr urine calcium"
  And user accepts the order
  When the user clicks the control "Expand View" in the "Orders applet"
  And verifies the above "24 hr urine calcium" order is added to patient record
  Then user opens the detail view of the order "24 hr urine calcium"
  And user signs the order as "vk1234!!"
  And the user verifies order status changes to "PENDING"
    
@f723_4_lab_order_create_and_discontinue @future
Scenario: Create a Lab order and discontinue it.

  # Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Cover Sheet is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then user adds a new order
  And the user orders "24 hr urine calcium" lab test
  And the user validates the order to be "24 hr urine calcium"
  And user accepts the order
  When the user clicks the control "Expand View" in the "Orders applet"
  And verifies the above "24 hr urine calcium" order is added to patient record
  Then user opens the detail view of the order "24 hr urine calcium"
  And user discontinues the order
  And the user verifies order status changes to "CANCELLED"
  


