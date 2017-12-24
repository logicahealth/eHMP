@F724 @DE4560 @orders_applet
Feature: Cancel an Unsigned Outpatient Lab Order with lock and order refresh

@US8414 @TC1887
Scenario Outline: Save the dynamic fields (UI)
	  Given user searches for and selects "Twenty,inPatient"
    Then Overview is active
    And the user navigates to Orders Expanded
    And the "Orders" applet is displayed
    When user adds a new order
    And the user orders "<lab_test>" lab test
    Then the Collection Sample is set "<collection_sample>"
    Then the Specimen is set "<specimen>"
    Then the Collection Type is "<collection_type>"

Examples:
   | lab_test     | collection_sample   | specimen | collection_type     | preview_order               |
   | PTT          | BLOOD   (BLUE)      | PLASMA   | Send Patient to Lab | PTT BLOOD SP         |
   | LITHIUM      | BLOOD   (GOLD TOP)  | SERUM    | Send Patient to Lab | LITHIUM BLOOD SP      |
   | THEOPHYLLINE | BLOOD   (GOLD TOP)  | SERUM    | Send Patient to Lab | THEOPHYLLINE BLOOD SP |
   | GENTAMICIN   | BLOOD   (GOLD TOP)  | SERUM    | Send Patient to Lab | GENTAMICIN SERUM SP  |
   
