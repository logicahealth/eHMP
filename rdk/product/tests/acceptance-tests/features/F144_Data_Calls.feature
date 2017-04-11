@data_verification @F144
Feature: F144 - eHMP viewer GUI - Allergies

@F144_ClinicalReminders
Scenario: eHMP viewer GUI - F144_ClinicalReminders
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  When the client requests clinical reminders for the patient "9E7A;100022"
  Then a successful response is returned

@F295_Encounters @US3706
Scenario: F295 - Encounters Applet
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  When the client requests encounters for the patient "9E7A;100022"
  Then a successful response is returned
  Then the VPR results contain
    | field 	| value 		|
    | kind 		| Procedure 	|
    | name 		| LAPARASCOPY	|
  Then the VPR results contain
    | field 	| value 		|
    | kind 		| Visit 		|
    | summary 	| AUDIOLOGY 	|
  
#@F295_Encounters @US3706
#Scenario: F295 - Encounters Applet
#  Given a patient with pid "9E7A;164" has been synced through the RDK API
#  When the client requests encounters for the patient "9E7A;164"
#  Then a successful response is returned
#  Then the VPR results contain
#    | field | value |
#    | kind | Admission |
#    | reasonName | SLKJFLKSDJF |

@F295_Encounters @US3706
Scenario: F295 - Encounters Applet
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  When the client requests encounters for the patient "9E7A;100022"
  Then a successful response is returned
  Then the VPR results contain
    | field 	| value |
    | kind 		| Admission |
    | reasonName| Heart issues |

@F144_Immunizations @F281 @US2171
Scenario:  F144 - eHMP viewer GUI - Immunizations
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client requests immunizations for the patient "9E7A;3"
  Then a successful response is returned
    And the Immunization result contain                                         
      | name             | Tdap     |
      | facilityCode     | DOD      |
    And the Immunization result contain
      | field            | value        |
      | name             | PNEUMOCOCCAL |
      | facilityCode     | 561          |


@F144_allergy_applet @US2801
Scenario: Verify Allergy Applet data call
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  #When the client requests allergies for the patient "5000000341V359724" in VPR format
  When the client requests allergies for the patient "9E7A;100022" with parameters
   | label  | value |
   | filter | ne(removed, true) |
 Then a successful response is returned
 Then the VPR results contain
      | field        | value                    |
      | summary      | STRAWBERRIES             |
      | facilityCode | 500                      |
      | kind         | Allergy/Adverse Reaction |
 Then the VPR results contain
      | field        | value                    |
      | summary      | STRAWBERRIES             |
      | facilityCode | 507                      |
      | kind         | Allergy/Adverse Reaction |
  Then the VPR results contain
      | field        | value                    |
      | summary      | ENOXACIN (ENOXACIN)      |
      | facilityCode | DOD                      |
      | kind         | Allergy/Adverse Reaction |
  Then the VPR results contain
      | field        | value                    |
      | summary      | MILK                     |
      | facilityCode | 561                      |
      | kind         | Allergy/Adverse Reaction |

@F144_problems_applet @US2411
Scenario: Verify Problem Applet data call
 Given a patient with pid "9E7A;3" has been synced through the RDK API
 When the client requests problems/conditions for the patient "9E7A;3" with parameters
   | label  | value |
   | filter | ne(removed, true) |
    Then a successful response is returned
    Then the VPR results contain                                                                
      | field        | value                                                      |
      | summary      | Diabetes Mellitus Type II or unspecified (ICD-9-CM 250.00) |
      | facilityCode | 500                                                        |
      | kind         | Problem                                                    |
    Then the VPR results contain                                                               
      | field        | value                                                      |
      | summary      | Diabetes Mellitus Type II or unspecified (ICD-9-CM 250.00) |
      | facilityCode | 507                                                        |
      | kind         | Problem                                                    |
    Then the VPR results contain                                                                
      | field        | value                                       |
      | summary      | shocklike sensation from left elbow to hand |
      | facilityCode | DOD                                         |
      | kind         | Problem                                     |
    Then the VPR results contain                                                                
      | field        | value                                                |
      | summary      | Occasional, uncontrolled chest pain (ICD-9-CM 411.1) |
      | facilityCode | 561                                                  |
      | kind         | Problem                                              |

@F294_report_applet @F294_report_applet_procedure @US4157
Scenario: View procedure in reports gist
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  When the client requests the REPORTS for the patient "9E7A;100022" with parameters
  | label         |  value           |
  | FILTER_DATE   | 19350407-TODAY |
  | FILTER        | not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))) |
  | FILTER        | in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result"]) |
  Then a successful response is returned
  #And the REPORT results contain
  Then the VPR results contain
   | field | value |
   | kind  | Procedure |
  

@F294_report_applet @F294_report_applet_consult @US4157
Scenario: View Consult in reports gist
  Given a patient with pid "9E7A;229" has been synced through the RDK API
  When the client requests the REPORTS for the patient "9E7A;229" with parameters
  | label         |  value           |
  | FILTER_DATE   | 19350407-TODAY |
  | FILTER        | not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))) |
  | FILTER        | in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result"]) |
  Then a successful response is returned
  #And the REPORT results contain
  Then the VPR results contain
   | field | value |
   | kind  | Consult |

#9E7A;100022
@F294_report_applet @F294_report_applet_Imaging @US4157
Scenario: View Imaging in reports gist
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  When the client requests the REPORTS for the patient "9E7A;100022" with parameters
  | label         |  value           |
  | FILTER_DATE   | 19350407-TODAY |
  | FILTER        | not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))) |
  | FILTER        | in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result"]) |
  Then a successful response is returned
  #And the REPORT results contain
  Then the VPR results contain
   | field | value |
   | kind  | Imaging |

@F294_report_applet @F294_report_applet_Laboratory @US4157
Scenario: View Laboratory Report in reports gist
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  When the client requests the REPORTS for the patient "9E7A;100022" with parameters
  | label         |  value           |
  | FILTER_DATE   | 19350407-TODAY |
  | FILTER        | not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE"))) |
  | FILTER        | in(kind,["Consult","Imaging","Procedure","Radiology","Laboratory Report","Laboratory Result"]) |
  Then a successful response is returned
  #And the REPORT results contain
  Then the VPR results contain
   | field | value |
   | kind  | Laboratory Report |

@F280_Vitals_Gist @US4259
Scenario: View Vitals in gist view
  Given a patient with pid "9E7A;8" has been synced through the RDK API
  When the client requests the VITALS for the patient "9E7A;8" with parameters
  | label         |  value           |
  | FILTER        | and(ne(removed, true) |
  | FILTER_DATE   | 19350407-TODAY |
  | FILTER        | ne(result,Pass) |
  Then a successful response is returned
  And the VPR results contain
  | field       | value  |
  | displayName | BP     |
  | result      | 151/74 |
  | units       | mm[Hg] |
  And the VPR results contain
  | field       | value  |
  | displayName | P      |
  | result      | 94     |
  | units       | /min   |
  And the VPR results contain
  | field       | value  |
  | displayName | R      |
  | result      | 14     |
  | units       | /min   |
  And the VPR results contain
  | field       | value  |
  | displayName | T      |
  | result      | 98.7   |
  | units       | F      |
  | metricResult| 37.1   |
  | metricUnits | C      |
  And the VPR results contain
  | field       | value  |
  | result      | 99     |
  | units       | %      |
  | displayName | PO2    |
  And the VPR results contain
  | field       | value  |
  | displayName | PN     |
  | result      | 2      |
  | units       |        |
 And the VPR results contain
  | field       | value  |
  | displayName | WT     |
  | result      | 157    |
  | units       | lb     |
  | metricResult| 71.36  |
  | metricUnits | kg     |
 And the VPR results contain
  | field       | value  |
  | displayName | HT     |
  | result      | 71     |
  | units       | in     |
  | metricResult| 180.34 |
  | metricUnits | cm     |
  And the VPR results contain
  | field       | value  |
  | typeName    | BMI    |
  | result      | 21.9   |



@F280_Vitals_Gist @US4259
Scenario: View Vitals in gist view
  Given a patient with pid "9E7A;231" has been synced through the RDK API
  When the client requests the VITALS for the patient "9E7A;231" with parameters
  | label         |  value           |
  | FILTER        | and(ne(removed, true) |
  | FILTER_DATE   | 19350407-TODAY |
  | FILTER        | ne(result,Pass) |
  Then a successful response is returned
  And the VPR results contain
  | field       | value  |
  | displayName | BP     |
  | result      | 112/81 |
  | units       | mm[Hg] |
  And the VPR results contain
  | field       | value  |
  | displayName | P      |
  | result      | 94     |
  | units       | /min   |
  And the VPR results contain
  | field       | value  |
  | displayName | R      |
  | result      | 15     |
  | units       | /min   |
  And the VPR results contain
  | field       | value  |
  | displayName | T      |
  | result      | 98.7   |
  | units       | F      |
  | metricResult| 37.1   |
  | metricUnits | C      |
  And the VPR results contain
  | field       | value  |
  | result      | 98     |
  | units       | %      |
  | displayName | PO2    |
  And the VPR results contain
  | field       | value  |
  | displayName | PN     |
  | result      | 1      |
  | units       |        |
  And the VPR results contain
  | field       | value  |
  | displayName | PN     |
  | result      | 1      |
  | units       |        |
 And the VPR results contain
  | field       | value  |
  | displayName | WT     |
  | result      | 174    |
  | units       | lb     |
  | metricResult| 79.09  |
  | metricUnits | kg     |
 And the VPR results contain
  | field       | value  |
  | displayName | HT     |
  | result      | 71    |
  | units       | in     |
  | metricResult| 180.34  |
  | metricUnits | cm     |
  And the VPR results contain
  | field       | value  |
  | typeName    | BMI    |
  | result      | 24.3   |

@F281_ActiveMeds
Scenario: Active Meds on overview
  # 10188V866369 = Eightyeight,Patient
  Given a patient with pid "9E7A;100608" has been synced through the RDK API
  When the client requests medications for Active Medications applet for the patient "9E7A;100608"
  Then a successful response is returned
  Then the VPR results contain
    | field | value |
    | vaType | O |
    | codes.display | Amoxapine 150 MG Oral Tablet |

@F280 @US4258
Scenario: Lab Results Gist on overview
  Given a patient with pid "9E7A;231" has been synced through the RDK API
  When the client requests lab results for Lab Results Gist applet for the patient "9E7A;231"
  Then a successful response is returned
  Then the VPR results contain
    | field | value |
    | typeName | TRIGLYCERIDE|

@DE1757
Scenario: Narrative Lab Results 
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client requests narrative lab results for the patient "9E7A;3"
  Then a successful response is returned
  Then the VPR results contain
      | field    | value                    |
      | observed | 20150203122400           |
      | typeName | CULTURE & SUSCEPTIBILITY |
      | specimen | UNKNOWN                  |
