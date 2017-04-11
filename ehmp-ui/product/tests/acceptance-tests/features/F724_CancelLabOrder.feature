@F724
Feature: Cancel an Unsigned Outpatient Lab Order with lock and order refresh

@US8414 @TC1887
Scenario Outline: Save the dynamic fields (UI)
	# Given user is logged into eHMP-UI
	And user searches for and selects "Twenty,Patient"
    Then Overview is active
    And user selects and sets new encounter
    When the user navigates to Orders Expanded
    Then the "Orders" applet is displayed
    When user adds a new order
    And the user orders "<lab_test>" lab test
    Then the Collection Sample is set "<collection_sample>"
    Then the Specimen is set "<specimen>"
    Then the Collection Type is "<collection_type>"
    Then the Preview Order is "<preview_order>"

Examples:
   | lab_test     | collection_sample   | specimen | collection_type     | preview_order               |
   | PTT          | BLOOD               | PLASMA   | Send Patient to Lab | PTT BLOOD SP         |
   | LITHIUM      | BLOOD               | SERUM    | Send Patient to Lab | LITHIUM BLOOD SP      |
   | THEOPHYLLINE | BLOOD               | SERUM    | Send Patient to Lab | THEOPHYLLINE BLOOD SP |
   | GENTAMICIN   | BLOOD               | SERUM    | Send Patient to Lab | GENTAMICIN SERUM SP  |
   
