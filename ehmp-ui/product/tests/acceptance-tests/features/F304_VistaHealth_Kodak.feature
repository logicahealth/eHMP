@F304   @reg2
Feature: Health Summaries (VistA Web Health Exchange)

Background:
  Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
  Then staff view screen is displayed
  And user searches for and selects "Eight,Patient"
  Then Overview is active

@US4755 @TC81_11 @DE3938
Scenario: Verify that User's primary VistA is presented at the top of the list of VistA sites containing a Health Summary Report for the selected patient
  When the user navigates to the Vista Health Summary applet
  And the user's primary vista site "TST2" is listed first