@F1142 
Feature: Home Page usability Staff View

#Team Application

@US17393 @RecentPatientIsOnTop
Scenario: Implement recent patient list in header
  Given user searches for and selects "Sixhundred,Patient"
  And Cover Sheet is active 
  When the user selects Patients header button and views the Recent Patients tray

  Then the first record in the list is "Sixhundred, Patient (S1600)"
  And user searches for and selects "eighteen,patient"
  And Cover Sheet is active 
  When the user selects Patients header button and views the Recent Patients tray 
  Then the first record in the list is "Eighteen, Patient (E0018)"
  
