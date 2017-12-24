@writeback @DE5208 @future @debug
Feature: F226 - Enter Plain Text Basic Progress Notes (TIU)
# This RPC has not used anymore since we're now doing the shortcut write. So, I am retiring this test case.

@writeback 
Scenario: Client can write to the VistA and add Notes records
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "DOCUMENT" for the patient "SITE;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | document_type    | 4                           |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20151020.145115             |
      | comment          | This is a sample stub note. |
  Then the client receive the VistA write-back response
  And the new "DOCUMENT" record added for the patient "SITE;66" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field             | value                               |
    | kind              | Progress Note                       |
    | localTitle        | HOMELESS CALL CENTER REFERRAL NOTE  |
    | referenceDateTime | 20151020145115                      |
    | status            | UNSIGNED                            |
    | authorDisplayName | Khan,Vihaan                         |
    | text.content      | CONTAINS This is a sample stub note.|
    
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
	
	
@writeback 
Scenario: Client can write to the VistA and add Notes records
  Given a patient with pid "SITE;253" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "DOCUMENT" for the patient "SITE;253" in VPR format
  And save the totalItems
  And a client connect to VistA using "Panorama"
  When the client create new Note Stub record for patient with DFN "253" enter
      | field            | value                       |
      | document_type    | 29                          |
      | author_dictator  | 20023                       |
      | reference_date   | 20151020.145115             |
      | comment          | This is a sample stub note. |
  Then the client receive the VistA write-back response
  And the new "DOCUMENT" record added for the patient "SITE;253" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field             | value                  |
    | documentClass     | PROGRESS NOTES         |
    | localTitle        | VA-HEP C RISK FACTORS  |
    | referenceDateTime | 20151020145115         |
    | status            | UNSIGNED               |
    | authorDisplayName | Vehu,Twentyone         |
    | text.content      | CONTAINS This is a sample stub note.|
    
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
  
@writeback
Scenario: Client should get error message when invalid Note data entered 
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "DOCUMENT" for the patient "SITE;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Panorama"
  When the client create new Note Stub record for patient with DFN "t66" enter
      | field            | value                       |
      | document_type    | 29                          |
      | author_dictator  | 20023                       |
      | reference_date   | 20151020.145115             |
      | comment          | This is an ivalid DFN.      |
  Then the client receive the "Missing DFN" error message
  
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | document_type    | t29                         |
      | author_dictator  | 20023                       |
      | reference_date   | 20151020.145115             |
      | comment          | This is an invalid document type. |
  Then the client receive the "Document TITLE invalid" error message
  
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | document_type    | 29                          |
      | author_dictator  | 99920023                    |
      | reference_date   | 20151020.145115             |
      | comment          | This is an invalid author_dictator. |
  Then the client receive the "The entry does not exist" error message
  
  
@writeback @debug @de2908
Scenario: Client should get error message when invalid Note data entered 
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "DOCUMENT" for the patient "SITE;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Panorama"
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | document_type    | 29                          |
      | author_dictator  | 20023t                      |
      | reference_date   | 20151020.145115             |
      | comment          | This is an invalid author_dictator. |
  Then the client receive the "The entry does not exist" error message  
  
  
  
  
