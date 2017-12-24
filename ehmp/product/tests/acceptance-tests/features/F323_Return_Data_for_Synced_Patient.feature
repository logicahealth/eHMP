@US5876 @F323_1 @vx_sync 
Feature: F323-1  Return Data For Sync'd Patient

#This feature item adds the indicator "synced as of X date" for sync'd patient. 	
      
@synced_patient
Scenario: An user can access return data for sync'd patient and see the indicator "synced as of X date"
	Given a patient with pid "SITE;227" has been synced through VX-Sync API for "SITE;SITE;DoD;HDR;VLER" site(s)
	When the client requests sync status for patient with pid "SITE;227"
	Then the client receives the stamp time - the indicator 'synced as of X date' for "SITE;SITE;DoD;HDR;VLER" site(s)

