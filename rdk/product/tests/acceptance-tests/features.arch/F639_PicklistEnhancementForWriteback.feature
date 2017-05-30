@picklist_enhancement_for_writeback_1  @F639 @DE3059

Feature:F639 - Picklist Enhancement for Writeback

@F639_2_Radiology_Endpoint_For_Radiology_type @US9322
Scenario: Create Endpoint for ORWDRA32 IMTYPSEL (RADIOLOGY)
  When the client requests picklist with the parameters for "radiology-imaging-types" with the user "REDACTED"
      | paramter name | value                                   |

  Then a successful response is returned
  And the picklist result contains
      | field           | value                      |
      | ien             | 6                          |
      | typeOfImaging   | ANGIO/NEURO/INTERVENTIONAL |
      | abbreviation    | ANI                        |
      | ienDisplayGroup | 37                         |
      And the picklist result contains
      | field           | value                      |
      | ien             | 5                          |
      | typeOfImaging   | CT SCAN                    |
      | abbreviation    | CT                         |
      | ienDisplayGroup | 35                         |
      And the picklist result contains
      | field           | value                      |
      | ien             | 9                          |
      | typeOfImaging   | MAMMOGRAPHY                |
      | abbreviation    | MAM                        |
      | ienDisplayGroup | 42                         |
      And the picklist result contains
      | field           | value                      |
      | ien             | 4                          |
      | typeOfImaging   | MAGNETIC RESONANCE IMAGING |
      | abbreviation    | MRI                        |
      | ienDisplayGroup | 36                         |
      And the picklist result contains
      | field           | value                      |
      | ien             | 2                          |
      | typeOfImaging   | NUCLEAR MEDICINE           |
      | abbreviation    | NM                         |
      | ienDisplayGroup | 39                         |
      And the picklist result contains
      | field           | value                      |
      | ien             | 1                          |
      | typeOfImaging   | GENERAL RADIOLOGY          |
      | abbreviation    | RAD                        |
      | ienDisplayGroup | 9                          |
      And the picklist result contains
      | field           | value                      |
      | ien             | 3                          |
      | typeOfImaging   | ULTRASOUND                 |
      | abbreviation    | US                         |
      | ienDisplayGroup | 40                         |


@F639_3_Radiology_Endpoint_For_Radiology_Dialog_Default @US9323
Scenario: Create Endpoint for ORWDRA32 DEF (RADIOLOGY)
  When the client requests picklist with the parameters for "radiology-dialog-default" with the user "REDACTED"
      | paramter name | value                    |
      | type          | radiology-dialog-default |
      | pid           | 9E7A;100623              |
      | imagingType   | 40                       |

  Then a successful response is returned
  And the picklist result contains
      | field           | value              |
      | categoryName    |  ShortList         |
   And the picklist result contains
      | field                              | value                                          |
      | categoryName                       | Common Procedures                              |
      | values.ien                         | 3320                                           |
      | values.name                        | ECHO EXAM OF HEART                             |
      | values.ien                         | 3083                                           |
      | values.name                        | ECHOCARDIOGRAM M-MODE &/OR REAL TIME W/IMAGING |
      | values.ien                         | 3079                                           |
      | values.name                        | ECHOCARDIOGRAM M-MODE COMPLETE                 |
      | values.ien                         | 3081                                           |
      | values.name                        | ECHOCARDIOGRAM REAL-TIME COMPLETE              |
      | values.ien                         | 3082                                           |
      | values.name                        | ECHOCARDIOGRAM REAL-TIME LTD                   |
      | values.ien                         | 3068                                           |
      | values.name                        | ECHOENCEPHALOGRAM B-SCAN &/OR REALTIME         |
      | values.ien                         | 3067                                           |
      | values.name                        | ECHOENCEPHALOGRAM COMPLETE                     |
      | values.ien                         | 3066                                           |
      | values.name                        | ECHOENCEPHALOGRAM MIDLINE                      |
      | values.ien                         | 3086                                           |
      | values.name                        | ECHOGRAM ABDOMEN COMPLETE                      |
      | values.requiresRadiologistApproval | false                                          |
      | values.ien                         | 3087                                           |
      | values.name                        | ECHOGRAM ABDOMEN LTD                           |
      | values.requiresRadiologistApproval | false                                          |
      | values.ien                         | 3110                                           |
      | values.name                        | ECHOGRAM AFTER HOURS                           |
      | values.ien                         | 3106                                           |
      | values.name                        | ECHOGRAM AMNIOCENTESIS COMPLETE                |
      | values.ien                         | 3077                                           |
      | values.name                        | ECHOGRAM CHEST A-MODE                          |
      | values.requiresRadiologistApproval | false                                          |
  And the picklist result contains
      | field        | value     |
      | categoryName | Modifiers |
      | values.ien   | 29        |
      | values.name  | LEFT-U    |
 And the picklist result contains
      | field        | value     |
      | categoryName | Urgencies |
      | values.ien   | 2         |
      | values.name  | ASAP      |
      | values.ien   | 9         |
      | values.name  | ROUTINE   |
      | values.ien   | 1         |
      | values.name  | STAT      |
      | default.ien  | 9         |
      | default.name | ROUTINE   |
  And the picklist result contains
      | field        | value      |
      | categoryName | Transport  |
      | values.ien   | A          |
      | values.name  | AMBULATORY |
      | values.ien   | P          |
      | values.name  | PORTABLE   |
      | values.ien   | S          |
      | values.name  | STRETCHER  |
      | values.ien   | W          |
      | values.name  | WHEELCHAIR |
  And the picklist result contains
      | field        | value      |
      | categoryName | Category   |
      | values.ien   | I          |
      | values.name  | INPATIENT  |
      | values.ien   | O          |
      | values.name  | OUTPATIENT |
      | values.ien   | E          |
      | values.name  | EMPLOYEE   |
      | values.ien   | C          |
      | values.name  | CONTRACT   |
      | values.ien   | R          |
      | values.name  | RESEARCH   |
  And the picklist result contains
      | field                  | value          |
      | categoryName           | Submit to      |
      | values.ien             | 24             |
      | values.name            | SBK ULTRASOUND |
      | values.imagingLocation | 500            |
      | values.institutionFile | CAMP MASTER    |
      | default.ien            | 24             |
      | default.name           | SBK ULTRASOUND |
  And the picklist result contains
      | field        | value      |
      | categoryName | Ask Submit |
      | default.ien  | 1          |
      | default.name | YES        |
  And the picklist result contains
      | field        | value       |
      | categoryName | Last 7 Days |

@F639_4_Lab_Orders_all_collection_samples
Scenario: Returns all collection samples (ORWDLR32 ALLSAMP)
When the client requests picklist with the parameters for "lab-all-samples" with the user "REDACTED"
      | paramter name | value                                 |
Then a successful response is returned
And the picklist result contains
      | field             | value       |
      | categoryName      | CollSamp    |
      | values.ien        | 68          |
      | values.name       | 24 HR URINE |
      | values.specPtr    | 8755        |
      | values.tubeTop    | NONE        |
      | values.labCollect | EMPTY       |
      | values.specName   | 24 HR URINE |

@F639_5_Lab_Orders_list_of_specimens
Scenario: Returns a list of specimens from the TOPOGRAPHY FIELD file (#61) (ORWDLR32 ALLSPEC)
When the client requests picklist with the parameters for "lab-order-specimens" with the user "REDACTED"
      | paramter name | value               |
  Then a successful response is returned
  And the picklist result contains
      | field | value                |
      | ien   | 8755                 |
      | name  | 24 HR URINE  (URINE) |
        And the picklist result contains
      | field | value                |
      | ien   | 6072                 |
      | name  | ZYGOTE  (88150) |
        And the picklist result contains
      | field | value                |
      | ien   | 4028                 |
      | name  | MEDIAL STRIATE ARTERIES  (45642) |
        And the picklist result contains
      | field | value                |
      | ien   | 448                 |
      | name  | SUBCUTANEOUS TISSUE OF TAIL OF HELIX  (03204) |

@F639_6_Lab_Orders_dialog_definition
Scenario: Returns a list of specimens from the TOPOGRAPHY FIELD file (#61) (ORWDLR32 DEF)
When the client requests picklist with the parameters for "lab-order-dialog-def" with the user "REDACTED"
      | paramter name | value                |
      | location  | 240           |
  Then a successful response is returned
  And the picklist result contains
      | field             | value        |
      | categoryName      | ShortList    |
  And the picklist result contains
      | field             | value                   |
      | categoryName      | Lab Collection Times    |
  And the picklist result contains
      | field             | value                 |
      | categoryName      | Send Patient Times    |
  And the picklist result contains
      | field             | value                |
      | categoryName      | Collection Types     |
  And the picklist result contains
      | field             | value                |
      | categoryName      | Default Urgency      |
  And the picklist result contains
      | field             | value        |
      | categoryName      | Schedules    |


@F639_7_Lab_Orders_For_LAB_Times @US9956
Scenario: Create Endpoint for ORWDLR32 GET LAB TIMES (a list of date/time available from the lab schedule)
When the client requests picklist with the parameters for "lab-times-available" with the user "REDACTED"
      | paramter name | value               |
      | date          | 20312015            |
      | locationUid      | urn:va:location:9E7A:1 |
  Then a successful response is returned
  And the picklist result contains
      | field   | value         |
      | time    |  0930         |
  And the picklist result contains
      | field   | value         |
  And the picklist result contains
      | field   | value         |
      | time    |  1100         |
  And the picklist result contains
      | field   | value         |
      | time    |  1230         |
  And the picklist result contains
      | field   | value         |
      | time    |  1300         |
  And the picklist result contains
      | field   | value         |
      | time    |  1530         |
  And the picklist result contains
      | field   | value         |
      | time    |  1545         |
  And the picklist result contains
      | field   | value         |
      | time    |  1600         |
  And the picklist result contains
      | field   | value         |
      | time    |  1730         |

@F639_8_Lab_Orders_valid_lab_immediate_collect_time @US9957
Scenario: Create Endpoint for ORWDLR32 IC VALID (Determines whether the supplied time is a valid lab immediate collect time.)
When the client requests picklist with the parameters for "lab-time-valid-immediate-collect-time" with the user "REDACTED"
      | paramter name | value                                 |
      | time          | 3151127.151                           |
Then a successful response is returned

@F639_9_Lab_Orders_valid_lab_collect_time @US9025
Scenario: Returns help text showing lab immediate collect times for the user's division. (ORWDLR32 IMMED COLLECT)
When the client requests picklist with the parameters for "lab-collect-times" with the user "REDACTED"
      | paramter name | value             |
  Then a successful response is returned
  And the picklist result contains
      | field      | value                               |
      | text0      |  CONTAINS NO COLLECTION ON HOLIDAYS |
  And the picklist result contains
      | field      | value                                              |
      | text1      | CONTAINS MON Collection |
  And the picklist result contains
      | field      | value                                              |
      | text2      | CONTAINS TUE Collection |
  And the picklist result contains
      | field      | value                                              |
      | text3      | CONTAINS WED Collection |
  And the picklist result contains
      | field      | value                                               |
      | text4      |  CONTAINS THU Collection |
  And the picklist result contains
      | field      | value                                              |
      | text5      | CONTAINS FRI Collection |
  And the picklist result contains
      | field      | value                                                                 |
      | text6      | Laboratory Service requires at least 5 minutes to collect this order. |

@F639_10_Lab_Orders_valid_lab_collect_time @US9025
Scenario: Returns help text showing lab immediate collect times for the user's division. (ORWDLR32 IMMED COLLECT)
When the client requests picklist with the parameters for "lab-collect-times" with the user "C877;DNS   "
      | paramter name | value             |
  Then a successful response is returned
      And the picklist result contains
      | field         | value             |


@F639_11_Endpoint_for_New_Persons @US9972
Scenario: Update the new-persons endpoint to retrieve the entire list of persons.
When the client requests a picklist with the parameters for "new-persons" with the user "REDACTED"
      | paramter name | value       |
      | site          | 9E7A        |
  Then a successful response is returned


@F639_12_Allergies_match
Scenario: Create Endpoint for allergies match (ORWDAL32 ALLERGY MATCH)
  When the client requests picklist with the parameters for "allergies-match" with the user "REDACTED"
      | paramter name | value                          |
      | searchString  | DIALYSIS MEMBRANE              |
  Then a successful response is returned
  And the picklist result contains
      | field                   | value             |
      | categoryName            | VA Allergies File |
      | top                     | TOP               |
      | plus                    | +                 |
      | allergens.name          | DIALYSIS MEMBRANE |
      | allergens.ien           | 762               |
      | allergens.file          | CONTAINS GMRD     |
      | allergens.foodDrugOther | O                 |
      | allergens.source        | 1                 |

@F639_13_Allergies_symptioms_top_ten
Scenario: Create Endpoint for allergies-symptoms-top-ten (ORWDAL32 DEF)
  When the client requests picklist with the parameters for "allergies-symptoms-top-ten" with the user "REDACTED"
      | paramter name | value                          |
  Then a successful response is returned
  And the picklist result contains
      | field        | value           |
      | categoryName | Allergy Types   |
      | values.name  | Drug            |
      | values.ien   | D               |
      | values.name  | Food            |
      | values.ien   | F               |
      | values.name  | Other           |
      | values.ien   | O               |
      | values.name  | Drug,Food       |
      | values.ien   | DF              |
      | values.name  | Drug,Other      |
      | values.ien   | DO              |
      | values.name  | Food,Other      |
      | values.ien   | FO              |
      | values.name  | Drug,Food,Other |
      | values.ien   | DFO             |
  And the picklist result contains
      | field        | value                 |
      | categoryName | Top Ten               |
      | values.ien   | 39                    |
      | values.name  | ANXIETY               |
      | values.ien   | 2                     |
      | values.name  | ITCHING,WATERING EYES |
      | values.ien   | 6                     |
      | values.name  | ANOREXIA              |
      | values.ien   | 66                    |
      | values.name  | DROWSINESS            |
      | values.ien   | 8                     |
      | values.name  | NAUSEA,VOMITING       |
      | values.ien   | 9                     |
      | values.name  | DIARRHEA              |
      | values.ien   | 1                     |
      | values.name  | HIVES                 |
      | values.ien   | 67                    |
      | values.name  | DRY MOUTH             |
      | values.ien   | 69                    |
      | values.name  | DRY NOSE              |
      | values.ien   | 133                   |
      | values.name  | RASH                  |


@F639_14_Allergies_symptoms
Scenario: Create Endpoint for allergies symptoms (ORWDAL32 SYMPTOMS)
  When the client requests picklist with the parameters for "allergies-symptoms" with the user "REDACTED"
      | paramter name | value              |
      | searchString  | hives              |
  Then a successful response is returned
  And the picklist result contains
      | field   | value |
      | ien     | 1     |
      | synonym | HIVES |
      | name    | HIVES |
  And the picklist result contains
      | field   | value          |
      | ien     | 158            |
      | synonym | CONTAINS HIVES |
      | name    | URTICARIA      |


@F639_15_Allergies_symptoms_all_with_top_ten
Scenario: Create Endpoint for allergies symptoms all with top ten (ORWDAL32 DEF and ORWDAL32 SYMPTOMS )
  When the client requests picklist with the parameters for "allergies-symptoms-all-with-top-ten" with the user "REDACTED"
      | paramter name | value                               |
  Then a successful response is returned
  And the picklist result contains
      | field        | value           |
      | categoryName | Allergy Types   |
      | values.ien   | D               |
      | values.name  | Drug            |
      | values.name  | Food            |
      | values.ien   | F               |
      | values.name  | Other           |
      | values.ien   | O               |
      | values.name  | Drug,Food       |
      | values.ien   | DF              |
      | values.name  | Drug,Other      |
      | values.ien   | DO              |
      | values.name  | Food,Other      |
      | values.ien   | FO              |
      | values.name  | Drug,Food,Other |
      | values.ien   | DFO             |
  And the picklist result contains
      | field   | value              |
      | ien     | 237                |
      | synonym | ABDOMINAL BLOATING |
      | name    | ABDOMINAL BLOATING |


@F639_17_Problems-lexicon-lookup
Scenario: Create Endpoint for problems-lexicon-lookup (ORQQPL4 LEX)
  When the client requests picklist with the parameters for "problems-lexicon-lookup" with the user "REDACTED"
      | paramter name | value                   |
      | searchString  | ABC                     |
  Then a successful response is returned
  And the picklist result contains
      | field     | value                |
      | lexIen    | 7299081              |
      | prefText  | Aneurysmal bone cyst |
      | code      | R69.                 |
      | codeIen   | 521774               |
      | codeSys   | SNOMED CT            |
      | conceptId | 203468000            |
      | desigId   | 312186013            |
      | version   | ICD-10-CM            |

@F639_20_Vitals_List
Scenario: Get list of vitals qualifiers/categories
  When the client requests picklist with the parameters for "vitals" with the user "REDACTED"
      | paramter name | value |

  Then a successful response is returned
  And the picklist result contains
      | field                 | value          |
      | ien                   | 1              |
      | name                  | BLOOD PRESSURE |
      | abbreviation          | BP             |
      | pceAbbreviation       | BP             |
      | abnormalSystolicHigh  | 210            |
      | abnormalDiastolicHigh | 110            |
      | abnormalSystolicLow   | 100            |
      | abnormalDiastolicLow  | 60             |


@F639_21_Printer_Devices_List
Scenario: Get List of printer devices
  When the client requests picklist with the parameters for "printer-devices" with the user "REDACTED"
      | paramter name | value |

  Then a successful response is returned
  And the picklist result contains
      | field       | value             |
      | ienName     | 524;HFS           |
      | displayName | HFS               |
      | location    | Local file system |
      | ien         | 524               |
      | name        | HFS               |
      | rMar        | EMPTY             |
      | pLen        | EMPTY             |


@F639_22_List_Of_Notes_Titles
Scenario: Returns a list of Note Titles
  When the client requests picklist with the parameters for "progress-notes-titles" with the user "REDACTED"
      | paramter name | value |
      | class         | 3 |
      | searchString | ACROMEGALY |

  Then a successful response is returned
  And the picklist result contains
      | field | value                        |
      | ien   | 1295                         |
      | name  | ACROMEGALY  <C&P ACROMEGALY> |
      And the picklist result contains
      | field | value          |
      | ien   | 1295           |
      | name  | C&P ACROMEGALY |
      And the picklist result contains
      | field | value                            |
      | ien   | 1295                             |
      | name  | C&P ACROMEGALY  <C&P ACROMEGALY> |


@F639_23_Flag_For_Notes_Title
Scenario: Returns the flags for a Progress Note Title
  When the client requests picklist with the parameters for "progress-notes-titles-flags" with the user "REDACTED"
      | paramter name | value                       |
      | ien           | 1354                       |
      | searchString  | ACROMEGALY                  |

  Then a successful response is returned
  And the result contains
      | field          | value |
      | isSurgeryNote  | false |
      | isOneVisitNote | false |
      | isPrfNote      | true  |
      | isConsultNote  | false |


@F639_24_Lab_Order_Types @DE5107 @DE5196
Scenario: Create endpoint for ORWDX ORDITM (lab order types)
  When the client requests picklist with the parameters for "lab-order-orderable-items" with the user "REDACTED"
      | parameter name | value                     |
      | labType        | S.LAB                     |

  Then a successful response is returned
  And the picklist result contains
      | field   | value          |
      | ien     | 430            |
      | synonym | CLONAZEPAM     |
      | name    | CLONAZEPAM     |
  And the picklist result contains
      | ien     | 1199           |
      | synonym | GENTAMICIN     |
      | name    | GENTAMICIN     |
  And the picklist result contains
      | ien     | 162            |
      | synonym | PLATELET COUNT |
      | name    | PLATELET COUNT |
  And the picklist result contains
      | ien     | 362            |
      | synonym | TESTOSTERONE   |
      | name    | TESTOSTERONE   |
