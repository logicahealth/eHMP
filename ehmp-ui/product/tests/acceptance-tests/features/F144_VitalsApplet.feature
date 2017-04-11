@US2800 @regression  @triage
Feature:F144 - eHMP viewer GUI - Vitals
#Team Neptune, inherited by Team venus



@US2800g
Scenario: Expanding Vitals applet from coversheet returns to coversheet
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,PATIENT"
  Then Cover Sheet is active
  When the user expands the vitals applet
  Then the expanded vitals applet is displayed
  When the user minimizes the vitals applet
  Then Cover Sheet is active

@US2800_coversheet_only2 @vimm_observed @DE2875 
Scenario: User views vitals coversheet to view data
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,PATIENT"
  Then Cover Sheet is active
  And the "Vitals Coversheet" contain 4 items 
  And the Coversheet Vitals table contains 
    | label | value | date |
    | BP    | FORMATTED | FORMATTED |
    | P     | FORMATTED | FORMATTED |
    | R     | FORMATTED | FORMATTED |
    | T     | FORMATTED | FORMATTED |
    |WT     | FORMATTED | FORMATTED |
    |BMI    | FORMATTED | FORMATTED |
    |PO2    | FORMATTED | FORMATTED |
    |PN     | FORMATTED | FORMATTED |


@US2800e
Scenario: User views vitals expanded applet
  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,Patient"
  Then Cover Sheet is active
  Then the user expands the vitals applet
  Then the expanded vitals applet is displayed
  Then the Vitals expanded headers are
    | Headers |
    | Date Observed|
    | Type |
    | Result |
    | Date Entered |
    | Qualifiers |
    | Facility |


@US2800b @DE306 @DE416 @DE1264
Scenario: User uses the vitals expanded view to filter
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  When the user expands the vitals applet
  Then the expanded vitals applet is displayed
  And the user filters the Vitals Applet by text "BAY"
  Then the vitals table only diplays rows including text "BAY"

@US2800c @DE241 @vimm_observed @DE1794
Scenario: User uses the vitals expanded view to filter by date
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
   When the user expands the vitals applet
  Then the Vitals expanded headers are
    | Headers      |
    | Date Observed|
    | Type         |
    | Result       |
    | Date Entered |
    | Qualifiers   |
    | Facility     |
  When the user clicks the "1 yr Vitals Range"
  Then the Expanded Vitals applet only displays rows from the last 1 year
  When the user clicks the "24 hr Vitals Range"
  Then the Expanded Vitals applet only displays rows from the last 24 hours

@US2800d @US4321 @DE169 @vimm_observed @vimm
Scenario: User uses the vitals expanded view to filter 
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  Then the "patient identifying traits" is displayed with information
    | field			| value 				|
    | patient name	| Eight,Patient 			|
  When the user expands the vitals applet
  Then the Vitals expanded headers are
    | Headers |
    |Date Observed|
    | Type |
    | Result |
    | Date Entered |
    | Qualifiers |
    | Facility |
  #When the user clicks the all-range-vitals
  #And the user views all the vitals rows
  And the user filters the Vitals Applet by text "BAY"
  Then the vitals table only diplays rows including text "BAY"

@f144_vitals_modal_details @data_specific
Scenario: Users will be able to view modal popup for a particular vital 
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  When the user expands the vitals applet
  When the user views the first Vital detail view
  Then the modal is displayed
  And the modal's title is "Body Mass Index"
  And the Vital Detail modal displays 
      | modal item     |
      | Vital          | 
      | Result         | 
      | Date Observed  | 
      | Facility       | 
      | Type		   |
      | Date Entered   |
        
@f144_vitals_applet_summary_view_refresh 
Scenario: Vitals Summary applet displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  Then the "Vitals" applet is displayed
  And the Vitals Applet contains data rows
  When user refreshes Vitals Applet
  Then the message on the Vitals Applet does not say "An error has occurred"
  
@f144_vitals_applet_expand_view_refresh 
Scenario: Vitals expand view applet displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  Then the "Vitals" applet is displayed
  Then the user expands the vitals applet
  And the Vitals Applet contains data rows
  When user refreshes Vitals Applet
  Then the message on the Vitals Applet does not say "An error has occurred"
