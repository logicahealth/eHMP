@F498 @US6769 @US5885
Feature: F498 Return sync results for VistA only, ICN only and DOD only patients

#This feature item syncs patients and returns results using the patient that just has ICN or DoD from all VistA sites, but using a PID from only the single VistA site for that site hash.


@sync_panorama
Scenario: Client can request sync for a patient on one VistA with a single PID (Panorama)
	Given a patient with pid "SITE;1" has been synced through VX-Sync API for "SITE" site(s) 
	When the client requests sync status for patient with pid "SITE;1"
	Then the client recieved data just for site(s) "SITE"
	And the job status array and inProgress array are empty
	
	
@sync_Kodak
Scenario: Client can request sync for a patient on one VistA with a single PID (Kodak)
	Given a patient with pid "SITE;1" has been synced through VX-Sync API for "SITE" site(s) 
	When the client requests sync status for patient with pid "SITE;1"
	Then the client recieved data just for site(s) "SITE"
	And the job status array and inProgress array are empty
	
	
@sync_icn
Scenario: Client can request sync for a patient for multiple VistAs and secondary sites with the ICN (Panorama, Kodak, DoD, HDR, and VLER)	
	Given a patient with pid "11016V630869" has been synced through VX-Sync API for "SITE;SITE;DOD;HDR;VLER" site(s) 
	When the client requests sync status for patient with pid "11016V630869"
	Then the client recieved data just for site(s) "SITE;SITE;DOD;HDR;VLER"
	And the job status array and inProgress array are empty


@sync_icn_only @future
Scenario: Client can request sync for a patient for secondary sites with the ICN (ICN only)
	When a patient with icn "4325679V4325679" has no demographics we should receive an error message
	Then insert demographics for patient ICNONLY, PATIENT (with icn 4325679V4325679)
	When a patient with pid "4325679V4325679" has been synced through VX-Sync API for "HDR;VLER" site(s) 
	And the client requests sync status for patient with pid "4325679V4325679"
	Then the client recieved data just for site(s) "HDR;VLER"
	And the job status array and inProgress array are empty
		
	
@sync_dod_only @future
Scenario: Client can request sync for a patient for secondary sites with the ICN (DoD only)
	Given a patient with pid "4325678V4325678" has been synced through VX-Sync API for "DoD;HDR;VLER" site(s) 
	When the client requests sync status for patient with pid "4325678V4325678"
	Then the client recieved data just for site(s) "DoD;HDR;VLER"
	And the job status array and inProgress array are empty
	
	
