@F144_SearchClinics
Feature: F144 - eHMP Viewer GUI - Patient Search (Clinics)

  Background:
      #Given a patient Search using Clinics

  @F144_SearchClinics_1_1 @vxsync @enrich
  Scenario: User searches for clinics using name and limited to "10"
    When the client requests for clinics with names beginning with "c" and site code of "9E7A" start index of 0 limited to 10
    Then a successful response is returned
    And the client receives 3 VPR VistA result(s)
    And the client receives 3 RDK result(s) with start index of 0 and results limit of 10 per page

  @F144_SearchClinics_1_2 @vxsync @enrich
  Scenario: User searches for clinics limited to "10"
    When the client requests for clinics with and site code of "9E7A" start index of 0 limited to 10
    Then a successful response is returned
    And the client receives 10 VPR VistA result(s)
    And the client receives at least 36 RDK result(s) with start index of 0 and results limit of 10 per page
    And the VPR results contain
      | field       | value                                    |
      | localId     | 64                                       |
      | refId       | 64                                       |
      | name        | AUDIOLOGY                                |
      | shortName   | AUD                                      |
      | type        | C                                        |
      | typeName    | Clinic                                   |
      | facilityCode| 998                                      |
      | facilityName| ABILENE (CAA)                            |
      | displayName | Audiology                                |
      | uid         | urn:va:location:9E7A:64                  |
      | summary     | Location{uid='urn:va:location:9E7A:64'}  |
      | oos         | false                                    |

  @F144_SearchClinics_2_1
  Scenario: User searches for clinics using name
    When the client requests for clinics with names beginning with "c" and site code of "9E7A" start index of 0
    Then a successful response is returned
    And the client receives 3 VPR VistA result(s)

  @F144_SearchClinics_2_2
  Scenario: User searches for clinics with patient limited to 0
    When the client requests for clinics with and site code of "9E7A" start index of 0
    Then a successful response is returned
    And the client receives at least 36 VPR VistA result(s)

  @F144_SearchClinics_3
  Scenario: User searches for clinics for patient with patient limited to 1 and should not contain uidHref
    When the client requests for clinics with site code of "9E7A" start index of 0 limited to 1
    Then a successful response is returned
    And the client receives 1 VPR VistA result(s)
    And the result(s) should not contain "uidHref"

  @F144_SearchClinics_4
  Scenario: User searches for clinics using name and facilityCode
    When the client requests for clinics with names beginning with "c" and facility code of "998" site code of "9E7A"
    Then a successful response is returned
    And the client receives 1 VPR VistA result(s)

  @F144_SearchClinics_5
  Scenario: User searches for clinics for patient using siteCode
    When the client requests for clinics with site code of "C877"
    Then a successful response is returned
    And the client receives at least 36 VPR VistA result(s)

  @F144_SearchClinics_6 @vxsync @enrich
  Scenario: searches for clinics for patient using locationUid ,filter and startDate
    When the client requests for patients in clinic location uid "urn:va:location:9E7A:23" with start date of "20010725" filtered by 'eq(familyName,"EIGHT")'
    Then a successful response is returned
    # And the client receives 4 VPR VistA result(s)
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
      |ssn          | *****0008                        |

  @F144_SearchClinics_7
  Scenario: searches for clinics for patient using locationUid ,filter
    When the client requests for patients in clinic location uid "urn:va:location:9E7A:23" filtered by 'eq(familyName,"EIGHT")'
    Then a successful response is returned

  @F144_SearchClinics_8
  Scenario: searches for clinics for patient using locationUid ,filter , startDate and stopDate
    When the client requests for patients in clinic location uid "urn:va:location:9E7A:23" with start date of "20010725" and end date of "20100725" filtered by 'eq(familyName,"EIGHT")'
    Then a successful response is returned
    And the client receives 1 VPR VistA result(s)
