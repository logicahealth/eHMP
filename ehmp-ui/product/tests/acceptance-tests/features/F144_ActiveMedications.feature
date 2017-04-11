@F144_ActiveMedications @regression @triage
Feature: F144 - eHMP Viewer GUI - Active Medications

# Team: Jupiter

@f144_1_active_medications_applet_inclusion @US2954 @US9493 @US8845
Scenario: User views active medications on coversheet
  # Given user is logged into eHMP-UI
  Given user searches for and selects "Eightyeight,Patient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  # US8845
  Then the Active and Recent Medications applet is titled "Active & Recent Medications"
  And the Active & Recent Medications Applet table contains headers
    | Medication | Status | Facility |
  And the Active & Recent Medications Applet table finishes loading

@f144_2_activie_medications_deatail @US2954 @DE831 @DE3798 @DE5017
Scenario: Viewing modal details for  Active & Recent Medications.
  # Given user is logged into eHMP-UI
  Given user searches for and selects "Eightyeight,Patient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  Given the Active & Recent Medications Applet displays at least 1 row
  When the user views the details for the first Active & Recent Medications
  Then the modal is displayed
  Then the modal title starts with "Medication"
  And the modal displays Order Hx
  And the modal displays Order Detail Panel
  
@f144_active_medications_refresh 
Scenario: Active Medications applet displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  Given user searches for and selects "Eightyeight,Patient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  And the Active Medications Applet table contains data rows
  When user refreshes Active Medications Applet
  Then the message on the Active Medications Applet does not say "An error has occurred"
  
@f144_active_medications_expand_applet_refresh 
Scenario: Active Medications expand view applet displays all of the same details after applet is refreshed
  And user searches for and selects "Eightyeight,Patient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  When the user navigates to the expanded Active Medications Applet
  Then "Meds Review" is active
  And the Meds Review Applet contains data rows
  When user refreshes Meds Review Applet
  Then the message on the Meds Review Applet does not say "An error has occurred"

@f144_active_medications_expand_minimize
Scenario: Coversheet Active Medications can be expanded
  And user searches for and selects "Eightyeight,Patient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  When the user expands the Active & Recent Medications applet
  Then "Meds Review" is active
  When the user minimizes the Meds Review applet
  Then the user is returned to the coversheet 
  
@f297_active_meds_info_button_integration_overview
Scenario: Verify Active Meds applet on overview page has info button toolbar
  When user searches for and selects "Eightyeight,Patient"
  And Overview is active
  And active meds gist is loaded successfully
  And user opens the first active medication gist item
  Then active meds info button is displayed
  
@f297_active_meds_info_button_integration_coversheet
Scenario: Verify Active Meds applet on coversheet page has info button toolbar
  When user searches for and selects "Eightyeight,Patient"
  And Cover Sheet is active
  And active meds summary view is loaded successfully
  And user opens the first active medication summary item
  Then active meds info button is displayed
  
@f297_active_meds_info_button_integration_expand_view
Scenario: Verify active medication applet expanded view has info button toolbar
  When user searches for and selects "Eightyeight,Patient"
  And Overview is active
  And user navigates to active meds expanded view 
  And user opens the first medication row
  Then active meds info button is displayed


