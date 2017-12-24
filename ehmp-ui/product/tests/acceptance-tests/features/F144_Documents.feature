@documents_summary_and_details @regression @DE1786 @documents_applet @F1135 @reg4
Feature: F144 - eHMP Viewer GUI - Documents

#POC:Team Jupiter

@f144_16_documents_default_display  @US2593 @DE1480 @DE1735
Scenario: Documents grouping by Date/Time
  Given user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  And user navigates to Documents Screen
  And the Documents Applet grid is loaded
  When the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  Then the user sees date groups in the Documents Applet

@f144_17_documents_default_display  @US2593 @DE1480 @DE1735
Scenario: date/time can be clicked and collapsed
  Given user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  And user navigates to Documents Screen
  And "Documents" is active
  And the user has selected All within the global date picker
  And the Documents Applet grid is loaded
  And the user sees date groups in the Documents Applet
  When the user clicks on the first date group in the Documents Applet
  Then the date group collapses and displays a row count

@f144_24_documents_date_filter @US2594
Scenario: Documents applet is able to filter data based date filter search
  And user searches for and selects "EIGHT,PATIENT"

  When user navigates to Documents Screen
  Then "Documents" is active
  And the user clicks the control "Date Filter" in the "Documents Applet"
  And the Global Date Filter contains expected buttons

  When the user changes the global date filter to 2YR
  And the Documents Applet grid is loaded
  Then the Documents Applet displays records within 2YR ( or none )

  When the user changes the global date filter to 1YR
  And the Documents Applet grid is loaded
  Then the Documents Applet displays records within 1YR ( or none )


  When the user changes the global date filter to 3M
  And the Documents Applet grid is loaded
  Then the Documents Applet displays records within 3M ( or none )

  When the user changes the global date filter to 1M
  And the Documents Applet grid is loaded
  Then the Documents Applet displays records within 1M ( or none )

  When the user changes the global date filter to 7D
  And the Documents Applet grid is loaded
  Then the Documents Applet displays records within 7D ( or none )

  When the user changes the global date filter to 72HR
  And the Documents Applet grid is loaded
  Then the Documents Applet displays records within 3D ( or none )

  When the user changes the global date filter to 24HR
  And the Documents Applet grid is loaded
  Then the Documents Applet displays records within 1D ( or none )


