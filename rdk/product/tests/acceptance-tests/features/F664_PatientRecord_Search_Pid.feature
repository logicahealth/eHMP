@F664 @F664_PatientRecord_Search_Pid @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-search-pid

@F664_PatientRecord_Search_Pid_Scenario_1
Scenario: Search Pid
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client searches for pid where pid is "10108V420871"
  Then a successful response is returned
  And the response contains at least 1 items

@F664_PatientRecord_Search_Pid_Scenario_2 @debug @de1862 @de3740 @de3863
Scenario: Search Pid using site
  When the client searches for pid where pid is "9E7A;3"
  Then a successful response is returned
  And the response contains 1 item
  And the client receives at least 1 VPR VistA result(s)
  And the VPR results contain
    | field       | value                            |
    | birthDate   | 19350407                         |                           
    | icn         | 10108V420871                     |
    | familyName  | EIGHT                            |
    | displayName | Eight,Patient                    |
    | fullName    | EIGHT,PATIENT                    |
    | genderCode  | M                                |
    | genderName  | MALE                             |
    | sensitive   | false                            |
    | summary     | Eight,Patient                    |
    | ssn         | *****0008                        |

@F664_PatientRecord_Search_Pid_Scenario_3
Scenario: Search Pid with pid of same person but in different site
  When the client searches for pid where pid is "9E7A;3"
  Then a successful response is returned
  And the response contains 1 item
  And the client receives at least 1 VPR VistA result(s)
  And the VPR results contain
    | field       | value                            |
    | icn         | 10108V420871                     |
    | fullName    | EIGHT,PATIENT                    |
    


@F664_PatientRecord_Search_Pid_Scenario_4 @de4179
Scenario: Search Pid with non-existing pid
  When the client searches for pid where pid is "33333V999999"
  Then a internal server error response or a bad request response is returned

@F664_PatientRecord_Search_Pid_Scenario_5 @de4179 @de1862
Scenario Outline: When a user searches for ICNONLY, patient and gets  1 results
  When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
  Then a successful response is returned
  When the client searches for pid where pid is "4325679V4325679"
  Then a successful response is returned
  And the VPR results contain
    | field       | value                                   |
    | pid         | 4325679V4325679                         |
    | ssn         | 432111235                               |
    | birthDate   | 19671010                                |
    | sensitive   | false                                   |
    Examples:
    | lastname    | firstname   | ssnumber    | dobirth        | contenttype         |
    | ICNONLY     | PATIENT     | NOT DEFINED |  NOT DEFINED   | application/json    |