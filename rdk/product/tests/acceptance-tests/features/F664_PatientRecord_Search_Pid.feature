@F664 @F664_PatientRecord_Search_Pid @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-search-pid

@F664_PatientRecord_Search_Pid_Scenario_1
Scenario: Search Pid
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client searches for pid where pid is "10108V420871"
  Then a successful response is returned
  And the response contains at least 1 items

@F664_PatientRecord_Search_Pid_Scenario_2
Scenario: Search Pid using site
  When the client searches for pid where pid is "9E7A;3"
  Then a successful response is returned
  And the response contains 1 item
  And the client receives 1 VPR VistA result(s)
  And the VPR results contain
    | field       | value                            |
    | birthDate   | 19350407                         |                           
    | icn         | 10108V420871                     |
    | familyName  | EIGHT                            |
    | displayName | Eight,Patient                    |
    | fullName    | EIGHT,PATIENT                    |
    | genderCode  | urn:va:pat-gender:M              |
    | genderName  | MALE                             |
    | sensitive   | false                            |
    | summary     | Eight,Patient                    |
    | ssn         | *****0008                        |

@F664_PatientRecord_Search_Pid_Scenario_3
Scenario: Search Pid with pid of same person but in different site
  When the client searches for pid where pid is "9E7A;3"
  Then a successful response is returned
  And the response contains 1 item
  And the client receives 1 VPR VistA result(s)
  And the VPR results contain
    | field       | value                            |
    | icn         | 10108V420871                     |
    | fullName    | EIGHT,PATIENT                    |
    


@F664_PatientRecord_Search_Pid_Scenario_4
Scenario: Search Pid with non-existing pid
  When the client searches for pid where pid is "33333V999999"
  Then a successful response is returned
  But the response contains 0 item
  And the response contains field "totalItems" which is "0"
