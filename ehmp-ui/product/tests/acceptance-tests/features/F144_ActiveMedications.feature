@F144_ActiveMedications @regression @triage
Feature: F144 - eHMP Viewer GUI - Active Medications

# Team: Jupiter

@f144_1_active_medications_applet_inclusion @US2954 @US9493 @US8845
Scenario: User views active medications on coversheet
  Given user is logged into eHMP-UI
  Given user searches for and selects "One,Outpatient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  # US8845
  Then the Active and Recent Medications applet is titled "Active & Recent Medications"
  And the Active & Recent Medications Applet table contains headers
    | Medication | Status | Facility |
  And the Active & Recent Medications Applet table finishes loading

@f144_2_activie_medications_deatail @US2954 @DE831 @debug @DE3798
Scenario: Viewing modal details for  Active & Recent Medications.
  Given user is logged into eHMP-UI
  Given user searches for and selects "One,Outpatient"
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
  Given user is logged into eHMP-UI
  Given user searches for and selects "One,Outpatient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  And the Active Medications Applet table contains data rows
  When user refreshes Active Medications Applet
  Then the message on the Active Medications Applet does not say "An error has occurred"
  
@f144_active_medications_expand_applet_refresh 
Scenario: Active Medications expand view applet displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  # And user searches for and selects "eightyeight,patient"
  And user searches for and selects "One,Outpatient"
  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  When the user clicks the control "Expand View" in the "Active Medications Applet"
  Then "Meds Review" is active
  And the Meds Review Applet contains data rows
  When user refreshes Meds Review Applet
  Then the message on the Meds Review Applet does not say "An error has occurred"



