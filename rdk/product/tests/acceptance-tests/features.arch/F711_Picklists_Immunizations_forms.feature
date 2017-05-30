
#waiting for immunization RPC to be pushed to Dev.  Once that is pushed future tag can be removed.

@picklists_immunizations_forms @DE3059

Feature: F711 - Integrate dynamic picklists for Immunizations forms

@F711_1_immunization_statment @US9003
Scenario: Endpoint for Vaccine Information Statement File (PXVIMM VIS)
  When the client requests picklist with the parameters for "immunization-vaccine-info-statement" with the user "REDACTED"
      | paramter name | value                               |

  Then a successful response is returned
  And the picklist result contains
      | field         | value                    |
      | record        | 1 OF 80                  |
      | ien           | 1                        |
      | name          | ADENOVIRUS VIS           |
      | editionDate   | JUL 14, 2011             |
      | editionStatus | HISTORIC                 |
      | language      | ENGLISH                  |
      | visText       | EMPTY                    |
      | twoDBarCode   | 253088698300001111110714 |
      | visUrl        | EMPTY                    |
      | status        | INACTIVE                 |



@F711_2_immunization_info_source_file @US9004
Scenario: Endpoint for Immunization Info Source File (PXVIMM INFO SOURCE)
  When the client requests picklist with the parameters for "immunization-info-source" with the user "REDACTED"
      | paramter name | value                    |

  Then a successful response is returned
  And the picklist result contains
      | field   | value                                          |
      | ien     | 17                                              |
      | name    | HISTORICAL INFORMATION - FROM BIRTH CERTIFICATE |
      | hl7Code | 06                                             |
      | status  | 1                                              |


@F711_3_immunization_admin_route @US9005
Scenario: Endpoint for Immunization Administration Route File (PXVIMM ADMIN ROUTE)
  When the client requests picklist with the parameters for "immunization-admin-route" with the user "REDACTED"
      | paramter name | value                    |

  Then a successful response is returned
  And the picklist result contains
      | field   | value       |
      | ien     | 1           |
      | name    | INTRADERMAL |
      | hl7Code | ID          |
      | status  | 1           |

@F711_4_immunization_admin_site @US9006
Scenario: Endpoint for Immunization Administration Site File (PXVIMM ADMIN SITE)
  When the client requests picklist with the parameters for "immunization-admin-site" with the user "REDACTED"
      | paramter name | value                    |

  Then a successful response is returned
  And the picklist result contains
      | field   | value        |
      | ien     | 2            |
      | name    | LEFT DELTOID |
      | hl7Code | LD           |
      | status  | 1            |


@F711_5_immunization_manufacturer @US9007
Scenario: Endpoint for Immunization Manufacturers File (PXVIMM IMM MAN)
  When the client requests picklist with the parameters for "immunization-manufacturer" with the user "REDACTED"
      | paramter name | value                     |

  Then a successful response is returned
  And the picklist result contains
      | field        | value                                   |
      | record       | 1 OF 71                                 |
      | ien          | 1                                       |
      | name         | ABBOTT LABORATORIES                     |
      | mvx          | AB                                      |
      | inactiveFlag | ACTIVE                                  |
      | cdcNotes     | includes Ross Products Division, Solvay |
      | status       | ACTIVE                                  |


@F711_6_immunization_lot @US9008
Scenario: | Endpoint for Immunization Lot File (PXVIMM IMM LOT)
  When the client requests picklist with the parameters for "immunization-lot" with the user "REDACTED"
      | paramter name | value            |

  Then a successful response is returned
  And the picklist result contains
      | field          | value                                              |
      | record         | 1 OF 67                                            |
      | ien            | 15                                                 |
      | lotNumber      | A0430EE                                            |
      | manufacturer   | CSL BEHRING, INC                                   |
      | status         | INACTIVE                                           |
      | vaccine        | INFLUENZA, SEASONAL, INJECTABLE, PRESERVATIVE FREE |
      | expirationDate | EMPTY                                              |
      | dosesUnused    | 300                                                |
      | lowSupplyAlert | EMPTY                                              |
      | ndcCodeVa      | EMPTY                                              |


@F711_7_immunization_data @US10263
Scenario: | Endpoint for Immunization Data (PXVIMM IMMDATA)
  When the client requests picklist with the parameters for "immunization-data" with the user "REDACTED"
      | paramter name | value             |

  Then a successful response is returned
  And the picklist result contains
      | field              | value                       |
      | ien                | 1                           |
      | name               | VACCINIA (SMALLPOX)         |
      | shortName          | SMALLPOX                    |
      | cvxCode            | 75                          |
      | maxInSeries        | EMPTY                       |
      | inactiveFlag       | 0                           |
      | vaccineGroup       | EMPTY                       |
      | mnemonic           | EMPTy                       |
      | acronym            | EMPTY                       |
      | selectableHistoric | Y                           |
      | cdcFullVaccineName | VACCINIA (SMALLPOX) VACCINE |
      | codingSystem       | EMPTY                       |
      | vaccineInfoStmt    | EMPTY                       |
      | cdcProductName     | CONTAINS ACAM2000           |
      | synonym            | EMPTY                       |


