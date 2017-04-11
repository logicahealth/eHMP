@writeback 
Feature: F170 - Vitals Write-Back EIE

@vital_writeback 
Scenario: Client should get error message when invalid local id entered for Vital EIE
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "VITALS" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client marked a Vital record with local id "t3387" as Entered in Error with EIE Reason
   | description         | code_value |
   | INCORRECT DATE/TIME | 1          |
  Then the client receive the "Vital identifier is invalid" error message
  
  When the client marked a Vital record with local id "3387000" as Entered in Error with EIE Reason
   | description         | code_value |
   | INCORRECT DATE/TIME | 1          |
  Then the client receive the "The vital identifier 3387000 does not exist" error message
  
  
@vital_writeback 
Scenario: Client should get error message when invalid EIE Reason entered for Vital EIE
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "VITALS" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client marked a Vital record with local id "3387" as Entered in Error with EIE Reason
   | description         | code_value |
   | INCORRECT DATE/TIME | 5          |
  Then the client receive the "The Entered in Error reason must be 1, 2, 3 or 4" error message
  
#Test Note:These two test been moved to WriteBack_F423_Vitals.feature

# @vital_writeback 
# Scenario: Client can mark a Vital record as Entered in Error in the VistA
  # Given a patient with pid "9E7A;66" has been synced through VX-Sync API for "9E7A" site(s)
  # And the client requests "VITALS" for the patient "9E7A;66" in VPR format
  # And save the totalItems
  # And a client connect to VistA using "PANORAMA"
  # When the client marked a Vital record with local id "3387" as Entered in Error with EIE Reason
   # | description         | code_value |
   # | INCORRECT DATE/TIME | 1          |
  # Then the client receive the VistA write-back response
  # And the "Vital" record with local id "3387" removed for the patient "9E7A;66" in VPR format
  # And the stamp time get update for recorde Entered in Error
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
  
  
# @vital_writeback 
# Scenario: Client can mark a Vital record as Entered in Error in the VistA
  # Given a patient with pid "C877;253" has been synced through VX-Sync API for "9E7A;C877;2939;FFC7;VLER" site(s)
  # And the client requests "VITALS" for the patient "C877;253" in VPR format
  # And save the totalItems
  # And a client connect to VistA using "Kodak"
  # When the client marked a Vital record with local id "12440" as Entered in Error with EIE Reason
   # | description         | code_value |
   # | INCORRECT READING   | 2          |
  # Then the client receive the VistA write-back response
  # And the "Vital" record with local id "12440" removed for the patient "C877;253" in VPR format
  # And the stamp time get update for recorde Entered in Error
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
 