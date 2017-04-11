@f338_MedReviewApplet @regression

Feature: F338 - Meds Review Sparkline 2 -  Med Review applet display


@F338-6 @F338-1.4 @f338_10_medication_global_datefilter @US5421 @future
Scenario: Display of medication summary for outpatient for a custom date range
  Given user is logged into eHMP-UI
  And user searches for and selects "Fourteen,Patient"
  When user navigates to Meds Review Applet
  Then "Meds Review" is active
  And the user clicks the control "Date Filter" in the "Med Review Applet"
  And the user inputs "01/01/2009" in the "From Date" control in the "Med Review Applet"
  And the user clicks the control "Apply" in the "Med Review Applet"
  #When user expands "Outpatient Meds Group" in Meds Review Applet
  And "Outpatient Meds Group" summary view contains medications in Meds Review Applet
      | Name                    | Sig           | Fillable 	|
      | METFORMIN        | 500MG PO BID  | Expired 5y	|
      | METOPROLOL  | 50MG PO BID   | Expired 4y	|
      | SIMVASTATIN          | 40MG PO QPM   | Expired 4y	|

  When user selects medication "METFORMIN TAB,SA" in Meds Review Applet
  Then user selects from the menu medication review detail icon for "METFORMIN TAB,SA" in Meds Review Applet
  Then OrderHx date range shows
  | 02/27/2010 - 05/28/2010 |
  | 02/27/2010 - 05/28/2010 |