@picklist_enhancement_for_writeback_2 @F639 

Feature:F639 - Picklist Enhancement for Writeback

@F639_1_Outpatient_Medication_Endpoint_For_Caculate_Days_Supply @US9740 @debug @DE3059
Scenario: Create Endpoint for Calculate Days Supply (ORWDPS1 DFLTSPLY) (Medication)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value                          |
      | type          | medication-orders-default-days |
      | patientDFN    | 0^                             |
      | unitStr       | 0                              |
      | schedStr      | 240                            |
      | drug          | 0                              |
      | oi            | 0                              |
  Then a successful response is returned
  And the result contains 
      | field      | value |
      |defaultDays | 90    |

@F639_2_Outpatient_Medication_Endpoint_For_Caculate_Quantity @US9741  @DE3059
Scenario: Create Endpoint for Calculate Quantity (ORWDPS2 DAY2QTY) (Medication)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value                                      |
      | type          | medication-orders-quantity-for-days-supply |
      | patientDFN    | 146                                        |
      | daysSupply    | 30                                         |
      | unitsPerDose  | 1^                                         |
      | schedule      | QOD PRN^                                   |
      | duration      | ~^                                         |
      | drug          | 213                                        |

  Then a successful response is returned
  And the result contains 
      | field                 | value |
      | quantityForDaysSupply | 15    |


@F639_3_Outpatient_Medication_Endpoint_For_Caculate_Max_Refills @US9742 @DE3059
Scenario: Create Endpoint for Calculate Max Refills (ORWDPS2 MAXREF) Medication)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value                              |
      | type          | medication-orders-calc-max-refills |
      | patientDFN    | 398                                |
      | days          | 90                                 |
      | ordItem       | 2086                               |
      | discharge     | false                              |
      | drug          | 1188                               |

  Then a successful response is returned
  And the result contains 
      | field      | value |
      | maxRefills | 3     |

@F639_4_Outpatient_Medication_Endpoint_For_Supplemental_Drug_Message @US9743
Scenario: Create Endpoint for Supplemental Drug Message (ORWDPS32 DRUGMSG) (Medication)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value                                   |
      | type          | medication-orders-dispense-drug-message |
      | ien           | 5030                                    |

  Then a successful response is returned
  And the result contains 
      | field       | value                                 |
      | dispenseMsg | RESTRICTED TO METABOLIC/ENDOCRINOLOGY |
      | quantityMsg |                                       |

@F639_5_Outpatient_medication_defaults
Scenario: Returns Outpatient medication priorities, display messages, refills, and pickup options (ORWDPS1 ODSLCT)
#Note:  pharmacyType = U/F/O is either U, F, or O - U = Unit Dose, F = IV Fluids, and O = Outpatient) 
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value               |
      | type          | medication-defaults |
      | pharmacyType  | O                   |
      | locationIen   | 3                   |
      
  Then a successful response is returned
  And the picklist result contains 
      | field        | value    |
      | categoryName | Priority |
      | values.ien   | 2        |
      | values.name  | ASAP     |
      | values.ien   | 99       |
      | values.name  | DONE     |
      | values.ien   | 9        |
      | values.name  | ROUTINE  |
      | values.ien   | 1        |
      | values.name  | STAT     |
  And the picklist result contains 
      | field        | value   |
      | categoryName | DispMsg |
  And the picklist result contains 
      | field        | value   |
      | categoryName | Refills |
  And the picklist result contains 
      | field        | value  |
      | categoryName | Pickup |

@F639_6_Outpatient_medication_PKI_Digital_Sig
Scenario: Determines if the PKI Digital Signature is enabled on the site (ORWOR PKISITE)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value       |
      | type          | pki-enabled |
      
  Then a successful response is returned
  And the result contains 
      | field        | value |
      | enabled      | true  |
      

@F639_7_Outpatient_medication_ORDER_QUICK_VIEW_file @DE3059
Scenario: Retrieves Outpatient Medication ORDER QUICK VIEW file #101.44 subset of orderable items or quick orders in alphabetical order to specific sequence numbers (ORWUL FV4DG)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value           |
      | type          | medication-list |
      | searchString  | O RX            |
      
  Then a successful response is returned
  And the picklist result contains 
      | field             | value |
      | ien               | 95    |
      | totalCountOfItems | 2859  |

@F639_8_Outpatient_medication_index_based_on_search
Scenario: Get the index of a medication that meets a search term (ORWUL FVIDX)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value               |
      | type          | medication-index |
      | ien           | 95               |
      | searchString  | ACES~ |
      
  Then a successful response is returned
  And the picklist result contains 
      | field  | value                          |
      | ien    | 42                             |
      | name   | CONTAINS ACETAMINOPHEN ELIXIR  |


@F639_9_Outpatient_medication_schedules
Scenario: Get the iOutpatient medication schedules (ORWDPS1 SCHALL)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value               |
      | type          | medication-schedules |

  Then a successful response is returned
  And the picklist result contains 
      | field               | value    |
      | scheduleName        | 3ID      |
      | outpatientExpansion | EMPTY    |
      | scheduleType        | C        |
      | administrationTime  | 08-16-24 |
  And the picklist result contains 
      | field               | value |
      | scheduleName        | 3XW   |
      | outpatientExpansion | EMPTY |
      | scheduleType        | C     |
      | administrationTime  | 10    |
  And the picklist result contains 
      | field               | value          |
      | scheduleName        | 5XD            |
      | outpatientExpansion | EMPTY          |
      | scheduleType        | C              |
      | administrationTime  | 02-07-12-17-22 |


@F639_10_Outpatient_medication_dosage_dispense_route_schedule
Scenario: Get the Outpatient medication sOutpatient medication dosages, dispense, route, schedule, guideline, message, DEA schedule. (ORWDPS2 OISLCT)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value               |
      | type          | medication-order-defaults |
      | ien           | 4937    |
      | pharmacyType  | O|
      | outpatientDFN | 204 |
      | needPatientInstructions| true|
      | pkiEnabled  |  true |

  Then a successful response is returned
  And the picklist result contains 
      | field                     | value                       |
      | categoryName              | Medication                  |
      | default.orderableItemIen  | 4937                        |
      | default.orderableItemName | CONTAINS LEVOCETIRIZINE TAB |
  And the picklist result contains 
      | field        | value |
      | categoryName | Verb  |
      | default.verb | TAKE  |
      And the picklist result contains 
      | field               | value       |
      | categoryName        | Preposition |
      | default.preposition | BY          |
   And the picklist result contains 
      | field                   | value                       |
      | categoryName            | AllDoses                    |
      | values.strength         | 5MG                         |
      | values.nationalDrugId   | 3038                        |
      | values.prescriptionText | 5&MG&1&TABLET&5MG&3038&5&MG |
   And the picklist result contains 
      | field        | value  |
      | categoryName | Dosage |
   And the picklist result contains 
      | field        | value    |
      | categoryName | Dispense |
   And the picklist result contains 
      | field        | value |
      | categoryName | Route |
   And the picklist result contains 
      | field        | value    |
      | categoryName | Schedule |
    And the picklist result contains 
      | field        | value     |
      | categoryName | Guideline |
    And the picklist result contains 
      | field        | value   |
      | categoryName | Message |
   And the picklist result contains 
      | field        | value       |
      | categoryName | DEASchedule |

@F639_11_Outpatient_medication_list
Scenario: Get list of available Med Orders (ORWUL FVSUB)
  When the client requests picklist with the parameters and site "9E7A"
      | paramter name | value             |
      | type          | medication-orders |
      | ien           | 95                |
      | first         | 1501              |
      | last          | 1600              |
 
  Then a successful response is returned
  And the picklist result contains 
      | field | value                               |
      | ien   | 4152                                |
      | name  | CONTAINS LACTOBACILLUS TAB,CHEWABLE |
  And the picklist result contains 
      | field | value                               |
      | ien   | 4202                                |
      | name  | CONTAINS LOPERAMIDE LIQUID,ORAL     |

