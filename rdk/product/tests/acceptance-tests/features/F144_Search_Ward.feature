@F144_SearchWard
Feature: F144 - eHMP Viewer GUI - Patient Search (Ward)

  Background:
      #Given a search for patient with range



  @F144_SearchWard_2 @vxsync @enrich
  Scenario: Ward searches for patient using locationUid, filter
    When the client requests for patients in ward location uid "urn:va:location:SITE:w38" filtered by 'eq(familyName,"EIGHT")'s
    Then a successful response is returned
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

    @F144_SearchWard_3 @vxsync @enrich
    Scenario: Ward searches for patient using locationUid, filter and making sure roomBed is in VPR results
    When the client requests for patients in ward location uid "urn:va:location:SITE:w8" filtered by 'eq(familyName,"EIGHTY")'
    Then a successful response is returned
    And the client receives 1 VPR VistA result(s)
    And the VPR results contain
      | field       | value                            |
      | birthDate   | 03/09/1945                       |
      | icn         | 5000000289V616346                |
      | familyName  | EIGHTY                           |
      | displayName | Eighty, Inpatient                |
      | fullName    | EIGHTY,INPATIENT                 |
      | genderCode  | M                                |
      | genderName  | Male                             |
      | sensitive   | false                            |
      | summary     | Eighty,Inpatient                 |
      | ssn         |  ***-**-0880                     |
      | localId     | 100788                           |
      | roomBed     | ICU-5                            |
