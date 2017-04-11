@F144_TimelineApplet_Modals @regression @data_specific @triage

Feature: F144-eHMP Viewer GUI - Timeline(NewsFeed) - Modal Tests

@f144_timeline_visit_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Visits
  # Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Visit" detail view
  Then the modal is displayed
  And the modal's title is "Event (Historical)"
  And the Timeline event "Visit" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Location        | 
      | Stop Code       | 
      | Facility        | 
      
@f144_timeline_admission_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Admissions
  # Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Admission" detail view
  Then the modal is displayed
  And the modal's title is "Hospitalization"
  And the Timeline event "Admission" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Location        | 
      | Stop Code       | 
      | Facility        | 
      | Movements		|
      | Reason			|
      
@f144_timeline_discharge_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Discharge
  # Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Discharge" detail view
  Then the modal is displayed
  And the modal's title is "Hospitalization"
  And the Timeline event "Discharge" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Location        | 
      | Stop Code       | 
      | Facility        | 
      | Providers		|
      | Movements		|
      | Reason			|
      
@f144_timeline_immunization_modal_details @F893 @US3313 @DE5248
Scenario: Users will be able to view modal popup for event Discharge
  # Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURNINETEEN,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Immunization" detail view
  Then the modal is displayed
  And the modal's title is "Vaccine - PNEUMOCOCCAL, UNSPECIFIED FORMULATION"
  And the Timeline event "Immunization" Detail modal displays 
      | modal item        |
      | Name              | 
      | Date Administered | 
      | Location          | 
      | Administered By   | 


@f144_timeline_surgery_modal_details @data_specific @DE2907 @DE3334 @DE4552 @debug
Scenario: Users will be able to view modal popup for event Surgery
  # Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Surgery" detail view
  Then the modal is displayed
  And the modal's title is "biospy"
  And the Timeline event "Surgery" Detail modal displays 
      | modal item      |
      | Facility        | 
      | Type            | 
      | Status          | 
      | Date/Time       | 
      | Providers       | 

@f144_timeline_procedure_modal_details @data_specific @DE3334 @DE4552 @debug
Scenario: Users will be able to view modal popup for event Procedure
  # Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Procedure" detail view
  Then the modal is displayed
  And the modal's title is "pulmonary function interpret"
  And the Timeline event "Procedure" Detail modal displays 
      | modal item      |
      | Facility        | 
      | Type            | 
      | Status          | 
      | Date/Time       | 
      
@f144_timeline_appointment_modal_details @data_specific
Scenario: Users will be able to view modal popup for event DoD Appointment
  # Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Appointment" detail view
  Then the modal is displayed
  And the modal's title is "ROUT"
  And the Timeline event "Appointment" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Appointment Status|
      | Location        | 
      | Stop Code       | 
      | Facility        | 
      | Providers		|
      | Reason			|
      
@f144_timeline_dod_encounter_modal_details @data_specific
Scenario: Users will be able to view modal popup for event DoD Encounter
  # Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Encounter" detail view
  Then the modal is displayed
  And the modal's title is "OUTPATIENT"
  And the Timeline event "Encounter" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Location        | 
      | Stop Code       | 
      | Facility        | 
      | Providers		|
      
@f144_timeline_lab_modal_details @data_specific @debug @DE4207
Scenario: Users will be able to view modal popup for event Lab
  # Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFORTYSEVEN,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  When the user views the first Timeline event "Lab" detail view
  Then the modal is displayed
  And the modal's title is "GLUCOSE - SERUM"
  And the Timeline event "Lab" Detail modal displays 
      | modal item      |
      | Date			|
      | Lab Test		|
      | Flag			|
      | Result			|
      | Unit			|
      | Ref Range		|
      | Facility		|