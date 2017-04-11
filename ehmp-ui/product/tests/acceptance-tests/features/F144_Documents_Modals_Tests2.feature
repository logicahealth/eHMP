@documents_modal_details2  @data_specific @reg2
Feature: F144 - eHMP Viewer GUI - Documents - (Modal Detail Verification2)

#Background:
  # Given user is logged into eHMP-UI
  
@f144_documents_crisis_note_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Discharge Summary
  And user searches for and selects "Five,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  Then "Documents" is active
  Given there is at least one document of type "Crisis Note"
  When the user views the first Documents event "CRISIS NOTE" detail view
  Then a modal with the title "crisis note" is displayed
  And the Documents event "Crisis Note" Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|
      
@f144_documents_lab_report_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Lab Report
  And user searches for and selects "ZZZRETFOURFORTYSEVEN,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  Then "Documents" is active
  Given there is at least one document of type "Laboratory Report"
  When the user views the first Documents event "Laboratory Report" detail view
#  Then a modal with the title "lr microbiology report" is displayed
  And the Documents event "Lab Report" Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|
   
@f144_documents_administrative_note_modal_details @data_specific @DE3038 @DE4549
Scenario: Users will be able to view modal popup for event Administrative Note
  And user searches for and selects "GRAPHINGPATIENT,TWO"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  Then "Documents" is active
  Given there is at least one document of type "Administrative Note"
  When the user views the first Documents event "Administrative Note" detail view
  Then a modal with the title "administrative note" is displayed
  And the Documents event "Administrative Note" Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|

@f144_documents_dod_note_modal_details @data_specific @DE3038 @DE4549
Scenario: Users will be able to view modal popup for event Progress Note DoD*
  And user searches for and selects "Onehundredsixteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Applet
  Then "Documents" is active
  Given there is at least one document of type "Progress Note"
  When the user views the first Documents event "Progress Note" detail view
  Then a modal with the title "progress note" is displayed
  And the Documents event "Progress Note DoD*" Detail modal displays 
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|
      
 