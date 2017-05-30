@US2800    @DE6991 @DE6976 @reg2
Feature:F144 - eHMP viewer GUI - Vitals
#Team Neptune, inherited by Team venus

@US2800g @DE6976
Scenario: Expanding Vitals applet from coversheet returns to coversheet
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,PATIENT"
  Then Cover Sheet is active
  When the user expands the vitals applet
  Then the expanded vitals applet is displayed
  When the user minimizes the vitals applet
  Then the user is returned to the coversheet

@US2800_coversheet_only2 @vimm_observed @DE2875 
Scenario: User views vitals coversheet to view data
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,PATIENT"
  Then Cover Sheet is active
  And the user has selected All within the global date picker
  And the "Vitals Coversheet" contain 5 items 
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
   And the Coversheet Vitals table displays no data for 
    | label | 
    | CG    | 


@US2800e @US18204
Scenario: User views vitals expanded applet
  # Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,Patient"
  Then Cover Sheet is active
  Then the user expands the vitals applet
  Then the expanded vitals applet is displayed
  Then the Vitals expanded headers are
      | Headers       |
      | Observed      |
      | Type          |
      | Result        |
      | Entered       |
      | Qualifiers    |
      | Facility      |


@US2800b @DE306 @DE416 @DE1264 @US2800d @US4321
Scenario: User uses the vitals expanded view to filter
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  When the user expands the vitals applet
  Then the expanded vitals applet is displayed
  And the user clicks the All vitals range
  And the user filters the Vitals Applet by text "BAY"
  Then the vitals table only diplays rows including text "BAY"

@US2800c @DE241 @vimm_observed @DE1794
Scenario: User uses the vitals expanded view to filter by date
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
   When the user expands the vitals applet
  Then the expanded vitals applet is displayed
  When the user clicks the "1 yr Vitals Range"
  Then the Expanded Vitals applet only displays rows from the last 1 year
  When the user clicks the "24 hr Vitals Range"
  Then the Expanded Vitals applet only displays rows from the last 24 hours


@f144_vitals_modal_details @data_specific @US18204 @DE4976 @DE6010
Scenario: Users will be able to view modal popup for a particular vital 
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  When the user expands the vitals applet
  And the user clears any existing filters
  And the user clicks the All vitals range
  When the user views the first Vital detail view
  Then the modal is displayed
  And the modal's title is "Body Mass Index"
  And the Vital Detail modal displays 
      | modal item     |
      | Vital          | 
      | Result         | 
      | Observed       | 
      | Facility       | 
      | Type		   |
      | Entered        |
        
@f144_vitals_applet_summary_view_refresh 
Scenario: Vitals Summary applet displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  Then the "Vitals" applet is displayed
  And the Vitals Applet contains data rows
  When user refreshes Vitals Applet
  Then the message on the Vitals Applet does not say "An error has occurred"
  
@f144_vitals_applet_expand_view_refresh 
Scenario: Vitals expand view applet displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  Then the "Vitals" applet is displayed
  Then the user expands the vitals applet
  And the user clicks the All vitals range
  And the Vitals Applet contains data rows
  When user refreshes Vitals Applet
  Then the message on the Vitals Applet does not say "An error has occurred"
  
@f297_vitals_info_button_integration_overview
Scenario: Verify Vitals applet on overview page has info button toolbar
  When user searches for and selects "eight,patient"
  Then Overview is active
  And the user has selected All within the global date picker
  And vitals gist is loaded successfully
  When user opens the first vitals gist item
  Then vitals info button is displayed
 
@f297_vitals_info_button_integration_expand_view
Scenario: Verify Vitals applet expanded view has info button toolbar
  When user searches for and selects "eight,patient"
  Then Overview is active
  And user navigates to Vitals expanded view 
  And the user clicks the All vitals range
  When user opens the first Vitals row
  Then vitals info button is displayed
