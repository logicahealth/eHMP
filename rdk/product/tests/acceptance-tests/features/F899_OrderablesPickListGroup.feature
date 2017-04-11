@F899 @orderables
Feature:F899 - Orderable Pick-list Service

@F899_1_Orderables_alltypes @US12254
  Scenario: Create Endpoint for 'All' Order type with search string
  When the client requests picklist with the parameters and site "9E7A"
  | paramter name | value                 |
  | type          | orderables            |
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

  When the client requests picklist with the parameters and site "C877"
  | paramter name | value                 |
  | type          | orderables            |
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
  When the client requests picklist with the parameters and site "9E7A"
  | paramter name | value      |
  | type          | orderables |
  | subtype       | all        |
  Then a successful response is returned


@F899_3_Orderables_labs @US12254
  Scenario: Create Endpoint for 'Lab' Order type with search string
  When the client requests picklist with the parameters and site "C877"
  | paramter name | value                                   |
  | type          | orderables |
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


@F899_4_Orderables_alltypes @US12254
  Scenario: Get orderables
  Given an order-set for the user
  And a quick-order for the user
  And an enterprise-orderable for the user
  When the user requests orderables of type ""
  Then a successful response is returned
  And there are 5 orderables in the results
  And the orderables results contain
  | field           | value                       |
  | name            | HYPERSEGMENTED NEUTROPHILS  |
  | typeOfOrderable | lab                         |
  | name            | HYPERSEGMENTED NEUTROPHILS  |
  | typeOfOrderable | lab                         |
  | name            | Hypertensive Patient OS2    |
  | typeOfOrderable | set                         |
  | name            | Hypertensive Patient QO     |
  | typeOfOrderable | quick                       |
  | name            | Hypertensive Patient EO     |
  | typeOfOrderable | entr                        |


@F899_5_Orderables_singletypes @US12254
  Scenario: Get single types of orderables
  Given an order-set for the user
  And a quick-order for the user
  And an enterprise-orderable for the user
  When the user requests orderables of type "lab"
  Then a successful response is returned
  And there are 2 orderables in the results
  And the orderables results contain
  | field           | value                       |
  | name            | HYPERSEGMENTED NEUTROPHILS  |
  | typeOfOrderable | lab                         |
  | name            | HYPERSEGMENTED NEUTROPHILS  |
  | typeOfOrderable | lab                         |

  When the user requests orderables of type "quick"
  Then a successful response is returned
  And there are 1 orderables in the results
  And the orderables results contain
  | field           | value                       |
  | name            | Hypertensive Patient QO     |
  | typeOfOrderable | quick                       |

  When the user requests orderables of type "set"
  Then a successful response is returned
  And there are 1 orderables in the results
  And the orderables results contain
  | field           | value                       |
  | name            | Hypertensive Patient OS2    |
  | typeOfOrderable | set                         |


@F899_6_Orderables_multipletypes @US12254
  Scenario: Get multiple (but not all) types of orderables
  Given an order-set for the user
  And a quick-order for the user
  And an enterprise-orderable for the user
  When the user requests orderables of type "quick:set"
  Then a successful response is returned
  And there are 2 orderables in the results
  And the orderables results contain
  | field           | value                       |
  | name            | Hypertensive Patient QO     |
  | typeOfOrderable | quick                       |
  | name            | Hypertensive Patient OS2    |
  | typeOfOrderable | set                         |

  When the user requests orderables of type "lab:quick"
  Then a successful response is returned
  And there are 3 orderables in the results
  And the orderables results contain
  | field           | value                       |
  | name            | Hypertensive Patient QO     |
  | typeOfOrderable | quick                       |
  | name            | HYPERSEGMENTED NEUTROPHILS  |
  | typeOfOrderable | lab                         |
  | name            | HYPERSEGMENTED NEUTROPHILS  |
  | typeOfOrderable | lab                         |


@F899_7_Orderables_sorted @US12254
  Scenario: Orderables should be sorted by name
  Given an order-set for the user
  And a quick-order for the user
  And an enterprise-orderable for the user
  When the user requests orderables of type "all"
  Then a successful response is returned
  And the results are sorted by name


@F899_8_Orderables_enterprise @US12254
  Scenario: Get all enterprise orderables
  Given an enterprise-orderable for the user
  When the user requests orderables of type "entr"
  Then a successful response is returned
  And there are 1 orderables in the results
  And the orderables results contain
  | field           | value                       |
  | name            | Hypertensive Patient EO     |
  | typeOfOrderable | entr                        |


