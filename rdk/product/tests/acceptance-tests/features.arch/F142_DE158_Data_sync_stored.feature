@data_sync_stored @unstable
Feature: F142 VX Cache Management and Expiration/Sync Stabilization
           

@f142_1_stored @US2000 @DE158
Scenario: Data sync completion will be reported when successful saved in RDK
  Given a patient with pid "SITE;1" has been synced through the RDK API
  When the client requests sync data status for the patient "SITE;1" in RDK format
  Then a successful response is returned
  And the data status attribute should be true


@f142_2_stored @US2000 @DE158
Scenario: Data sync completion will be reported when successful saved in RDK
  Given a patient with pid "SITE;1" has been synced through the RDK API
  When the client requests sync data status for the patient "SITE;1" in RDK format
  Then a successful response is returned 
  And the data status attribute should be true


@f142_3_stored @US2000 @DE158
Scenario: Data sync completion will be reported when successful saved in RDK
  Given a patient with pid "SITE;227" has been synced through the RDK API
  When the client requests sync data status for the patient "SITE;227" in RDK format
  Then a successful response is returned
  And the data status attribute should be true

@f142_4_stored @US2000 @DE158
Scenario: Data sync completion will be reported when successful saved in RDK
  When the client requests load parioitized for the patient "SITE;71" base on priority site list in RDK format
    | prioritized_site_list |
    | Kodak                 |
  And the client requests sync data status for the patient "SITE;71" in RDK format
  Then a successful response is returned
  And the data status attribute for "allSites" should be true if all other attributes are true 


