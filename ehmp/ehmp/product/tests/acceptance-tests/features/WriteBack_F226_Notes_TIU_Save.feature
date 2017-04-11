@writeback @future
Feature: F226 - Enter Plain Text Basic Progress Notes (TIU)

@writeback 
Scenario: Client can write to the VistA and add Notes records
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "DOCUMENT" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  And the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | document_type    | 4                           |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20151020.145115             |
      | comment          | This is a sample stub note. |
  And the client receive the VistA write-back response
  And the new "DOCUMENT" record added for the patient "C877;66" in VPR format
  And save the local id from VistA write-back response
  When the client update the above TIU Note record for patient with DFN "66" enter
      | field            | value                       |
      | ien              | Above local id              |
      | document_type    | 22                          |
      # visit_date is missing
      | visit_date       | 20151023.155115             |
      # what is visit_ien
      | visit_ien        | 2                            |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20151023.145115             |
      | subject          | Test: the subject line      |
      # service_category is missing
      | service_category | H                           |
      | comment          | This is a sample TIU note.  |
  
  Then the client receive the VistA write-back response
  And the update "DOCUMENT" write back record for the patient "C877;66" dispaly in VPR format with value of
    | field             | value                               |
    | localId           | Above local id                      |
    | kind              | Progress Note                       |
    | localTitle        | PRIMARY CARE GENERAL NOTE           |
    | status            | UNSIGNED                            |
    | authorDisplayName | Khan,Vihaan                         |
    | referenceDateTime | 20151023145115                      |
    | subject           | CONTAINS Test: the subject line     |
    | text.content      | CONTAINS This is a sample TIU note. |
    
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  And the update "DOCUMENT" write back record for the patient "C877;66" dispaly in VPR format with value of
    | field             | value                               |
    | localId           | Above local id                      |
    | localTitle        | PRIMARY CARE GENERAL NOTE           |
    | visit_date        | 20151023155115             |
    | visit_ien         |   2                          |
    | serviceCategoryName  | H                           |
 
 @writeback 
Scenario: Client can write to the VistA and add Notes records
 And ttest test format with value of
    | field             | value                               |
    | localId           | above local id                      |
    | kind              | Progress Note                       |
    | localTitle        | PRIMARY CARE GENERAL NOTE           |
    | status            | UNSIGNED                            |
    | authorDisplayName | Khan,Vihaan                         |
    | referenceDateTime | 20151023145115                      |
    | subject           | CONTAINS Test: the subject line     |
    | text.content      | CONTAINS This is a sample TIU note. | 
  
@writeback 
Scenario: Client can write to the VistA and add Notes records
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "DOCUMENT" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | ien              | 11597                       |
      | document_type    | 4                           |
      | visit_date       | 20150915.155115             |
      | visit_ien        |                             |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20150911.145115             |
      | subject          | testing the subject         |
      | service_category | H                           |
      | comment          | This is a sample stub note. |
  Then the client receive the VistA write-back response
  And the new "DOCUMENT" record added for the patient "C877;66" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field             | value                               |
    | kind              | Progress Note                       |
    | localTitle        | HOMELESS CALL CENTER REFERRAL NOTE  |
    | referenceDateTime | 20150911145115                      |
    | status            |  UNSIGNED                           |
    | text.content      | CONTAINS This is a sample stub note.|
    
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
	
	

@writeback 
Scenario: Client can write to the VistA and add Notes records
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "DOCUMENT" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | ien              | 11597                       |
      | document_type    | 22                          |
      | visit_date       |                             |
      | visit_ien        |                             |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20150911.145115             |
      | subject          |                             |
      | service_category | H                           |
      | comment          | This is a sample stub note. |
  Then the client receive the local id from VistA write-back response
  And the new "DOCUMENT" record added for the patient "C877;66" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field           | value                         |
    | kind            | Progress Note          |
    | referenceDateTime        | 20150911145115                             |
    | status          |  UNSIGNED                |
    | text.content         | CONTAINS This is a sample stub note. |
    
  When the client save TIU Note record for patient with DFN "66" enter
      | field            | value                       |
      | ien              | 11597                       |
      | document_type    | 22                          |
      | visit_date       |                             |
      | visit_ien        |                             |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20150911.145115             |
      | subject          |                             |
      | service_category | H                           |
      | comment          | This is a sample stub note. |
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
#   # Then the client receive the VistA write-back response




# @writeback @future
# Feature: F226 - Enter Plain Text Basic Progress Notes (TIU)

@writeback 
Scenario: Client can write to the VistA and add Notes records
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "DOCUMENT" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | document_type    | 4                           |
      | visit_date       | 20150915.155115             |
      | visit_ien        |                             |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20150911.145115             |
      | subject          | testing the subject         |
      | service_category | H                           |
      | comment          | This is a sample stub note. |
  Then the client receive the VistA write-back response
  And the new "DOCUMENT" record added for the patient "C877;66" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field             | value                               |
    | kind              | Progress Note                       |
    | localTitle        | HOMELESS CALL CENTER REFERRAL NOTE  |
    | referenceDateTime | 20150911145115                      |
    | status            | UNSIGNED                            |
    | text.content      | CONTAINS This is a sample stub note.|
    
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
  
@writeback 
Scenario: Client can write to the VistA and add Notes records
  Given a patient with pid "9E7A;66" has been synced through VX-Sync API for "9E7A" site(s)
  And the client requests "DOCUMENT" for the patient "9E7A;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Panorama"
  When the client create new Note Stub record for patient with DFN "66" enter
      | field            | value                       |
      | document_type    | 29                          |
      | visit_date       | 201501018.181818            |
      | visit_ien        |                             |
      | author_dictator  | 10000000272                 |
      | reference_date   | 20151018.145115             |
      | subject          | testing the subject         |
      | service_category | 1043                           |
      | comment          | This is a sample stub note. |
  Then the client receive the VistA write-back response
  And the new "DOCUMENT" record added for the patient "9E7A;66" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field             | value                  |
    | documentClass     | PROGRESS NOTES         |
    | localTitle        | VA-HEP C RISK FACTORS  |
    | referenceDateTime | 20151018145115         |
    | status            | UNSIGNED               |
    | text.content      | CONTAINS This is a sample stub note.|
    
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
