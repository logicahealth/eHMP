@F1142 
Feature: Home Page usability Staff View

#Team Application
  
@US17393 @RecentPatientListLoads
Scenario: Implement recent patient list in header
  Given user searches for and selects "Sixhundred,Patient"
  And Cover Sheet is active 
  And the user opens the recent patient dropdown
  Then recent patient list is displayed
  And user navigates to the staff view screen
  And user selects the recent patient dropdown
  Then recent patient list is displayed
  And the patient names in the Recent Patients list are in format Last Name, First Name + (First Letter in Last Name + Last 4 SSN )