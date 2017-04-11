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