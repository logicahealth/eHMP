@F826 @regression
Feature: Maintain and Resume Patient Context

@DE3047 @DE3863 @US14691 @DE5359 @DE4619
Scenario: SSN should ALWAYS be unmasked for an unsynced patient
# DON'T TRY TO FOLLOW THE DEFECT / USER STORY TRAIL.  ALWAYS UNMASKED.  
  When the patient search screen is displayed
  And user enters full last name "BCMA,SEVENTEEN-PATIENT"
  And the user select patient name "Bcma, Seventeen-Patient"
  Then the patient ssn is unmasked

@DE3047 @DE3863 @US14691
Scenario: SSN should NOT be masked for an synced patient
  When the patient search screen is displayed
  And user enters full last name "Eight, Patient"
  And the user select patient name "Eight, Patient"
  Then the patient ssn is unmasked

@DE3047 @DE3863 @US14691
Scenario: SSN should be unmasked for a patient synced by another user
  When POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "md1234" verifycode as  "md1234!!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
  And the User selects mysite
  And user enters full last name "Eighty"
  And the user select patient name "Eighty, Patient"
  Then the patient ssn is unmasked
