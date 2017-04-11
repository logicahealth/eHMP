@writeback @future
Feature: F414 - Enter and Store A Problem List

Background:
	Given a patient with pid "9E7A;66" has been synced through VX-Sync API for "9E7A" site(s)
	And the client requests "PROBLEM LIST" for the patient "9E7A;66" in VPR format
	And save the totalItems
	And a client connect to VistA using "PANORAMA"


@problem_writeback
Scenario: Client can write to the VistA and add problem records
	When the client add new problem record by using write-back for patient with DFN "66"
	Then the client receive the VistA write-back response
	And the new "PROBLEM" record added for the patient "9E7A;66" in VPR format
	When the client use the vx-sync write-back to save the record
	Then the responce is successful
	
	
