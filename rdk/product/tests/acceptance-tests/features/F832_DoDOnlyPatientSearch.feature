@F832_dodonlysearch
Feature: F832 - DoD Only Patient Search

#Team Mars

  @F832_dodonlysearch_1 @US11167
  Scenario Outline: When a user searches for Jones,Fred and gets results back
    Given the client has logged in with a cookie
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    # And there are 10 results?
    And the global patient result contains
      | field       | value                                   |
      | givenNames  | FRED                                    |
      | familyName  | JONES                                   |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |
      | JONES       | FRED        | NOT DEFINED | NOT DEFINED | application/json    |


  @F832_dodonlysearch_2 @US11169
  Scenario: Sync by EDIPI + Demographics
    When the client requests syncing a patient by demographics with content "{"edipi": "4325678","demographics": {"givenNames": "PATIENT","familyName": "DODONLY"}}"
    Then a created response is returned
    And the patient with pid "DOD;4325678" is synced through the RDK API

  @F832_dodonlysearch_3 @US11169
  Scenario: Sync by ICN + Demographics
    When the client requests syncing a patient by demographics with content "{"icn": "10108V420871","demographics": {"givenNames": "PATIENT","familyName": "DODONLY"}}"
    Then a created response is returned
    And the patient with pid "10108V420871" is synced through the RDK API


@F832_dodonlysearch_4 @US11169
  Scenario: Sync by DOD;PID + Demographics
    When the client requests syncing a patient by demographics with content "{"edipi": "DOD;0000000003","demographics": {"givenNames": "PATIENT","familyName": "DODONLY"}}"
    Then a internal server error response is returned

@F832_dodonlysearch_5 @US11168
  Scenario: Sync by EDIPI + Demographics with DOB and SSN
    When the client requests syncing a patient by demographics with content "{"edipi": "4325678","demographics": {"givenNames": "PATIENT","familyName": "DODONLY","ssn": "*****1234","dob": "19670909"}}"
    Then a created response is returned
    And the patient with pid "DOD;4325678" is synced through the RDK API
    #And the patient with pid "DOD;4325678" is synced through the RDK API within 60 seconds

