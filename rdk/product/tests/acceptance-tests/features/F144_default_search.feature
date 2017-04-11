@F144_defaultsearch_api @vxsync @other
Feature: F144 - eHMP Viewer GUI
#Feature: F168 - Patient Search Enhancements

#Search for default patient via the CPRS Patient Search Resource Server

#Team Andromeda

  @US2094 @US3759 @vimm
  Scenario: When a user searches for default patient and gets results back
    When the client requests default patient search with accessCode "9E7A;1tdnurse" in VPR format from RDK API
    Then a successful response is returned
    And the VPR results contain
      | field       | value                                   |
      | pid         | 9E7A;100726                             |
      | familyName  | EIGHTEEN                                |
      | givenNames  | INPATIENT                               |
      | fullName    | EIGHTEEN,INPATIENT                      |
      | genderName  | Male                                    |
      | sensitive   | false                                   |
      | ssn         | ***-**-0818                             |
      | age         | 71                                      |
      | locationName| 7A GEN MED                              |
