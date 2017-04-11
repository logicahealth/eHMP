@F1142_logout @regression @reg2
Feature: Home Page usability  (Staff View)

@US17388_logout_patient_search_screen
Scenario: Sign out from eHMP patient search page
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
  And the patient search screen is displayed
  And user logs out