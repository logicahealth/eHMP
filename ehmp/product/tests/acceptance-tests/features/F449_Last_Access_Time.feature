@access_time
Feature: F449 - Implement flexible cache expiration

@access_time 
Scenario: The last access time get update when client read a patient record.
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  Then the sync status contain lastAccessTime
  When the client requests "DOCUMENT" for the patient "SITE;66" in VPR format
  And the client requests sync status for patient with pid "SITE;66"
  Then the lastAccessTime get update
  
  
@access_time 
Scenario: The last access time get update when client read a patient record.
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  Then the sync status contain lastAccessTime
  When the client requests "PROBLEM LIST" for the patient "SITE;66" in VPR format
  And the client requests sync status for patient with pid "SITE;66"
  Then the lastAccessTime get update
  
  
@access_time
Scenario: The last access time get update when client add a new record.
  Given a patient with pid "SITE;253" has been synced through VX-Sync API for "SITE;SITE;HDR;VLER" site(s)
  Then the sync status contain lastAccessTime
  And a client connect to VistA using "PANORAMA"
  When the client add new Vital record for patient with DFN "253" 
    | field              | desc                 | value            |
    | reference_date     |                      | 20151011.145151  |
    | qualified_name     | BLOOD PRESSURE       | 1;               |
    | result             |                      | 110/90           |
  Then the client receive the VistA write-back response
  And the client use the vx-sync write-back to save the record
  And the responce is successful
  When the client requests sync status for patient with pid "SITE;253"
  Then the lastAccessTime get update