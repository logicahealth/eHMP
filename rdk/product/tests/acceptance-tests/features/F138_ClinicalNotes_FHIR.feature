@F138_fhir_clinicalnote @vxsync @patient
Feature: F138 - Return of clinical notes in FHIR format
#This feature item returns clinical notes in FHIR format from all VistA instances in which a patient record exists. It includes breaking the glass for a sensitive patient.
#Patients used: SITE;253, 5000000116V912836, 5000000217V519385, 10107V395912
@F138_1_fhir_clinicalnote @fhir @SITE253 @US8574
Scenario: Client can request clinical notes results in FHIR format
      Given a patient with "clinical notes" in multiple VistAs
      When the client requests clinical notes for the patient "SITE;253" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "clinical notes"
      | name                             | value                                      |
      | resource.resourceType            | Composition                                |
      | resource.title                   | ADVANCE DIRECTIVE COMPLETED                |
      | resource.status                  | final                                      |
      | resource.subject.reference       | Patient/SITE;253                           |
      | resource.identifier.value        | CONTAINS urn:va:document:SITE:253:3852     |
      | resource.date                    | IS_FHIR_FORMATTED_DATE                     |
      | resource.type.coding.system      | CONTAINS urn:oid:2.16.840.1.113883.6.233   |
      | resource.type.coding.code        | D                                          |
      | resource.type.text               | Advance Directive                          |
      | resource.class.text              | PROGRESS NOTES                             |
      | resource.title                   | ADVANCE DIRECTIVE COMPLETED                |
      | resource.confidentiality         | N                                          |
      | resource.author.reference          | Provider/urn:va:user:SITE:10000000049    |
      | resource.attester.party.reference  | Provider/urn:va:user:SITE:10000000049    |
      | resource.attester.time             | IS_FHIR_FORMATTED_DATE                   |
      | resource.attester.mode             | professional                             |
      | resource.encounter.display         | 20 MINUTE May 16, 2007                   |
      | resource.encounter.reference       | Encounter/urn:va:visit:SITE:253:5669     |
      | resource.section.code.coding.code  | CONTAINS urn:va:document:SITE:253:3852   |
      #Organization
      | resource.contained.resourceType       | Organization                          |
      | resource.contained.identifier.system  | urn:oid:2.16.840.1.113883.6.233       |
      | resource.contained.identifier.value   | 500                                   |
      | resource.contained.name               | CAMP MASTER                           |
      | resource.contained.text.status        | generated                             |
      #Extensions
      | resource.extension.url           | http://vistacore.us/fhir/extensions/composition#author            |
      | resource.extension.valueString   | LABTECH,FIFTYNINE                                                 |
      | resource.extension.url           | http://vistacore.us/fhir/extensions/composition#authorDisplayName |
      | resource.extension.valueString   | Labtech,Fiftynine                                                 |
      #List
      | resource.contained.resourceType | List                |
      | resource.contained.text.status  | generated           |
      | resource.contained.status       | current             |
      | resource.contained.mode         | working             |
      And FHIR date and time conver to Zulu format for clinical note

@F138_2_fhir_clinicalnote @fhir @SITE100615 @DE1367 @US8574 
Scenario: Client can request clinical notes results in FHIR format
      Given a patient with "clinical notes" in multiple VistAs
      When the client requests clinical notes for the patient "SITE;100615" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "clinical notes"
      | name                               | value                                              |
      | resource.identifier.system         | CONTAINS urn:oid:2.16.840.1.113883.6.233           |
      | resource.type.coding.system        | CONTAINS urn:oid:2.16.840.1.113883.6.233           |
      | resource.confidentiality           | N                                                  |
      | resource.subject.reference         | Patient/SITE;100615                                |
      #Organization
      | resource.contained.resourceType     | Organization   |
      | resource.contained.text.status      | generated      |
      #Observation
      | resource.contained.resourceType | List             |
      | resource.contained.text.status  | generated        |
      | resource.contained.status       | current          |
      | resource.contained.mode         | working          |
      #Author
      | resource.extension.url          | CONTAINS composition#documentTypeName  |
      | resource.extension.url          | CONTAINS composition#author            |

@F138_3_fhir_clinicalnote @fhir @SITE100716 @US8574 
Scenario: Client can request clinical notes results in FHIR format
      Given a patient with "clinical notes" in multiple VistAs
      When the client requests clinical notes for the patient "SITE;100716" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "clinical notes"
      | name                                | value                                     |
      | resource.resourceType               | Composition                               |
      | resource.status                     | final                                     |
      | resource.identifier.system          | CONTAINS urn:oid:2.16.840.1.113883.6.233  |
      | resource.type.coding.system         | CONTAINS urn:oid:2.16.840.1.113883.6.233  |
      | resource.type.coding.code           | D                                         |
      | resource.type.text                  | Advance Directive                         |
      | resource.class.text                 | PROGRESS NOTES                            |
      | resource.title                      | ADVANCE DIRECTIVE COMPLETED               |
      | resource.confidentiality            | N                                         |
      | resource.encounter.reference        | CONTAINS Encounter/                       |
      | resource.encounter.display          | 20 MINUTE May 16, 2007                    |
      | resource.section.code.coding.system | CONTAINS urn:oid:2.16.840.1.113883.6.233  |
      #Organization
      | resource.contained.resourceType       | Organization                              |
      | resource.contained.identifier.system  | CONTAINS urn:oid:2.16.840.1.113883.6.233  |
      | resource.contained.name               | New Jersey HCS                            |
      #List
      | resource.contained.resourceType       | List                                      |
      | resource.contained.text.status        | generated                                 |
      | resource.contained.text.div           | CONTAINS VistA Imaging - Scanned Document |
      | resource.contained.status             | current                                   |
      | resource.contained.mode               | working                                   |
      #Extensions
      | resource.extension.url          | http://vistacore.us/fhir/extensions/composition#documentTypeCode     |
      | resource.extension.valueString  | D                                                                    |
      | resource.extension.url          | http://vistacore.us/fhir/extensions/composition#documentTypeName     |
      | resource.extension.valueString  | Advance Directive                                                    |
      | resource.extension.url          | http://vistacore.us/fhir/extensions/composition#isInterdisciplinary  |
      | resource.extension.valueBoolean | false                                                                |

@F138_4_fhir_clinicalnote @fhir @SITE100184 @US8574 
Scenario: Negativ scenario. Client can request clinical notes results in FHIR format
      Given a patient with "no clinical notes" in multiple VistAs
      When the client requests clinical notes for the patient "SITE;253" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "cinical notes"
      | name                                | value                                     |
      | resource.resourceType               | Composition                               |

@F138_5_fhir_clinicalnote @fhir @SITE301 @DE974 @US8574 
Scenario: Client can request clinical notes results in FHIR format
      Given a patient with "clinical notes" in multiple VistAs
      When the client requests "10" clinical notes for the patient "SITE;301" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "cinical notes"
      | name                                | value                                     |
      | resource.resourceType               | Composition                               |
