@F304 @triage @regression
Feature: Health Summaries (VistA Web Health Exchange)

Background:
  Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "PW    " verifycode as  "PW    !!"
  Then staff view screen is displayed
  Then Navigate to Patient Search Screen
  Then the patient search screen is displayed
  And user searches for and selects "Eight,Patient"
  Then Default Screen is active

@US4755 @TC81_11 @DE3938
Scenario: Verify that User's primary VistA is presented at the top of the list of VistA sites containing a Health Summary Report for the selected patient
  When the user navigates to the Vista Health Summary applet
  And the user's primary vista site "TST2" is listed first