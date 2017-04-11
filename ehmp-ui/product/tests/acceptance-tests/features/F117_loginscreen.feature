@F117 @regression
Feature: Logon screen validates credentials using ehmpui_url User service:

#Team Mercury

@LoginWithDiffFacility
Scenario: Login to ehmpui_url
  Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "pu1234" verifycode as  "pu1234!!"
#    Given user views the login screen
#    When user logs in with credentials
#        | field      | value    |
#        | Facility   | KODAK    |
#        | AccessCode | pu1234   |
#        | VerifyCode | pu1234!! |
#        | SignIn     |          |
  Then staff view screen is displayed

#@Logout
#Scenario: Test logout after successful login
#    Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "pu1234" verifycode as  "pu1234!!"
#    Given user views the login screen
#    When user logs in with credentials
#        | field      | value    |
#        | Facility   | KODAK    |
#        | AccessCode | pu1234   |
#        | VerifyCode | pu1234!! |
#        | SignIn     |          |
#    Then the patient search screen is displayed
#    Then the user attempts signout

@NoCPRSTabAccessLogin @US2990 @DE685 @DE1477 @DE3004
Scenario: Attempt login with No CPRS Tab Access
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "lu1234" verifycode as  "lu1234!!"
#    Given user views the login screen
#    When user attempts login
#        |field | value|
#        |Facility|PANORAMA|
#        |AccessCode|lu1234|
#        |VerifyCode|lu1234!!|
#        |SignIn||
  Then the page displays "VistA Security Error: No Tabs Permissions."

@UnsuccessfulLogin @DE685 @DE1734 @DE2723
Scenario: Attempt login with incorrect credentials
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "kkk1234" verifycode as  "pu12lkk!!"
#    Given user views the login screen
#    When user attempts login
#        |field | value|
#        |Facility|PANORAMA|
#        |AccessCode|kkk1234|
#        |VerifyCode|pu12lkk!!|
#        |SignIn||
  Then the page displays "Not a valid ACCESS CODE/VERIFY CODE pair."

@BlankFelled
Scenario:Test valid login when felled is blank
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "" verifycode as  "pu1234!!"
#    Given user views the login screen
#    When user attempts login
#        |field | value|
#        |Facility|PANORAMA|
#        |AccessCode||
#        |VerifyCode|pu1234!!|
#        |SignIn||
  Then the page displays "Ensure all fields have been entered"
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "pu1234" verifycode as  ""
#  When user attempts login
#        |field | value|
#        |Facility|PANORAMA|
#        |AccessCode|pu1234|
#        |VerifyCode||
#        |SignIn||
  Then the page displays "Ensure all fields have been entered"
#  And user is logged into eHMP-UI

@CaseSensitive_1
Scenario:Test login screen is not CaseSensitive
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PU1234" verifycode as  "Pu1234!!"
#    Given user views the login screen
#    When user logs in with credentials
#        | field      | value    |
#        | Facility   | KODAK    |
#        | AccessCode | PU1234   |
#        | VerifyCode | pu1234!! |
#        | SignIn     |          |
  Then staff view screen is displayed

@CaseSensitive_2
Scenario:Test login screen is not CaseSensitive
  Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "Pu1234" verifycode as  "PU1234!!"
#    Given user views the login screen
#    When user logs in with credentials
#        | field      | value    |
#        | Facility   | KODAK    |
#        | AccessCode | pu1234   |
#        | VerifyCode | PU1234!! |
#        | SignIn     |          |
  Then staff view screen is displayed

@appletWithoutLogin
Scenario: Test attempt to go directly to applet without login
   Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "" verifycode as  ""
   Given user attempt to go directly to the applet without login
   Then user is redirected to SignIn page

@IncorrectSubpage
Scenario: Test attempt to go directly to applet with incorrect subpage
   Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "" verifycode as  ""
   Given user attempt to go directly to applet with incorrect subpage
   Then user is redirected to SignIn page

@SuccessfulLogin
Scenario: Login to ehmpui_url
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "Pu1234" verifycode as  "PU1234!!"
#    Given user views the login screen
#    When user logs in with credentials
#        |field | value|
#        |Facility|PANORAMA|
#        |AccessCode|pu1234|
#        |VerifyCode|pu1234!!|
#        |SignIn||
  Then staff view screen is displayed