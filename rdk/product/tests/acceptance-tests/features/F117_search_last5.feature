@F117_searchlast5 @US1971 @vxsync @enrich
Feature: F117 Searching for patient with first letter of last name + last 4 social security number digits

  Background:
      #Given a patient with "last5"

  @US1971 @F117_searchlast5_1
  Scenario: When a user searches for patient with first letter of last name + last 4 social security number digits
    When the client requests for the patient "B0008" starting with "0" and limited to "5"
    Then a successful response is returned
    #And the client receives 1 VPR VistA result(s)
    And the client receives 1 result(s)
    #And the client receives 1 RDK result(s) with start index of 0 and results limit of 5 per page
    And the RDK last5 search results contain
      | field       | value                                        |
      | displayName | Bcma, Eight                                  |
      | birthDate   | 04/07/1945                                   |
      | familyName  | BCMA                                         |
      | genderName  | Male                                         |
      | givenNames  | EIGHT                                        |
      | pid         | 9E7A;100022                                  |
      | ssn         |  ***-**-0008                                 |
      | summary     | Bcma,Eight                                   |
      | localId     | 100022                                       |

  @US1971 @F117_searchlast5_2
  Scenario: When a user searches for patient with patient limited to 0
    When the client sends a request for the patient "Z8372" starting with "0"
    Then a successful response is returned
    #And the client receives 0 RDK result(s) with start index of 0
    #And the client receives 0 VPR VistA result(s)
    And the client receives 0 result(s)

  @US1971 @F117_searchlast5_3
  Scenario: When a user searches for patient atient limited to 1 and should not contain uidHref
    When the client requests for the patient "B0008" starting with "0" and limited to "1"
    Then a successful response is returned
    #And the client receives 1 RDK result(s) with start index of 0
    #And the client receives 1 VPR VistA result(s)
    And the client receives 1 result(s)
    And the result(s) should not contain "uidHref"

@DE3248_1
Scenario: Search for Sensitive patients and set the limit
  When the client performs a fullName search through RDK API with search term "zzzretfivefifty" and the limit 10
  Then a successful response is returned
  And the client receives 10 RDK VistA result(s)

  And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTY                       |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | true                                  |
  | ssn         | *SENSITIVE*                           |
  | birthDate   | *SENSITIVE*                           |

And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYEIGHT                  |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | false                                 |
  | ssn         | ***-**-2633                           |
  | birthDate   | 04/07/1935                            |

And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYFIVE                   |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | false                                 |
  | ssn         | ***-**-0330                           |
  | birthDate   | 04/07/1935                            |

And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYFOUR                   |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | false                                 |
  | ssn         | ***-**-1111                           |
  | birthDate   | 04/07/1935                            |


  And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYNINE                   |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | true                                  |
  | ssn         | *SENSITIVE*                           |
  | birthDate   | *SENSITIVE*                           |

  And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYONE                    |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | true                                  |
  | ssn         | *SENSITIVE*                           |
  | birthDate   | *SENSITIVE*                           |

  And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYSEVEN                  |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | false                                 |
  | ssn         | ***-**-5564                           |
  | birthDate   | 04/07/1935                            |

  And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYSIX                    |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | false                                 |
  | ssn         | ***-**-9921                           |
  | birthDate   | 04/07/1935                            |

And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYTHREE                  |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | false                                 |
  | ssn         | ***-**-9109                           |
  | birthDate   | 04/07/1935                            |

And the VPR results contain
  | field       | value                                 |
  | familyName  | ZZZRETFIVEFIFTYTWO                    |
  | givenNames  | PATIENT                               |
  | genderName  | Male                                  |
  | sensitive   | false                                 |
  | ssn         | ***-**-2354                           |
  | birthDate   | 04/07/1935                            |


  