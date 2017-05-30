# Team Mercury
@F144 @cwad   @reg2
Feature: F144-eHMP Viewer GUI - Crisis Notes, Warnings, Allergies, Directives (CWAD)
The user should be able look at CWAD flags in patient header

@US3584_3_cwad @DE979 @DE3241
Scenario: The user can identify when a patient has postings
  # Given user is logged into eHMP-UI
  When user searches for and selects "Eight,Inpatient"
  Given Overview is active
  Then the following postings are active
    | Posting   |
    | Allergies |
  And the following postings are inactive
    | Posting       |
    | Crisis Notes  |
    | Warnings      |
    | Patient Flags |
    | Directives    |

@US3584_4_cwad @DE979
Scenario: The user can identify when a patient has postings
  # Given user is logged into eHMP-UI
  When user searches for and selects "Sixhundred, Patient"
  Given Overview is active
  And the following postings are inactive
    | Posting       |
    | Crisis Notes  |
    | Warnings      |
    | Patient Flags |
    | Directives|
    | Allergies |