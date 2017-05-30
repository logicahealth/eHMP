@F899 @orderables
Feature:F899 - Orderable Pick-list Service




@F899_4_Orderables_alltypes @US12254 @future
  Scenario: Get orderables
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


@F899_5_Orderables_singletypes @US12254 @future
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


@F899_6_Orderables_multipletypes @US12254 @future
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
  | field               | value                       |
  | name                | Rheumatology     |
  | facility-enterprise | enterprise                        |


