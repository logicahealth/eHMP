@F826  @reg1
Feature: Maintain and Resume Patient Context

@F826_1 @DE3047 @DE3863 @US14691 @DE5359 @DE4619 
Scenario: SSN should ALWAYS be unmasked for an unsynced patient
# DON'T TRY TO FOLLOW THE DEFECT / USER STORY TRAIL.  ALWAYS UNMASKED.  
  Given staff view screen is displayed
  When the user searchs My Site with search term BCMA,SEVENTEEN-PATIENT
  And the user select patient name "Bcma, Seventeen-Patient"
  Then the patient ssn is unmasked

@F826_2 @DE3047 @DE3863 @US14691
Scenario: SSN should NOT be masked for an synced patient
  Given staff view screen is displayed
  When the user searchs My Site with search term EIGHT,PATIENT
  And the user select patient name "Eight, Patient"
  Then the patient ssn is unmasked

@F826_3 @DE3047 @DE3863 @US14691
Scenario: SSN should be unmasked for a patient synced by another user
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "md1234" verifycode as  "md1234!!"
  And staff view screen is displayed
  When the user searchs My Site with search term EIGHTY,PATIENT
  And the user select patient name "Eighty, Patient"
  Then the patient ssn is unmasked
