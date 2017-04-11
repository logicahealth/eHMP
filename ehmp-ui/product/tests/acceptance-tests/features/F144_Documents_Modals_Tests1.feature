@documents_modal_details1 @regression @data_specific
Feature: F144 - eHMP Viewer GUI - Documents - (Modal Detail Verification)

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Ninetynine,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  Then "Documents" is active
  
@f144_documents_discharge_summary_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Discharge Summary
  When the user views the first Documents event "Discharge Summary" detail view
  Then a modal with the title "Discharge Summary Details" is displayed
  And the Documents event "Discharge Summary" Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Attending		|
      | Date/Time		|
      | Expected Cosigner|
      
@f144_documents_progress_note_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Progress Note
  When the user views the first Documents event "Progress Note" detail view
  Then a modal with the title "general medicine note" is displayed
  And the Documents event "Progress Note" Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|
      
@f144_documents_procedure_modal_details @data_specific @DE4549 @debug
Scenario: Users will be able to view modal popup for event Procedure
  When the user views the first Documents event "Procedure" detail view
  Then a modal with the title "laparascopy" is displayed
  And the Documents event "Procedure" Detail modal displays 
      | modal item      |
      | Facility		|
      | Type			|
      | Status			|
      | Date/Time		|
      
@f144_documents_surgery_modal_details @data_specific @DE4549 @debug
Scenario: Users will be able to view modal popup for event Surgery
  When the user views the first Documents event "Surgery" detail view
  Then a modal with the title "left inguinal hernia repair with mesh" is displayed
  And the Documents event "Surgery" Detail modal displays 
      | modal item      |
      | Facility		|
      | Type			|
      | Status			|
      | Date/Time		|
      | Providers		|
      
@f144_documents_advance_directive_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Advance Directive
  When the user views the first Documents event "Advance Directive" detail view
  Then a modal with the title "advance directive completed" is displayed
  And the Documents event "Advance Directive" Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|
      
@f144_documents_imaging_modal_details @data_specific @DE4549 @debug
Scenario: Users will be able to view modal popup for event Imaging
  When the user views the first Documents event "Imaging" detail view
  Then a modal with the title "radiologic examination, ankle; 2 views" is displayed
  And the Documents event "Imaging" Detail modal displays 
      | modal item      |
      | Facility		|
      | Type			|
      | Status			|
      | Date/Time		|
      | Providers		|
 