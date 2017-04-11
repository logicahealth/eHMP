@F144_SearchClinics
Feature: F144 - eHMP Viewer GUI - Patient Search (Clinics)

  Background:
      #Given a patient Search using Clinics

  @F144_SearchClinics_1 @vxsync @enrich
  Scenario: User searches for clinics
    When the client requests picklist with the parameters for "clinics-fetch-list" with the user "9E7A;PW    "
    | paramter name | value                 |
    Then a successful response is returned
    And the client receives at least 1 location

  @F144_SearchClinics_2 @vxsync @enrich
  Scenario: searches for clinics for patient using locationUid ,filter and startDate
    When the client requests for patients in clinic location uid "urn:va:location:9E7A:23" with start date of "20010725" filtered by 'eq(familyName,"EIGHT")'
    Then a successful response is returned
    # And the client receives 4 VPR VistA result(s)
    And the client receives 1 VPR VistA result(s)
    And the VPR results contain
      | field       | value                            |
      | birthDate   | 04/07/1935                       |
      | icn         | 10108V420871                     |
      | familyName  | EIGHT                            |
      | displayName | Eight, Patient                   |
      | fullName    | EIGHT,PATIENT                    |
      | genderCode  | M                                |
      | genderName  | Male                             |
      | sensitive   | false                            |
      | summary     | Eight,Patient                    |
      | ssn         | ***-**-0008                      |

  @F144_SearchClinics_3
  Scenario: searches for clinics for patient using locationUid ,filter
    When the client requests for patients in clinic location uid "urn:va:location:9E7A:23" filtered by 'eq(familyName,"EIGHT")'
    Then a successful response is returned

  @F144_SearchClinics_4
  Scenario: searches for clinics for patient using locationUid ,filter , startDate and stopDate
    When the client requests for patients in clinic location uid "urn:va:location:9E7A:23" with start date of "20010725" and end date of "20100725" filtered by 'eq(familyName,"EIGHT")'
    Then a successful response is returned
    And the client receives 1 VPR VistA result(s)
