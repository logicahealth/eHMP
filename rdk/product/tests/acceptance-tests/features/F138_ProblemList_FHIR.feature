 @F138_ProblemList_FHIR @vxsync @patient
 Feature: F138 - Return of Problem List in FHIR format

 #This feature item returns a problem list in FHIR format from all VistA instances in which a patient record exists. It includes breaking the glass for a sensitive patient.
 #Patients used: 10107V395912, 5000000116V912836, 10104V248233, 5000000009V082878

 @F138_1_fhir_problemlist @fhir @10107V395912
 Scenario: Client can request problem list results in FHIR format
  Given a patient with "problem list" in multiple VistAs
   When the client requests problem list for the patient "9E7A;253" in FHIR format
   Then a successful response is returned
   And the FHIR results contain "problems"
       | name                                      | value                                |
       | resource.clinicalStatus					         | confirmed                            |
       | resource.category.coding.code             | diagnosis                            |
       | resource.category.coding.system           | 2.16.840.1.113883.4.642.2.224        |
       | resource.patient.reference                | 9E7A;253                             |
       | resource.code.coding.display              | DIABETES MELLI W/O COMP TYP II       |
       | resource.asserter.display                 | VEHU,SEVEN                           |
       | resource.dateAsserted                     | IS_FHIR_FORMATTED_DATE               |
       | resource.onsetDateTime                    | IS_FHIR_FORMATTED_DATE               |
       | resource.contained.resourceType           | Encounter                            |
       | resource.contained.text.status                | generated                        |
       | resource.contained.text.div                   | <div>Encounter with patient 9E7A;253</div> |
       | resource.contained.location.resourceType      | Location                                   |
       | resource.contained.location._id               | urn:va:location:9E7A:32                    |
       | resource.contained.resourceType          | Practitioner                                    |
       | resource.contained.identifier.value      | urn:va:user:9E7A:20008                          |
       | resource.contained.identifier.system     | urn:oid:2.16.840.1.113883.6.233                 |
       | resource.contained.name                  | VEHU,SEVEN                                      |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#updated            |
       | resource.extension.valueDateTime         | IS_FHIR_FORMATTED_DATE                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusCode         |
       | resource.extension.valueString           | urn:sct:55561003                                                 |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusName         |
       | resource.extension.valueString           | ACTIVE                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusDisplayName  |
       | resource.extension.valueString           | Active                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#serviceConnected   |
       | resource.extension.valueBoolean          | false                                                            |
       | resource.clinicalStatus                  | confirmed                            |
       | resource.category.coding.code             | diagnosis                            |
       | resource.category.coding.system           | 2.16.840.1.113883.4.642.2.224        |
       | resource.patient.reference                | 9E7A;253                             |
       | resource.code.coding.display              | DIABETES MELLI W/O COMP TYP II      |
       | resource.asserter.display                 | VEHU,SEVEN                      |
       | resource.dateAsserted                     | IS_FHIR_FORMATTED_DATE               |
       | resource.onsetDateTime                    | IS_FHIR_FORMATTED_DATE               |
       | resource.contained.resourceType               | Encounter                        |
       | resource.contained.text.status                | generated                        |
       | resource.contained.text.div                   | <div>Encounter with patient 9E7A;253</div> |
       | resource.contained.location.resourceType      | Location                                   |
       | resource.contained.location._id               | urn:va:location:9E7A:32                   |
       | resource.contained.resourceType          | Practitioner                                    |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#updated            |
       | resource.extension.valueDateTime         | IS_FHIR_FORMATTED_DATE                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusCode         |
       | resource.extension.valueString           | urn:sct:55561003                                                 |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusName         |
       | resource.extension.valueString           | ACTIVE                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusDisplayName  |
       | resource.extension.valueString           | Active                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#serviceConnected   |
       | resource.extension.valueBoolean          | false                                                            |

 @F138_2_fhir_problemlist @fhir @5000000116V912836
 Scenario: Client can request problem list results in FHIR format
   Given a patient with "problem list" in multiple VistAs
    #   And a patient with pid "5000000116V912836" has been synced through the RDK API
   When the client requests problem list for the patient "9E7A;100615" in FHIR format
   Then a successful response is returned
   And the FHIR results contain "problems"
       | name                                     | value                                |
       | resource.clinicalStatus                           | confirmed                            |
       | resource.category.coding.code             | diagnosis                            |
       | resource.category.coding.system           | 2.16.840.1.113883.4.642.2.224        |
       | resource.stage.summary                    | Occasional, uncontrolled chest pain (ICD-9-CM 411.1) |
       | resource.patient.reference                | HDR;5000000116V912836                       |
       | resource.code.coding.code                 | urn:icd:411.1                        |
       | resource.code.coding.display              | INTERMED CORONARY SYND               |
       | resource.asserter.display                 | PROGRAMMER,TWENTY                    |
       | resource.dateAsserted                     | IS_FHIR_FORMATTED_DATE               |
       | resource.onsetDateTime                    | IS_FHIR_FORMATTED_DATE               |
       | resource.contained.resourceType               | Encounter                        |
       | resource.contained.text.status                | generated                        |
       | resource.contained.text.div                   | <div>Encounter with patient HDR;5000000116V912836</div> |
       | resource.contained.location.resourceType      | Location                                      |
       | resource.contained.resourceType          | Practitioner                                    |
       | resource.contained.identifier.value      | urn:va:user:ABCD:755                         |
       | resource.contained.identifier.system     | urn:oid:2.16.840.1.113883.6.233                 |
       | resource.contained.name                  | PROGRAMMER,TWENTY                               |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#service            |
       | resource.extension.valueString           | MEDICINE                                                         |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#updated            |
       | resource.extension.valueDateTime         | IS_FHIR_FORMATTED_DATE                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusCode         |
       | resource.extension.valueString           | urn:sct:55561003                                                 |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusName         |
       | resource.extension.valueString           | ACTIVE                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusDisplayName  |
       | resource.extension.valueString           | Active                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#serviceConnected   |
       | resource.resourceType                     | Condition                            |
       | resource.clinicalStatus                   | confirmed                            |
       | resource.category.coding.code             | diagnosis                            |
       | resource.category.coding.system           | 2.16.840.1.113883.4.642.2.224        |
       | resource.patient.reference                | HDR;5000000116V912836                         |
       | resource.asserter.display                 | PROGRAMMER,TWENTY                      |
       | resource.dateAsserted                     | IS_FHIR_FORMATTED_DATE                  |
       | resource.contained.resourceType               | Encounter                        |
       | resource.contained.text.status                | generated                        |
       | resource.contained.text.div                   | <div>Encounter with patient HDR;5000000116V912836</div> |
       | resource.contained.location.resourceType      | Location                                      |
       | resource.contained.resourceType          | Practitioner                                    |
       | resource.contained.identifier.system     | urn:oid:2.16.840.1.113883.6.233                 |
       | resource.contained.name                  | PROGRAMMER,TWENTY                                 |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#updated            |
       | resource.extension.valueDateTime         | IS_FHIR_FORMATTED_DATE                                             |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusName         |
       | resource.extension.valueString           | Active                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusDisplayName  |
       | resource.extension.valueString           | Active                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#serviceConnected   |
       | resource.extension.valueBoolean          | false                                                            |

 @F138_3_fhir_problemlist @fhir @10104V248233
 Scenario: Client can request problem list results in FHIR format
 	Given a patient with "problem list" in multiple VistAs
     #  And a patient with pid "10104V248233" has been synced through the RDK API
       When the client requests problem list for the patient "9E7A;229" in FHIR format
       Then a successful response is returned
       And the FHIR results contain "problems"
       | name                                     | value                                |
       | resource.resourceType                     | Condition                            |
       | resource.clinicalStatus                           | confirmed                            |
       | resource.category.coding.code             | diagnosis                            |
       | resource.category.coding.system           | 2.16.840.1.113883.4.642.2.224        |
       | resource.stage.summary                    | Occasional, uncontrolled chest pain (ICD-9-CM 411.1) |
       | resource.patient.reference                | HDR;10104V248233                   |
       | resource.code.coding.code                 | urn:icd:411.1                        |
       | resource.code.coding.display              | INTERMED CORONARY SYND               |
       | resource.asserter.display                 | PROGRAMMER,TWENTY                    |
       | resource.dateAsserted                     | IS_FHIR_FORMATTED_DATE                          |
       | resource.onsetDateTime                        | IS_FHIR_FORMATTED_DATE                           |
       | resource.contained.resourceType               | Encounter                        |
       | resource.contained.text.status                | generated                        |
       | resource.contained.text.div                   | <div>Encounter with patient HDR;10104V248233</div> |
       | resource.contained.location.resourceType      | Location                                   |
       | resource.contained.resourceType          | Practitioner                                    |
       | resource.contained.identifier.value      | urn:va:user:ABCD:755                            |
       | resource.contained.identifier.system     | urn:oid:2.16.840.1.113883.6.233                 |
       | resource.contained.name                  | PROGRAMMER,TWENTY                               |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#updated            |
       | resource.extension.valueDateTime         | IS_FHIR_FORMATTED_DATE           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusCode         |
       | resource.extension.valueString          | urn:sct:55561003                                              |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusName         |
       | resource.extension.valueString           | ACTIVE                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusDisplayName  |
       | resource.extension.valueString           | Active                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#serviceConnected   |
       | resource.extension.valueBoolean          | false                                                            |

 @F138_4_fhir_problemlist @fhir @5000000009V082878
 Scenario: Client can request problem list results in FHIR format
   Given a patient with "problem list" in multiple VistAs
   When the client requests problem list for the patient "9E7A;100125" in FHIR format
   Then a successful response is returned
   And the FHIR results contain "problems"
       | name                                      | value                                |
       | resource.resourceType                     | Condition                            |
       | resource.clinicalStatus                   | confirmed                            |
       | resource.category.coding.code             | diagnosis                            |
       | resource.category.coding.system           | 2.16.840.1.113883.4.642.2.224        |
       | resource.stage.summary                    | Occasional, uncontrolled chest pain (ICD-9-CM 411.1) |
       | resource.patient.reference                | HDR;5000000009V082878                          |
       | resource.code.coding.code                 | urn:icd:411.1                        |
       | resource.code.coding.display              | INTERMED CORONARY SYND               |
       | resource.code.coding.code                 | 25106000                             |
       | resource.code.coding.system               | http://snomed.info/sct               |
       | resource.code.coding.display              | Impending infarction (disorder)      |
       | resource.asserter.display                 | PROGRAMMER,TWENTY                    |
       | resource.dateAsserted                     | IS_FHIR_FORMATTED_DATE               |
       | resource.onsetDateTime                        | IS_FHIR_FORMATTED_DATE           |
       | resource.contained.resourceType               | Encounter                        |
       | resource.contained.text.status                | generated                        |
       | resource.contained.text.div                   | <div>Encounter with patient HDR;5000000009V082878</div> |
       | resource.contained.location.resourceType      | Location                                   |
       | resource.contained.resourceType          | Practitioner                                    |
       | resource.contained.identifier.value      | urn:va:user:ABCD:755                            |
       | resource.contained.identifier.system     | urn:oid:2.16.840.1.113883.6.233                 |
       | resource.contained.name                  | PROGRAMMER,TWENTY                               |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#service            |
       | resource.extension.valueString           | MEDICINE                                                         |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#updated            |
       | resource.extension.valueDateTime         | IS_FHIR_FORMATTED_DATE                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusCode         |
       | resource.extension.valueString           | urn:sct:55561003                                                 |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusName         |
       | resource.extension.valueString           | ACTIVE                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#statusDisplayName  |
       | resource.extension.valueString           | Active                                                           |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#serviceConnected   |
       | resource.extension.valueBoolean          | false                                                            |
       | resource.extension.url                   | http://vistacore.us/fhir/extensions/condition#comments           |
       | resource.extension.valueString           | <div><ul><li>comment:SHERIDAN PROBLEM</li><li>entered:19960514</li><li>enteredByCode:urn:va:user:ABCD:755</li><li>enteredByName:PROGRAMMER,TWENTY</li><li>summary:ProblemComment{uid=&#39;&#39;}</li></ul></div> |
       