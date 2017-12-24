@writeback 
Feature: F420 - Enter and Store an Allergy and an Allergy EIE
  
@allergy_writeback
Scenario: Client can write to the VistA and add Allergy records then marked it as Entered in Error- patient with ICN
  Given a patient with pid "SITE;253" has been synced through VX-Sync API for "SITE;SITE;HDR;VLER" site(s)
  And the client requests "ALLERGIES" for the patient "SITE;253" in VPR format
  And save the totalItems
  And a client connect to VistA using "KODAK"
  When the client add new Drug Allergy record for patient with DFN "253" 
    | field              | desc                 | value                           |
    | reference_date     |                      | 20151011.1451                   |
    | causative_agent    | DIGITOXIN            | DIGITOXIN^9;PSNDF(50.6,         |
    | historical         | true                 | h^HISTORICAL                    |
    | author_dictator    |                      | 10000000224                     |
    | type_name          | Drug                 | D^Drug                          |
    | nature_of_reaction | Allergy              | A^Allergy                       |
    | symptom1           | ITCHING,WATERING EYE | 2^ITCHING,WATERING EYE          |
    | symptom2           | RASH                 | 133^RASH                        |
    | severity           | Severe , Moderate    | 1, 2                            |
    | comment            |                      | Test, This patient has allergy. |    
  Then the client receive the VistA write-back response
  And the new "ALLERGY" record added for the patient "SITE;253" in VPR format
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field            | value                                    |
    | codes.display    | Digitoxin                                |
    | historical       | true                                     |
    | typeName         | DRUG                                     |
    | mechanism        | ALLERGY                                  |
    | reactions.name   | ITCHING,WATERING EYES                    |
    | reactions.name   | RASH                                     |
    | comments.comment | CONTAINS Test, This patient has allergy. |
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
  #Enter and Store an Allergy EIE
  When the client mark abvoe Allergy record as Entered in Error with comment "Test - Entered in Error"
  Then the client receive the VistA write-back response
  And the above "Allergy" record removed for the patient "SITE;253"
  And the above record dispaly in VPR format with value of
    | field             | value        |
    | comments.comment  | CONTAINS Test - Entered in Error |
 
  And the stamp time get update for recorde Entered in Error
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
  
@allergy_writeback
Scenario: Client can write to the VistA and add Allergy records then marked it as Entered in Error
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "ALLERGIES" for the patient "SITE;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "KODAK"
  When the client add new Drug Allergy record for patient with DFN "66" 
    | field              | desc                 | value                           |
    | reference_date     |                      | 20150911.145112                 |
    | causative_agent    | APPLES               | APPLES^237;GMRD(120.82,         |
    | historical         | false                | o^OBSERVED                      |
    | author_dictator    |                      | 10000000224                     |
    | type_name          | Food                 | F^Food                          |
    | nature_of_reaction | Unknown              | U^Unknown                       |
    | symptom1           | HIVES                | 1^HIVES                         |
    | symptom2           | DRY NOSE             | 69^DRY NOSE                     |
    | severity           | Moderate             | 2                               |
    | comment            |                      | Test, This patient has allergy. |
  Then the client receive the VistA write-back response
  And the new "ALLERGY" record added for the patient "SITE;66" in VPR format
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field                 | value                                    |
    | products.name         | APPLES                                   |
    | historical            | false                                    |
    | observations.severity | MODERATE                                 |
    | typeName              | FOOD                                     |
    | mechanism             | UNKNOWN                                  |
    | reactions.name        | HIVES                                    |
    | reactions.name        | DRY NOSE                                 |
    | comments.comment      | CONTAINS Test, This patient has allergy. |
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
  #Enter and Store an Allergy EIE
  When the client mark abvoe Allergy record as Entered in Error with comment "Test - Entered in Error"
  Then the client receive the VistA write-back response
  And the above "Allergy" record removed for the patient "SITE;66"
  And the above record dispaly in VPR format with value of
    | field             | value        |
    | comments.comment  | CONTAINS Test - Entered in Error |
 
  And the stamp time get update for recorde Entered in Error
  When the client use the vx-sync write-back to save the record
  Then the responce is successful 


@allergy_writeback
Scenario: Client can not duplicate the same allergy reaction to the same patient in VistA
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "ALLERGIES" for the patient "SITE;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Panorama"
  When the client add new Drug Allergy record for patient with DFN "66" 
    | field              | desc                 | value                           |
    | reference_date     |                      | 20150911.145112                 |
    | causative_agent    | APPLES               | APPLES^237;GMRD(120.82,         |
    | historical         | false                | o^OBSERVED                      |
    | author_dictator    |                      | 10000000224                     |
    | type_name          | Food                 | F^Food                          |
    | nature_of_reaction | Unknown              | U^Unknown                       |
    | symptom1           | HIVES                | 1^HIVES                         |
    | symptom2           | DRY NOSE             | 69^DRY NOSE                     |
    | severity           | Moderate             | 2                               |
    | comment            |                      | Test, This patient has allergy. |
  Then the client receive the VistA write-back response
  And the new "ALLERGY" record added for the patient "SITE;66" in VPR format
  
  Given the client requests "ALLERGIES" for the patient "SITE;66" in VPR format
  When the client try to add existing Drug Allergy record for patient with DFN "66" 
    | field              | desc                 | value                           |
    | reference_date     |                      | 20150911.145112                 |
    | causative_agent    | APPLES               | APPLES^237;GMRD(120.82,         |
    | historical         | false                | o^OBSERVED                      |
    | author_dictator    |                      | 10000000224                     |
    | type_name          | Food                 | F^Food                          |
    | nature_of_reaction | Unknown              | U^Unknown                       |
    | symptom1           | HIVES                | 1^HIVES                         |
    | symptom2           | DRY NOSE             | 69^DRY NOSE                     |
    | severity           | Moderate             | 2                               |
    | comment            |                      | Test, This patient has allergy. |
  Then the client receive the VistA write-back response
  Then the client receive the error message
  