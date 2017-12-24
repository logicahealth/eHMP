@F144_ActiveMedications   @reg2
Feature: F144 - eHMP Viewer GUI - Active Medications

# Team: Jupiter

Background: 
  Given user searches for and selects "Onehundredninetysix,Patient"
  
@f297_active_meds_info_button_integration_overview
Scenario: Verify Active Meds applet on overview page has info button toolbar

  And Overview is active
  And active meds gist is loaded successfully
  And user opens the first active medication gist item
  Then active meds info button is displayed
  
@f297_active_meds_info_button_integration_coversheet
Scenario: Verify Active Meds applet on coversheet page has info button toolbar

  And Cover Sheet is active
  And active meds summary view is loaded successfully
  And user opens the first active medication summary item
  Then active meds info button is displayed
  
@f297_active_meds_info_button_integration_expand_view
Scenario: Verify active medication applet expanded view has info button toolbar

  And Overview is active
  And user navigates to active meds expanded view 
  And user opens the first medication row
  Then active meds info button is displayed


