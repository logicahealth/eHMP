#POC: Team Jupiter

@F281_medication_gist   @reg2 
Feature: F281 - Intervention Gist View - Medication
As a clinician using the interventions active and medication gist view I need a view of active outpatient 
medications that contains: the qualified medication name (to be replaced by normalized medication name) 

Background:
  Given user searches for and selects "Onehundredninetysix,Patient"

@F281_1_ActiveOutpatientMedicationGist @DE831 @US8845 @US8844
Scenario: User is able to view all active outpatient medication in a gist view under overview

	Then Overview is active
	Then the "Active & Recent MEDICATIONS" gist is displayed
  Then the Active and Recent Medications applet is titled "Active & Recent Medications"
  And the Medications Gist overview table contains headers
  | headers |
  | Medication |
  | Refills |
 And the Medications Gist Applet contains buttons Refresh, Help, Filter Toggle, Expand
  And the Medications Gist Applet displays results
 

@F281_2_ActiveOutpatientMedicationGist @US3388 @US4274 @DE831  @DE1388
Scenario: User is able to view all active outpatient medication in a gist view under overview

	Then Overview is active
	Then the "Active & Recent MEDICATIONS" gist is displayed
  And the medication gist view displays at least 1 result
  When user views the details for a medication in Medications Gist
	Then the modal is displayed
	

@F281_3_ActiveMedicationGist_filter @US3669 @US4274 @DE831 @DE1269
Scenario: User is able to filter medications by text

	Then Overview is active
	Then the "Active & Recent MEDICATIONS" gist is displayed
  And the medication gist view displays at least 2 result
  When the user clicks the control "Filter Toggle" in the "Medications Gist applet"
  And the user filters the Medications Gist Applet by text "Lisinopril"
  Then the Medications Gist table only diplays rows including text "Lisinopril"


@F281_4_ActiveMedicationGist_ExpandView @US4274 @vimm @DE831  @DE1482
Scenario: View Medications Applet Single Page by clicking on Expand View

  Then Overview is active
  Then the "Active & Recent MEDICATIONS" gist is displayed
  When the user clicks the control "Expand View" in the "Medications Gist applet"
  Then "Meds Review" is active
  And the title of the page says "MEDICATION REVIEW" in Meds Review Applet
  And user sees "Outpatient Meds Group" and "Inpatient Meds Group" in Meds Review Applet
  
@F281_5_ActiveMedicationGist_Column_Sorting_Medication @US4684 @DE831
Scenario: Medication Applet is sorted by the column header medication

  Then Overview is active
  Then the "Active & Recent MEDICATIONS" gist is displayed
  And the user sorts the Medication Gist by column Medication
  Then the Medication Gist is sorted in alphabetic order based on Medication
  And the user sorts the Medication Gist by column Medication
  Then the Medication Gist is sorted in reverse alphabetic order based on Medication  
  
@f281_active_medication_gist_refresh 
Scenario: Active Medications Gist applet displays all of the same details after applet is refreshed

  Then Overview is active
  Then the "Active & Recent MEDICATIONS" gist is displayed
  And the Active Medications Gist Applet table contains data rows
  When user refreshes Active Medications Applet
  Then the message on the Active Medications Applet does not say "An error has occurred"
  
@f281_active_medications_gist_expand_applet_refresh 
Scenario: Active Medications Gist expand view applet displays all of the same details after applet is refreshed

  Then Overview is active
  Then the "Active & Recent MEDICATIONS" gist is displayed
  When the user clicks the control "Expand View" in the "Active Medications Applet"
  Then "Meds Review" is active
  And the Meds Review Applet contains data rows
  When user refreshes Meds Review Applet
  Then the message on the Meds Review Applet does not say "An error has occurred"

@F281_7_ActiveMedicationGist @F281_7_ActiveMedicationGist_modal @data_specific
Scenario: Verify medication modal pop-up detail

  Then Overview is active
  Then the "Active & Recent MEDICATIONS" gist is displayed
  And the Active Medications Gist Applet table contains data rows
  When user views the details for a medication in Medications Gist
  Then the modal is displayed


