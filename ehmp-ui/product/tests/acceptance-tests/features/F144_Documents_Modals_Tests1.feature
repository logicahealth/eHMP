@documents_modal_details1 @regression @data_specific @documents_applet @F1135 @reg2
Feature: F144 - eHMP Viewer GUI - Documents - (Modal Detail Verification)

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Ninetynine,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  And the Documents Applet grid is loaded

@documents_next_previous
Scenario: Verify user can step through the documents using the next button / previous button
  When the user scrolls the Documents Applet
  Given the user notes the first 10 documents
  And clicks the first result in the Documents Applet
  Then the modal is displayed
  And the user can step through the documents using the next button
  And the user can step through the documents using the previous button

@documents_next_button
Scenario: Verify next button is disabled for last detail modal
  Given the user scrolls the Documents Applet
  And clicks the last result in the Documents Applet
  When the modal is displayed
  Then the next button is disabled

@documents_previous_button
Scenario: Verify previous button is disabled for first detail modal
  Given the user scrolls the Documents Applet
  And clicks the first result in the Documents Applet
  When the modal is displayed
  Then the previous button is disabled

@f144_documents_discharge_summary_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Discharge Summary
Given there is at least one document of type "Discharge Summary"
  When the user views the first Documents event "Discharge Summary" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Attending		|
      | Date/Time		|
      | Expected cosigner|

@f144_documents_progress_note_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Progress Note
  Given there is at least one document of type "Progress Note"
  When the user views the first Documents event "Progress Note" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		    |
      | Author			    |
      | Status			    |
      | Date/Time		    |


@f144_documents_procedure_modal_details @data_specific @DE4549
Scenario: Users will be able to view modal popup for event Procedure
  Given there is at least one document of type "Procedure"
  When the user views the first Documents event "Procedure" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Type			|
      | Status			|
      | Date/Time		|

@f144_documents_surgery_modal_details @data_specific @DE4549
Scenario: Users will be able to view modal popup for event Surgery
  Given there is at least one document of type "Surgery"
  When the user views the first Documents event "Surgery" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Type			|
      | Status			|
      | Date/Time		|
      | Providers		|

@f144_documents_advance_directive_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Advance Directive
  Given there is at least one document of type "Advance Directive"
  When the user views the first Documents event "ADVANCE DIRECTIVE" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|

@f144_documents_imaging_modal_details @data_specific @DE4549
Scenario: Users will be able to view modal popup for event Imaging
  Given there is at least one document of type "Imaging"
  When the user views the first Documents event "Imaging" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Type			|
      | Status			|
      | Date/Time		|
      | Providers		|
