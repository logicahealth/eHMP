@F133_authentication_api
Feature: F133 - SDK VistA Write-Back Architecture

#Authentication Resource Server

#Team Andromeda

  @F133_authentication_api_1 @US1835
  Scenario Outline: When a user does authentication, then this resource server is called
    When the client requests authentication with accessCode "<accesscode>" and verifyCode "<verifycode>" and site "<site>" and division "<division>" and contentType "<contenttype>"
    Then a successful response is returned
    And the authentication result contains
      | field       | value                             |
      | firstname   | PANORAMA                          |
      | lastname    | USER                              |
      | facility    | PANORAMA                          |
      | title       | Clinician                         |
      | site        | SITE                              |
      Examples:
      | accesscode    | verifycode   | site       | division | contenttype         |
      | USER          | PW           | SITE       | 500      | application/json    |

  @F133_authentication_api_2 @US2990
  Scenario Outline: Authentication should fail if both CPRS tab settings are false
    When the client requests authentication with accessCode "<accesscode>" and verifyCode "<verifycode>" and site "<site>" and division "<division>" and contentType "<contenttype>"
    Then an unauthorized response is returned
    And the response contains error code
      | field       | value          |
      | code         | <code>        |
      Examples:
      | accesscode    | verifycode   | site       | division  | contenttype         | code              |
      | USER          | USER  !!     | SITE       | 500       | application/json    | 100.401.1010      |
