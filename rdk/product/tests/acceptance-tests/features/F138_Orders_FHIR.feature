 @F138_Orders_FHIR @vxsync @patient
 Feature: F138 - Return of Orders in FHIR format

 #This feature item returns an order in FHIR format from all VistA instances in which a patient record exists. It includes breaking the glass for a sensitive patient.
 #Patients used: 5000000341V359724, 10104V248233, 9E7A;230, 9E7A;167, 10105V001065, 10110V004877

 @F138_1_fhir_orders @fhir @5000000341V359724 
 Scenario: Client can request orders results in FHIR format
       Given a patient with "orders" in multiple VistAs
      # And a patient with pid "5000000341V359724" has been synced through the RDK API
       When the client requests orders for the patient "9E7A;100022" in FHIR format
       Then a successful response is returned
       And the FHIR results contain "orders"
       | name                              | value                                                  |
       | resource.text.status               | generated                                              |
       | resource.text.div                  | CONTAINS <div>Request for Laboratory                   |
       | resource.subject.reference         | Patient/9E7A;100022                                    |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#kind         |
       | resource.extension.valueString     | Laboratory                                             |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#service      |
       | resource.extension.valueString     | LR                                                     |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#localId      |
       | resource.extension.valueString     | 21142                                                  |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#displayGroup |
       | resource.extension.valueString     | CH                                                     |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#result       |
       | resource.extension.valueString     | urn:va:lab:9E7A:100022:CH;6929469.848386;500009        |
       #Practitioner
       | resource.contained.resourceType     | Practitioner              |
       | resource.contained.text.status      | generated                 |
       | resource.contained.text.div         | <div>Provider,Eight</div> |
       #Location
       | resource.contained.resourceType     | Location                |
       | resource.contained.text.status      | generated               |
       | resource.contained.text.div         | <div>CAMP MASTER</div>  |
       | resource.contained.name             | CAMP MASTER             |
       #Organization
       | resource.contained.resourceType     | Organization    |
       | resource.contained.text.status      | generated       |
       | resource.contained.text.div         | <div>BCMA</div> |
       | resource.contained.name             | BCMA            |
       #DiagnosticOrder
       | resource.contained.resourceType                           | DiagnosticOrder                                        |
       | resource.contained.subject.reference                      | Patient/9E7A;100022                                    |
       | resource.contained.status                                 | completed                                              |
       | resource.contained.item.code.text                         | HEPATITIS C ANTIBODY                                   |
       | resource.contained.item.code.coding.system                | oi-code                                                |
       | resource.contained.item.code.coding.code                  | urn:va:oi:1335                                         |
       | resource.contained.item.code.coding.display               | HEPATITIS C ANTIBODY                                   |
       | resource.contained.item.code.coding.extension.url         | http://vistacore.us/fhir/extensions/order#oiPackageRef |
       | resource.contained.item.code.coding.extension.valueString | 5079;99LRT                                             |
       | resource.contained.text.status                            | generated                                              |
       | resource.contained.text.div                               | <div>HEPATITIS C ANTIBODY</div>                        |
       | resource.contained.identifier.value                       | urn:va:order:9E7A:100022:21142                         |
       | resource.detail.display                                   | HEPATITIS C ANTIBODY                                   |

 @F138_2_fhir_orders @fhir @10104V248233
 Scenario: Client can request orders results in FHIR format
       Given a patient with "orders" in multiple VistAs
       When the client requests orders for the patient "9E7A;229" in FHIR format
       Then a successful response is returned
       And the FHIR results contain "orders"
       | name                              | value                                                  |
       | resource.text.status               | generated                                              |
       | resource.text.div                  | CONTAINS CAPTOPRIL 25MG TABS                           |
       | resource.subject.reference         | Patient/9E7A;229                                       |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#kind         |
       | resource.extension.valueString     | Medication, Outpatient                                 |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#service      |
       | resource.extension.valueString     | PSO                                                    |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#localId      |
       | resource.extension.valueString     | 10552                                                  |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#displayGroup |
       | resource.extension.valueString     | O RX                                                   |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#result       |
       | resource.extension.valueString     | urn:va:med:9E7A:229:10552                              |
       #Practitioner
       | resource.contained.resourceType     | Practitioner                            |
       | resource.contained.text.status      | generated                               |
       | resource.contained.text.div         | <div>Provider,Onehundredninetyone</div> |
       | resource.contained.identifier.value | urn:va:user:9E7A:11531                  |
       #Location
       | resource.contained.resourceType     | Location                 |
       | resource.contained.text.status      | generated                |
       | resource.contained.text.div         | <div>FUNNY</div>         |
       | resource.contained.name             | FUNNY                    |
       | resource.contained.identifier.value | urn:va:location:9E7A:230 |
       #Organization
       | resource.contained.resourceType     | Organization           |
       | resource.contained.text.status      | generated              |
       | resource.contained.text.div         | <div>CAMP MASTER</div> |
       | resource.contained.name             | CAMP MASTER            |
       | resource.contained.identifier.value | 500                    |
       #Medication
       | resource.contained.resourceType                      | Medication                                             |
       | resource.contained.name                              | CONTAINS CAPTOPRIL TAB                                 |
       | resource.contained.code.text                         | CONTAINS CAPTOPRIL TAB                                 |
       | resource.contained.code.coding.system                | oi-code                                                |
       | resource.contained.code.coding.code                  | urn:va:oi:1441                                         |
       | resource.contained.code.coding.display               | CONTAINS CAPTOPRIL TAB                                 |
       | resource.contained.code.coding.extension.url         | http://vistacore.us/fhir/extensions/order#oiPackageRef |
       | resource.contained.code.coding.extension.valueString | 98;99PSP                                               |
       #MedicationPrescription
       | resource.contained.resourceType       | MedicationPrescription      |
       | resource.contained.patient.reference  | Patient/9E7A;229            |
       | resource.contained.status             | stopped                     |
       | resource.contained.text.status        | generated                   |
       | resource.contained.text.div           | <div>CAPTOPRIL TAB </div>   |
       | resource.contained.identifier.value   | urn:va:order:9E7A:229:10552 |
       | resource.contained.medication.display | CONTAINS CAPTOPRIL TAB      |

 @F138_3_fhir_orders @fhir @10105V001065
 Scenario: Client can request orders results in FHIR format
       Given a patient with "orders" in multiple VistAs
       #And a patient with pid "10105V001065" has been synced through the RDK API
       When the client requests orders for the patient "9E7A;231" in FHIR format
       Then a successful response is returned
       And the FHIR results contain "orders"
       | name                              | value                                                  |
       | resource.text.status               | generated                                              |
       | resource.text.div                  | CONTAINS Request for Radiology                         |
       | resource.subject.reference         | Patient/9E7A;231                                       |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#kind         |
       | resource.extension.valueString     | Radiology                                              |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#service      |
       | resource.extension.valueString     | RA                                                     |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#localId      |
       | resource.extension.valueString     | 13740                                                  |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#displayGroup |
       | resource.extension.valueString     | RAD                                                    |
       #DiagnosticOrder
       | resource.contained.resourceType                           | DiagnosticOrder                                        |
       | resource.contained.subject.reference                      | Patient/9E7A;231                                       |
       | resource.contained.status                                 | requested                                              |
       | resource.contained.item.code.text                         | CHEST 2 VIEWS PA&LAT                                   |
       | resource.contained.item.code.coding.system                | oi-code                                                |
       | resource.contained.item.code.coding.code                  | urn:va:oi:2652                                         |
       | resource.contained.item.code.coding.display               | CHEST 2 VIEWS PA&LAT                                   |
       | resource.contained.item.code.coding.extension.url         | http://vistacore.us/fhir/extensions/order#oiPackageRef |
       | resource.contained.item.code.coding.extension.valueString | 58;99RAP                                               |
       | resource.contained.text.status                            | generated                                              |
       | resource.contained.identifier.value                       | urn:va:order:9E7A:231:13740                            |
       | resource.text.status           | generated                                              |
       | resource.subject.reference     | Patient/9E7A;231                                       |
       | resource.extension.valueString | Radiology                                              |
       #Medication
       | resource.contained.resourceType                      | Practitioner                     |
       | resource.contained.name                              | ABILENE (CAA)   |

       #MedicationPrescription
       | resource.contained.resourceType       |Practitioner     |
       | resource.contained.status             | requested       |
       | resource.contained.text.status        | generated                   |
       | resource.contained.text.div           | CONTAINS ABILENE    |
       | resource.contained.identifier.value   | urn:va:location:9E7A:195 |

 @F138_4_fhir_orders @fhir @10110V004877
 Scenario: Client can request orders results in FHIR format
       Given a patient with "orders" in multiple VistAs
       #And a patient with pid "10110V004877" has been synced through the RDK API
       When the client requests orders for the patient "9E7A;8" in FHIR format
       Then a successful response is returned
       And the FHIR results contain "orders"
       | name                                      | value                                                  |
       | resource.text.status                       | generated                                              |
       | resource.subject.reference                 | Patient/9E7A;8                                         |
       | resource.extension.url                     | http://vistacore.us/fhir/extensions/order#kind         |
       | resource.extension.valueString             | Medication, Infusion                                   |
       | resource.extension.url                     | http://vistacore.us/fhir/extensions/order#service      |
       | resource.extension.valueString             | PSIV                                                   |
       | resource.extension.url                     | http://vistacore.us/fhir/extensions/order#localId      |
       | resource.extension.valueString             | 10835                                                  |
       | resource.extension.url                     | http://vistacore.us/fhir/extensions/order#displayGroup |
       | resource.extension.valueString             | IV RX                                                  |
       | resource.extension.url                     | http://vistacore.us/fhir/extensions/order#result       |
       | resource.extension.valueString             | urn:va:med:9E7A:8:10835                                |
       | resource.extension.url                     | http://vistacore.us/fhir/extensions/order#predecessor  |
       #Medication
       | resource.contained.resourceType                      | Medication                                             |
       | resource.contained.name                              | 5% DEXTROSE INJ,SOLN IV                                |
       | resource.contained.code.text                         | 5% DEXTROSE INJ,SOLN IV                                |
       | resource.contained.code.coding.system                | oi-code                                                |
       | resource.contained.code.coding.code                  | urn:va:oi:2033                                         |
       | resource.contained.code.coding.display               | 5% DEXTROSE INJ,SOLN IV                                |
       | resource.contained.code.coding.extension.url         | http://vistacore.us/fhir/extensions/order#oiPackageRef |
       | resource.contained.code.coding.extension.valueString | 690;99PSP                                              |
       #MedicationPrescription
       | resource.contained.resourceType       | MedicationPrescription             |
       | resource.contained.patient.reference  | Patient/9E7A;8                     |
       | resource.contained.status             | stopped                            |
       | resource.contained.text.status        | generated                          |
       | resource.contained.text.div           | <div>5% DEXTROSE INJ,SOLN IV</div> |
       | resource.contained.identifier.value   | urn:va:order:9E7A:8:10835          |
       | resource.contained.medication.display | 5% DEXTROSE INJ,SOLN IV            |
       | resource.text.status               | generated                                              |
       | resource.subject.reference         | Patient/9E7A;8                                         |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#kind         |
       | resource.extension.valueString     | Medication, Infusion                                  |
       | resource.extension.url             | http://vistacore.us/fhir/extensions/order#service      |
       #Medication
       | resource.contained.resourceType                      | Medication                                             |
       | resource.contained.code.text                         | 5% DEXTROSE INJ,SOLN IV                            |
       | resource.contained.code.coding.system                | oi-code                                                |
       | resource.contained.code.coding.code                  | urn:va:oi:2033                                        |
       | resource.contained.code.coding.display               | 5% DEXTROSE INJ,SOLN IV                          |
       | resource.contained.code.coding.extension.url         | http://vistacore.us/fhir/extensions/order#oiPackageRef |
       | resource.contained.code.coding.extension.valueString | 690;99PSP                                              |
       #MedicationPrescription
       | resource.contained.resourceType       | MedicationPrescription     |
       | resource.contained.patient.reference  | Patient/9E7A;8             |
       | resource.contained.status             | stopped                    |
       | resource.contained.text.status        | generated                  |
       | resource.contained.medication.display | 5% DEXTROSE INJ,SOLN IV|

 @F138_5_fhir_orders @fhir @9E7A167
 Scenario: Client can break the glass when requesting orders in FHIR format for a sensitive patient
       Given a patient with "orders" in multiple VistAs
       #And a patient with pid "9E7A;167" has been synced through the RDK API
       When the client requests orders for that sensitive patient "9E7A;167"
       Then a permanent redirect response is returned
       When the client breaks glass and repeats a request for orders for that patient "9E7A;167"
       Then a successful response is returned
