@F457   @reg1 @F1142
Feature: eHMP Release 1.3 Provisioning & Authorization

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed


@US7760 @TC888
Scenario: verify there is an option to navigate to CAC Screen
   Then POB user can view the Access Control Applet

@US7760 @TC889
Scenario: Verify from the CAC screen there is a way to navigate away from CAC Screen
   Given POB user views the Access Control Applet
   When the user selects Staff View from navigation bar
   Then staff view screen is displayed



