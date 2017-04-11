@F294_reports_gist @regression @triage
Feature: F294 : Documetns Applet - Summary View
As a clinician I would like to have a summary view of documents that contains only items 
that are reports so that I can quickly get to information on reports

#POC: Team Jupiter
@US4157_modal
Scenario Outline: 
  Given user is logged into eHMP-UI
  And user searches for and selects "<patient>"
  Then Overview is active
  And the user has selected All within the global date picker
  And the Reports Gist Applet contains data rows
  And the Reports Gist table contains "<report_type>" Type(s)
  When the user views the details for the first "<report_type>" Report
  Then the modal is displayed
  And the Report Detail modal displays 
      | field               |
      | Type Label          |
      | Type                |

Examples:
  | patient | report_type |
  | ZZZRETFOURFORTYSEVEN, Patient | Procedure   |
  | ZZZRETFOURFORTYSEVEN, Patient | Imaging     |
  | NINETYNINE, PATIENT | Consult     |

@US4157_modal
Scenario Outline: 
  Given user is logged into eHMP-UI
  And user searches for and selects "<patient>"
  Then Overview is active
  And the user has selected All within the global date picker
  And the Reports Gist Applet contains data rows
  And the Reports Gist table contains "<report_type>" Type(s)
  When the user views the details for the first "<report_type>" Report
  Then the modal is displayed

Examples:
  | patient | report_type |
  | ZZZRETFOURFORTYSEVEN, Patient | Laboratory Report |


@F294_1_ReportsGistDisplay @US4157
Scenario: View Reports Gist View on the overview screen
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  Then Overview is active
  And the Reports Gist Applet table contains headers
    | Date | Type |  Entered By |
  
@F294_2_ReportsGistDisplay_procedure @US4157 
Scenario: View procedure in reports gist
  Given user is logged into eHMP-UI
  #And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT" #DE2907
  And user searches for and selects "EIGHT,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And the Reports Gist Applet contains data rows
  And the Reports Gist table contains "Procedure" Type(s)
      
@F294_3_ReportsGistDisplay_consult @US4157
Scenario: View consult in reports gist
  Given user is logged into eHMP-UI
  And user searches for and selects "NINETYNINE,PATIENT"
  Then Overview is active
  And user sees Reports Gist
  And the user has selected All within the global date picker
  And the Reports Gist Applet contains data rows
  And the Reports Gist table contains "Consult" Type(s)

#Need image transformation so 'Author or Verifier' will work
@F294_4_ReportsGistDisplay_imaging_labreport @US4157
Scenario: View imaging and lab reports in reports gist
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFORTYSEVEN"
  Then Overview is active
  And the user has selected All within the global date picker
  And the Reports Gist Applet contains data rows
  And the Reports Gist table contains "Imaging" Type(s)
  And the Reports Gist table contains "Laboratory Report" Type(s)

      
@F285_6_ReportsGist_extended_view @US4157
Scenario: Clicking on extension will go to the reports table view
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  When the user clicks the control Expand View in the Reports Gist applet
  Then the expanded Reports Applet is displayed
  Then title of the Reports Applet says "Reports"
  
@f285_reports_gist_refresh 
Scenario: Reports Gist displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  #And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT" #DE2907
  And user searches for and selects "EIGHT,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And the Reports Gist Applet contains data rows
  When user refreshes Reports Gist Applet
  Then the message on the Reports Gist Applet does not say "An error has occurred"
  
@f285_reports_gist_exapnd_view_refresh 
Scenario: Reports Gist expand view displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "EIGHT,PATIENT"
  Then Overview is active
  And user sees Reports Gist
  And the user has selected All within the global date picker
  When the user clicks the control "Expand View" in the "Reports Gist applet"
  Then the expanded Reports Applet is displayed
  And the Reports Gist Applet expand view contains data rows
  When user refreshes Reports Gist Applet expand view
  Then the message on the Reports Gist Applet expand view does not say "An error has occurred"

@f285_reports_gist_filter @US4157
Scenario: User is able to filter reports
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight, Patient"
  Then Overview is active
  And the user has selected All within the global date picker
  And the Reports Gist Applet contains data rows
  When the user opens the Report Gist Applet filter
  And the user filters the Reports Gist Applet by text "Consult"
  Then the Reports Gist table only diplays rows including text "Consult"
  
#following test works only in the browser
@f285_reports_gist_exapnd_view_modal_detail @data_specific @future
Scenario: From Reports Gist expand view user can view report details
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  Then Overview is active
  And user sees Reports Gist
  And the user has selected All within the global date picker
  When the user clicks the control "Expand View" in the "Reports Gist applet"
  Then the expanded Reports Applet is displayed
  When the user views the first Report detail view
  Then the inframe modal details is displayed
  And the modal title says "Biospy Details"
