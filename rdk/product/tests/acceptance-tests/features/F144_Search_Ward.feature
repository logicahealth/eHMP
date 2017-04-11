@F144_SearchWard
Feature: F144 - eHMP Viewer GUI - Patient Search (Ward)

  Background:
      #Given a search for patient with range

  @F144_SearchWard_1_1 @vxsync @enrich
  Scenario: User ward searches for wards limited to 5
    When the client requests for wards with and site code of "9E7A" start index of 0 limited to 5 
    Then a successful response is returned
    And the client receives at least 5 VPR VistA result(s)
    And the client receives at least 29 RDK result(s) with start index of 0 and results limit of 5 per page

  @F144_SearchWard_1_2 @vxsync @enrich
  Scenario: User ward searches for wards using name and limited to 5
    When the client requests for wards with names beginning with "3" and site code of "9E7A" start index of 0 limited to 5 
    Then a successful response is returned
    And the client receives at least 5 VPR VistA result(s)
    And the client receives at least 7 RDK result(s) with start index of 0 and results limit of 5 per page

  @F144_SearchWard_2_1
  Scenario: User ward searches for patient with patient limited to 0
    When the client requests for wards with and site code of "9E7A" start index of 0 
    Then a successful response is returned
    #And the client receives 0 RDK result(s) with start index of 0
    And the client receives at least 29 VPR VistA result(s)

  @F144_SearchWard_2_2
  Scenario: User ward searches for patient with patient limited to 0
    When the client requests for wards with names beginning with "7A" and site code of "9E7A" start index of 0 
    Then a successful response is returned
    #And the client receives 0 RDK result(s) with start index of 0
    And the client receives at least 3 VPR VistA result(s)

#  @F144_SearchWard_3
#  Scenario: User ward searches for patient with patient limited to 1 and should not contain uidHref
#    When the client requests for wards with names beginning with "3" and start index of 0 limited to 1 and site code of "9E7A"
#    Then a successful response is returned
#    #And the client receives 1 RDK result(s) with start index of 0
#    And the client receives 1 VPR VistA result(s)
#    And the result(s) should not contain "uidHref"

  @F144_SearchWard_4
  Scenario: User ward searches for patient using name and facilityCode
    When the client requests for wards with names beginning with "3" and facility code of "998" site code of "C877"
    Then a successful response is returned
    And the client receives at least 3 VPR VistA result(s)

  @F144_SearchWard_5
  Scenario: User ward searches for patient using siteCode
    When the client requests for wards with site code of "C877"
    Then a successful response is returned
    And the client receives at least 29 VPR VistA result(s)

  @F144_SearchWard_6 @vxsync @enrich
  Scenario: Ward searches for patient using refId ,locationUid ,filter
    When the client requests for patients in ward location uid "urn:va:location:9E7A:158" with reference id of "38" filtered by 'eq(familyName,"EIGHT")'
    Then a successful response is returned
    And the client receives 1 VPR VistA result(s)
    And the VPR results contain
      | field       | value                            |
      | birthDate   | 19350407                         |
      | icn         | 10108V420871                |
      | familyName  | EIGHT                            |
      | displayName | Eight,Patient                 |
      | fullName    | EIGHT,PATIENT                    |
      | genderCode  | urn:va:pat-gender:M              |
      | genderName  | MALE                             |
      | sensitive   | false                            |
      | summary     | Eight,Patient                   |
      |ssn          | *****0008                       |

    @F144_SearchWard_7 @vxsync @enrich
    Scenario: Ward searches for patient using refId ,locationUid ,filter and making sure roomBed is in VPR results
    When the client requests for patients in ward location uid "urn:va:location:9E7A:8" with reference id of "8" filtered by 'eq(familyName,"EIGHTY")'
    Then a successful response is returned
    And the client receives 1 VPR VistA result(s)
    And the VPR results contain
      | field       | value                            |
      | birthDate   | 19450309                         |
      | icn         | 5000000289V616346               |
      | familyName  | EIGHTY                            |
      | displayName | Eighty,Inpatient                |
      | fullName    | EIGHTY,INPATIENT                    |
      | genderCode  | urn:va:pat-gender:M              |
      | genderName  | MALE                             |
      | sensitive   | false                            |
      | summary     | Eighty,Inpatient                  |
      |ssn          |  *****0880                       |
      | localId     | 100788                           |
      |roomBed       | ICU-5                       |
