Feature: Tests that use the undefined test step -the client requests picklist with the parameters for-

 @F144_SearchWard_1 @vxsync @enrich
  Scenario: User ward searches for wards
    When the client requests picklist with the parameters for "wards-fetch-list" with the user "SITE;USER  "
    | paramter name | value                 |
    Then a successful response is returned
    And the client receives at least 1 location

  @F144_SearchClinics_1 @vxsync @enrich
  Scenario: User searches for clinics
    When the client requests picklist with the parameters for "clinics-fetch-list" with the user "SITE;USER  "
    | paramter name | value                 |
    Then a successful response is returned
    And the client receives at least 1 location

 @F899_1_Orderables_Search @US11561 @DE4192
  Scenario: The returned orderables data contains searching strings
  Given the client requests picklist with the parameters for "orderables" with the user "SITE;USER  "
  | paramter name | value                 |
  | subtype       | All                   |
  | searchString  | URINE                 |
  And a successful response is returned
  When the client send a orderable request for searching string "URINE"
  Then the field of name in the orderable data contains a string "URINE"
  And the field of type in the orderable data contains a string "vista-orderable"
  And the field of domain in the orderable data contains a string "ehmp-order"
  And the field of subDomain in the orderable data contains a string "laboratory"
  And the field of state in the orderable data contains a string "active"
  And the field of facility-enterprise in the orderable data contains a string "SITE"

@F899_1_Orderables_alltypes @US12254
  Scenario: Create Endpoint for 'All' Order type with search string
  When the client requests picklist with the parameters for "orderables" with the user "SITE;USER  "
  | paramter name | value                 |
  | subtype       | All                   |
  | searchString  | URINE                 |
  Then a successful response is returned
  And there are 56 orderables in the results
  And the picklist result contains
  | field           | value               |
  | ien             | 1239                |
  | name            | PROV URINE          |
  | synonym         | PROV URINE          |
  | typeOfOrderable | lab                 |

  When the client requests picklist with the parameters for "orderables" with the user "SITE;USER  "
  | paramter name | value                 |
  | searchString  | URINE                 |
  Then a successful response is returned
  And there are 56 orderables in the results
  And the picklist result contains
  | field           | value               |
  | ien             | 1239                |
  | name            | PROV URINE          |
  | synonym         | PROV URINE          |
  | typeOfOrderable | lab                 |


@F899_2_Orderables_alltypes @US12254
  Scenario: searching for orderables without searchString
  When the client requests picklist with the parameters for "orderables" with the user "SITE;USER  "
  | paramter name | value      |
  | subtype       | all        |
  Then a successful response is returned


@F899_3_Orderables_labs @US12254
  Scenario: Create Endpoint for 'Lab' Order type with search string
  When the client requests picklist with the parameters for "orderables" with the user "SITE;USER  "
  | paramter name | value                                   |
  | subtype       | Lab   |
  | searchString  | Blood |
  Then a successful response is returned
  And there are 17 orderables in the results
  And the picklist result contains
  | field           | value                   |
  | ien             | 1048                    |
  | synonym         | BLOOD CULTURE SET #1    |
  | name            | BLOOD CULTURE SET #1    |
  | typeOfOrderable | lab                     |