@documents_modal_details2 @regression @data_specific @documents_applet @F1135 @reg2
Feature: F144 - eHMP Viewer GUI - Documents - (Modal Detail Verification2)

#Background:
  # Given user is logged into eHMP-UI

@f144_documents_crisis_note_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Discharge Summary
  And user searches for and selects "Five,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  Then "Documents" is active
  Given there is at least one document of type "Crisis Note"
  When the user views the first Documents event "CRISIS NOTE" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|

@f144_documents_lab_report_modal_details @data_specific
Scenario: Users will be able to view modal popup for event Lab Report
  And user searches for and selects "ZZZRETFOURFORTYSEVEN,Patient"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  Then "Documents" is active
  Given there is at least one document of type "Laboratory Report"
  When the user views the first Documents event "Laboratory Report" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|

@f144_documents_administrative_note_modal_details @data_specific @DE3038 @DE4549
Scenario: Users will be able to view modal popup for event Administrative Note
  And user searches for and selects "GRAPHINGPATIENT,TWO"
  And the user has selected All within the global date picker
  When user navigates to Documents Screen
  Then "Documents" is active
  Given there is at least one document of type "Administrative Note"
  When the user views the first Documents event "Administrative Note" detail view
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item      |
      | Facility		|
      | Author			|
      | Status			|
      | Date/Time		|

@documents_modal_dod
Scenario: Users will be able to view modal popup for document from secondary source - DoD
  Given user searches for and selects "Onehundredsixteen,Patient"
  And the user has selected All within the global date picker
  And user navigates to Documents Screen
  And "Documents" is active
  And there is at least one document from facility "DOD"
  When the user views the first Document detail view from facility "DOD"
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item  |
      | Facility    |
      | Author      |
      | Status      |
      | Date/Time   |

@documents_modal_NJ
Scenario: Users will be able to view modal popup for document from secondary source - NJ HCS
  Given user searches for and selects "Onehundredsixteen,Patient"
  And the user has selected All within the global date picker
  And user navigates to Documents Screen
  And "Documents" is active
  And there is at least one document from facility "New Jersey HCS"
  When the user views the first Document detail view from facility "New Jersey HCS"
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item  |
      | Facility    |
      | Status      |
      | Date/Time   |

@documents_modal_abilene
Scenario: Users will be able to view modal popup for document from secondary source - Abilene (CAA)
  Given user searches for and selects "Onehundredsixteen,Patient"
  And the user has selected All within the global date picker
  And user navigates to Documents Screen
  And "Documents" is active
  And there is at least one document from facility "ABILENE (CAA)"
  When the user views the first Document detail view from facility "ABILENE (CAA)"
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item  |
      | Facility    |
      | Author      |
      | Status      |
      | Date/Time   |

@documents_modal_troy
Scenario: Users will be able to view modal popup for document from secondary source - Troy
  Given user searches for and selects "Onehundredsixteen,Patient"
  And the user has selected All within the global date picker
  And user navigates to Documents Screen
  And "Documents" is active
  And there is at least one document from facility "TROY"
  When the user views the first Document detail view from facility "TROY"
  Then a modal with the expected Document title is displayed
  And the Documents Detail modal displays
      | modal item  |
      | Facility    |
      | Author      |
      | Status      |
      | Date/Time   |
