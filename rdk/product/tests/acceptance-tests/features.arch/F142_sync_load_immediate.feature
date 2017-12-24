@synced_immediate @unstable
Feature: F142 VX Cache Management and Expiration/Sync Stabilization
           
    
@f142_1_immediate @US2585
Scenario: Client can request sync with immediate response in VPR RDK format
  Given the client requests that the patient with pid "SITE;227" be cleared through the RDK API
  Then a successful response is returned
  When the client requests sync with immediate response within 30 second for the patient "SITE;227" in RDK format
  Then the sync immediate response will be reported the sync status without waiting for sync to completed  
      | site_panorama | site_kodak | HDR  | Dod | DAS | VLER |
      | SITE          | SITE       | HDR | DOD | DAS | VLER |

  Given the client requests that the patient with pid "SITE;71" be cleared through the RDK API
  Then a successful response is returned
  When the client requests sync with immediate response within 30 second for the patient "SITE;71" in RDK format
  Then the sync immediate response will be reported the sync status without waiting for sync to completed  
      | site_panorama |
      | SITE          |
  
  Given the client requests that the patient with pid "SITE;71" be cleared through the RDK API
  Then a successful response is returned     
  When the client requests sync with immediate response within 30 second for the patient "SITE;71" in RDK format
  Then the sync immediate response will be reported the sync status without waiting for sync to completed  
      | site_kodak |
      | SITE       |