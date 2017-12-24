#POC: Team Jupiter

@F281_medication_gist   @reg3 
Feature: F281 - Intervention Gist View - Medication
As a clinician using the interventions active and medication gist view I need a view of active outpatient 
medications that contains: the qualified medication name (to be replaced by normalized medication name) 

Background:
  Given user searches for and selects "Onehundredninetysix,Patient"


@F281_2_ActiveOutpatientMedicationGist @US3388 @US4274 @DE831 @DE1388 @activemedmodal
Scenario: User is able to view all active outpatient medication in a gist view under overview
	Given Overview is active
  And active meds gist is loaded successfully
  And the Active Medications Gist Applet table contains data rows
  When user views the details for a medication in Medications Gist
	Then the Active Medication modal is displayed
	
@activemed_quicklook
Scenario: Verify quicklook
  Given Overview is active
  And active meds gist is loaded successfully
  And the Active Medications Gist Applet table contains data rows
  When user views the quicklook for a medication in Medications Gist
  Then an active medication quick look table displays




