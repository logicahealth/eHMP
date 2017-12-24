@f338_MedReviewApplet @Medication_Review_applet @reg4

Feature: F338 - Meds Review Sparkline 2 -  Med Review applet display

#POC:Team Jupiter

@f338_1_medReviewApplet_navigation_thro_dropdown @US5421
Scenario: User navigates to Meds Review Applet from default screen.
  # Given user is logged into eHMP-UI
  And user searches for and selects "fourteen,Patient"
  Then Overview is active
  When user selects Meds Review from drop down menu
  Then "Medication Review" is active

@F338-1.7 @f338_2_medication_grouping @US5421
Scenario: Display of medication grouping by medication type for inpatient and outpatient
  # Given user is logged into eHMP-UI
  And user searches for and selects "fourteen,Patient"
  When user navigates to Meds Review Applet
  Then "Medication Review" is active
  And the title of the page says "MEDICATION REVIEW" in Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  And user sees "Outpatient Meds Group" and "Inpatient Meds Group" and "Clinic Order Meds Group" in Meds Review Applet

@F338-1 @F338-1.6 @F338-1.9 @F1.16 @f338_3_medication_summary_outpatient_meds @US5421 @US4608 @US5429 @US8844 @summarycheck
Scenario: Display of medication summary for outpatient medications
  # Given user is logged into eHMP-UI
  And user searches for and selects "fourteen,Patient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  # US8844
  And "outpatient" summary view contains headers in Meds Review Applet
  | Name  | Sig | Facility | Status/Fillable | 
  And Outpatient Meds Group summary view displays medications

@F338-8 @f338_4_medication_detail_outpatient_meds @US5421 @DE1421 @DE1564 @DE1983
Scenario: Display of medication details for outpatient medications
  # Given user is logged into eHMP-UI
  Given user searches for and selects "fourteen,Patient"
  And user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And the Meds Review applet displays at least 1 outpatient medication
  When the user views the details of an outpatient med
  Then the detail view displays
      | header             |
      | Order History      |
      | Links              |
      | Patient Education  |

@f338_9_medication_detail_inpatient_meds @US5421 @DE1421 @DE1564 @DE1983
Scenario: Display of medication details for inpatient medications
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Inpatient Meds Group summary view displays medications
  When the user views the details of an inpatient med
  Then the detail view displays
      | header             |
      | Order History      |
      | Links              |
      | Patient Education  |
      
@f338_5_medication_column_default_and_sorting_name @US5903 @DE1479  
Scenario: Med Review Applet is sorted by the status first and then by name in alpha order.
  Given user searches for and selects "fourteen,Patient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  When user sorts the Medication Review applet by column header Name
  Then the Medication Review applet is sorted in alphabetic order based on column Name
  When user sorts the Medication Review applet by column header Name
  Then the Medication Review applet is sorted in reverse alphabetic order based on column Name

@f338_6_medication_column_sorting_sig @US5421
Scenario: Med Review Applet is sorted by the column header Sig.
  Given user searches for and selects "FOURTEEN,PATIENT"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  When user sorts the Medication Review applet by column header Sig
  Then the Medication Review applet is sorted in alphabetic order based on column Sig
  When user sorts the Medication Review applet by column header Sig
  Then the Medication Review applet is sorted in reverse alphabetic order based on column Sig

@F338-2 @F338-2.1 @f338_8_medication_summary_inpatient_meds @US5421 @US8844 @summarycheck
Scenario: Display of medication summary for inpatient medications
  # Given user is logged into eHMP-UI
  And user searches for and selects "Ten,Inpatient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  And "inpatient" summary view contains headers in Meds Review Applet
  | Name  | Sig | Facility | Status/Next |
  And Inpatient Meds Group summary view displays medications

@f338_11_medication_filtering @US5421 @DE2666
Scenario: Display of medication summary for outpatient medications after searching for a specific string
  # Given user is logged into eHMP-UI
  And user searches for and selects "fourteen,Patient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  And the user clicks on search filter in Meds Review Applet
  And the user filters the Medication Review Applet by text "Aspirin"
  Then the Medication Review table only diplays rows including text "Aspirin"

@f144_meds_review_refresh
Scenario: Meds Review Applet displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  And user searches for and selects "fourteen,Patient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  When user refreshes Meds Review Applet
  Then the message on the Meds Review Applet does not say "An error has occurred"

