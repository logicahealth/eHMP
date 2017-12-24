@writeback
Feature: F420 - Enter and Store an Allergy EIE


@Allergy_writeback 
Scenario: Client should get error message when invalid local id entered for Allergy EIE
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "ALLERGIES" for the patient "SITE;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client marked a Allergy record for patient with local id "t455" as Entered in Error
  Then the client receive the "Allergy identifier is invalid" error message
  
  When the client marked a Allergy record for patient with local id "4550000" as Entered in Error
  Then the client receive the "Allergy identifier 4550000 does not exist" error message  
  	
#Test Note:These two test been moved to WriteBack_F420_Allergy.feature

# @Allergy_writeback 
# Scenario: Client can mark a Allergy record as Entered in Error in the VistA
  # Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  # And the client requests "ALLERGIES" for the patient "SITE;66" in VPR format
  # And save the totalItems
  # And a client connect to VistA using "Kodak"
  # When the client mark an Allergy record as Entered in Error with comment "Test - Entered in Error"
  # #When the client marked a Allergy record for patient with local id "450" as Entered in Error
  # Then the client receive the VistA write-back response
  # And the above "Allergy" record removed for the patient "SITE;66"
  # # And the "Allergy" record with local id "450" removed for the patient "SITE;66" in VPR format
  # And the above record dispaly in VPR format with value of
    # | field             | value        |
    # | comments.comment  | CONTAINS Test - Entered in Error |
  # # And the new write back record dispaly in VPR format with value of
    # # | field             | value        |
    # # | localId           | CONTAINS 450 |
    # # | removed           | true         |
    # # | comments.comment  | CONTAINS Test - Entered in Error |
  # And the stamp time get update for recorde Entered in Error
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
#   
#   
# @Allergy_writeback 
# Scenario: Client can mark a Allergy record as Entered in Error in the VistA
  # Given a patient with pid "SITE;253" has been synced through VX-Sync API for "SITE;SITE;VLER" site(s)
  # And the client requests "ALLERGIES" for the patient "SITE;253" in VPR format
  # And save the totalItems
  # And a client connect to VistA using "Panorama"
  # When the client mark an Allergy record as Entered in Error with comment "Test - Entered in Error"
  # # When the client marked a Allergy record for patient with local id "873" as Entered in Error
  # Then the client receive the VistA write-back response
  # And the above "Allergy" record removed for the patient "SITE;253"
  # # And the "Allergy" record with local id "873" removed for the patient "SITE;253" in VPR format
  # And the above record dispaly in VPR format with value of
    # | field             | value        |
    # | comments.comment  | CONTAINS Test - Entered in Error |
  # # And the new write back record dispaly in VPR format with value of
    # # | field             | value        |
    # # | localId           | CONTAINS 873 |
    # # | removed           | true         |
    # # | comments.comment  | CONTAINS Test - Entered in Error |
  # And the stamp time get update for recorde Entered in Error
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
#   


