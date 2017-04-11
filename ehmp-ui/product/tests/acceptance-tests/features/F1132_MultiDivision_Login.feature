@F1132 @US17492 @F1132-6 @TC6870
Feature: Update Lab Order write-back to support multi-division Vista sites

#Team Platform
#Story US17492 - Detect error when user attempts to login with division without access rights

@F1132-6.1 @LoginPrimaryDivisionNoAccess
Scenario: User tries to log into a Primary Facility (Division) that the user does not have access to
  Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "prov50" verifycode as  "prov50!!"
  Then the page displays "Selected division not found for this user"

@F1132-6.2 @LoginNonPrimaryDivisionNoAccess
Scenario: Same User tries to log into a Non-Primary Facility (Division) that the user does not have access to
  Given POB user is logged into EHMP-UI with facility as  "WASHINGTON" accesscode as  "prov50" verifycode as  "prov50!!"
  Then the page displays "Selected division not found for this user"

@F1132-6.3 @LoginNonPrimaryDivisionWithAccess
Scenario: Same User logs into a Non-Primary Facility (Division) that the user has access to
  Given POB user is logged into EHMP-UI with facility as  "MARTINSBURG" accesscode as  "prov50" verifycode as  "prov50!!"
  Then staff view screen is displayed

@F1132-6.4 @LoginNonPrimaryDivisionNoAccess2
Scenario: User tries to log into a Non-Primary Facility (Division) that the user does not have access to
  Given POB user is logged into EHMP-UI with facility as  "MARTINSBURG" accesscode as  "prov40" verifycode as  "prov40!!"
  Then the page displays "Selected division not found for this user"

@F1132-6.5 @LoginPrimaryDivisionWithAccess
Scenario: Same User logs into a Primary Facility (Division) that the user has access to
  Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "prov40" verifycode as  "prov40!!"
  Then staff view screen is displayed

@F1132-6.6 @LoginPrimaryDivisionWithAllAccess
Scenario: User that has Access to all Divisions logs into a Primary Facility (Division)
  Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "cas123" verifycode as  "cas123.."
  Then staff view screen is displayed

@F1132-6.7 @LoginNonPrimaryDivisionWithAllAccess
Scenario: User that has Access to all Divisions logs into a Non-Primary Facility (Division)
  Given POB user is logged into EHMP-UI with facility as  "MARTINSBURG" accesscode as  "cas123" verifycode as  "cas123.."
  Then staff view screen is displayed
