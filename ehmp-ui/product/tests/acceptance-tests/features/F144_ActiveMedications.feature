@F144_ActiveMedications @activemeds_applet  @reg2
Feature: F144 - eHMP Viewer GUI - Active Medications

# Team: Jupiter

Background: 
  Given user searches for and selects "Onehundredninetysix,Patient"

@f144_1_active_medications_applet_inclusion @US2954 @US9493 @US8845
Scenario: User views active medications on coversheet

  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  # US8845
  Then the Active and Recent Medications applet is titled "Active & Recent Medications"
  And the Active & Recent Medications Applet table contains headers
    | Medication | Status | Facility |
  And the Active & Recent Medications Applet table finishes loading

@f144_2_active_medications_detail @US2954 @DE831 @DE3798 @DE5017 @activemedmodal
Scenario: Viewing modal details for  Active & Recent Medications.
  Given Cover Sheet is active
  And active meds summary view is loaded successfully
  And user views first active medication details
  Then the Active Medication modal is displayed

  
@f144_active_medications_refresh 
Scenario: Active Medications applet displays all of the same details after applet is refreshed

  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  And the Active Medications Applet table contains data rows
  When user refreshes Active Medications Applet
  Then the message on the Active Medications Applet does not say "An error has occurred"
  
@f144_active_medications_expand_applet_refresh 
Scenario: Active Medications expand view applet displays all of the same details after applet is refreshed

  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  When the user navigates to the expanded Active Medications Applet
  Then Medication Review applet is loaded successfully
  When user refreshes Meds Review Applet
  Then the message on the Meds Review Applet does not say "An error has occurred"

@f144_active_medications_expand_minimize @DE6976
Scenario: Coversheet Active Medications can be expanded

  When Cover Sheet is active
  Then the "Active & Recent Medications" applet is displayed
  When the user expands the Active & Recent Medications applet
  Then Medication Review applet is loaded successfully
  When the user minimizes the Meds Review applet
  Then the user is returned to the coversheet 
