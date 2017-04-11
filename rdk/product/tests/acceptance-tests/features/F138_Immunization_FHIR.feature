@future @debug
@F138_Immunization_FHIR @vxsync @patient
Feature: F138 - Return of immunization in FHIR format
#This feature item returns Immunization in FHIR format from all VistA instances in which a patient record exists. It includes breaking the glass for a sensitive patient.
#Patients used: 5000000116V912836, 5000000217V519385, 10107V395912, 5123456789V027402, 10117V810068, 10108V420871

  @F138_1_fhir_immunzation @fhir @9E7A253
  Scenario: Client can request immunization results in FHIR format
      Given a patient with "immunization" in multiple VistAs
      When the client requests immunization for the patient "9E7A;253" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "immunization"
      | name                          | value                |
      | resource.text.status          | generated            |
      | resource.resourceType         | Immunization         |
      #Organization
      | resource.contained.resourceType    |Organization          |
      | resource.contained.identifier.value | 888                  |
      | resource.contained.name             | FT. LOGAN            |
      #Practitioner
      | resource.contained.resourceType    | Practitioner         |
      | resource.contained.identifier.value | urn:va:user:9E7A:11623   |
      | resource.contained.name             | STUDENT,SEVEN            |
      | resource.contained.text.status      | generated                |
      #Location
      | resource.contained.resourceType     | Location                 |
      | resource.contained.identifier.value | urn:va:location:9E7A:32  |
      | resource.contained.name             | PRIMARY CARE             |
      | resource.contained.text.status       | generated                |
      #Extensions
      | resource.extension.valueBoolean | false                                 |
      | resource.extension.url          | CONTAINS immunization#seriesName      |
      | resource.extension.valueString  | BOOSTER                               |
      #Vaccin no1
      | resource.date                       | IS_FHIR_FORMATTED_DATE  |
      | resource.vaccineType.coding.code    | CONTAINS urn:cpt:90732  |
      | resource.vaccineType.coding.display | PNEUMOCOCCAL VACCINE    |
      | resource.reported                   | false                   |
      #Vaccin no2
      And the FHIR results contain "immunization"
      | name                                | value                   |
      | resource.date                       | IS_FHIR_FORMATTED_DATE  |
      | resource.vaccineType.coding.code    | CONTAINS urn:cpt:90732  |
      | resource.vaccineType.coding.display | PNEUMOCOCCAL VACCINE    |
      | resource.reported                   | false                   |
      | resource.date                       | IS_FHIR_FORMATTED_DATE  |
      | resource.vaccineType.coding.code    | CONTAINS urn:cpt:90732  |
      | resource.vaccineType.coding.display | PNEUMOCOCCAL VACCINE    |
      | resource.reported                   | false                   |
      #Vaccin no2
      And the FHIR results contain "immunization"
      | name                                | value                    |
      | resource.date                       | IS_FHIR_FORMATTED_DATE   |
      | resource.vaccineType.coding.code    | CONTAINS urn:cpt:90732   |
      | resource.vaccineType.coding.display | PNEUMOCOCCAL VACCINE     |
      | resource.reported                   | false                    |
   And FHIR date and time conver to Zulu format for Immunization
   
  @F138_2_fhir_immunzation @fhir @9E7A100615
  Scenario: Client can request immunization results in FHIR format
      Given a patient with "immunization" in multiple VistAs
      And a patient with pid "9E7A;100615" has been synced through the RDK API
      When the client requests immunization for the patient "9E7A;100615" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "immunization"
      | name                                | value                         |
      | resource.text.status                | generated                     |
      | resource.subject.reference          | Patient/HDR;5000000116V912836 |
      #Organization
      | resource.contained.resourceType     | Organization              |
      | resource.contained.identifier.label | facility-code             |
      | resource.contained.identifier.value | 561                       |
      | resource.contained.name             | New Jersey HCS            |
      | resource.contained.text.status      | generated                 |
      #Practitioner
      | resource.contained.resourceType     | Practitioner                       |
      | resource.contained.identifier.label | uid                                |
      | resource.contained.identifier.value | CONTAINTS urn:va:user:ABCD:11278   |
      | resource.contained.name             | WARDCLERK,SIXTYEIGHT               |
      | resource.contained.text.status      | generated                          |
      #Location
      | resource.contained.resourceType     | Location                |
      | resource.contained.identifier.label | uid                     |
      | resource.contained.identifier.value | CONTAINS urn:va:location:ABCD:64   |
      | resource.contained.name             | AUDIOLOGY               |
      | resource.contained.text.div         | CONTAINS AUDIOLOGY      |
      | resource.contained.text.status      | generated               |
      #Extensions
      | resource.extension.url          | CONTAINS immunization#contraindicated |
      | resource.extension.valueBoolean | false                                 |
      | resource.extension.url          | CONTAINS immunization#encounterUid    |
      | resource.extension.valueString  | urn:va:visit:ABCD:229:1975            |
      | resource.extension.url          | CONTAINS immunization#encounterName   |
      | resource.extension.valueString  | AUDIOLOGY Apr 04, 2000                |
      #Vaccin no1
      | resource.date                       | IS_FHIR_FORMATTED_DATE   |
      | resource.vaccineType.coding.code    | CONTAINS urn:cpt:90732   |
      | resource.vaccineType.coding.display | PNEUMOCOCCAL VACCINE     |
      | resource.reported                   | false                    |
      #Vaccin no2
      And the FHIR results contain "immunization"
      | name                                | value                            |
      | resource.text.div                   | CONTAINS BCG                     |
      | resource.contained.identifier.value | DOD                              |
      | resource.contained.name             | DOD                              |
      | resource.date                       | IS_FHIR_FORMATTED_DATE           |
      | resource.vaccineType.coding.code    | 19                               |
      | resource.vaccineType.coding.display | Bacillus Calmette-Guerin vaccine |
      | resource.reported                   | false                            |
      And the FHIR results contain "immunization"
      | name                                | value                    |
      | resource.text.div                   | CONTAINS MMR             |
      | resource.contained.identifier.value | DOD                      |
      | resource.contained.name             | DOD                      |
      | resource.date                       | IS_FHIR_FORMATTED_DATE   |
      | resource.vaccineType.coding.code    | 3                        |
      | resource.reported                   | false                    |
      And the FHIR results contain "immunization"
      | name                                | value                    |
      | resource.text.div                   | CONTAINS Td              |
      | resource.contained.identifier.value | DOD                      |
      | resource.contained.name             | DOD                      |
      | resource.date                       | IS_FHIR_FORMATTED_DATE   |
      | resource.vaccineType.coding.code    | 9                        |
      | resource.reported                   | false                    |
      And the FHIR results contain "immunization"
      | name                                | value                           |
      | resource.text.div                   | CONTAINS IPV                    |
      | resource.contained.identifier.value | DOD                             |
      | resource.contained.name             | DOD                             |
      | resource.date                       | IS_FHIR_FORMATTED_DATE          |
      | resource.vaccineType.coding.code    | 10                              |
      | resource.vaccineType.coding.display | poliovirus vaccine, inactivated |
      | resource.reported                   | false                           |

@F138_3_fhir_immunzation @fhir @9E7A100716
Scenario: Client can request immunization results in FHIR format
      Given a patient with "immunization" in multiple VistAs
      And a patient with pid "9E7A;100716" has been synced through the RDK API
      When the client requests immunization for the patient "9E7A;100716" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "immunization"
      #Vaccin no1
      | name                                | value                     |
      | resource.text.div                   | CONTAINS PNEUMOCOCCAL     |
      | resource.contained.identifier.value | 561                       |
      | resource.contained.name             | New Jersey HCS            |
      | resource.date                       | IS_FHIR_FORMATTED_DATE    |
      | resource.vaccineType.coding.code    | CONTAINS urn:cpt:90732    |
      | resource.vaccineType.coding.display | PNEUMOCOCCAL VACCINE      |
      | resource.performer.display          | WARDCLERK,SIXTYEIGHT      |
      | resource.location.display           | AUDIOLOGY                 |
      | resource.reported                   | false                     |
      | resource.refusedIndicator           | false                     |
      And the FHIR results contain "immunization"
      #Vaccin no2
      | name                                | value         |
      | resource.text.div                   | CONTAINS Td   |
      | resource.contained.identifier.value | DOD                                       |
      | resource.contained.name             | DOD                                       |
      | resource.date                       | IS_FHIR_FORMATTED_DATE                    |
      | resource.vaccineType.coding.code    | 9                                         |
      | resource.vaccineType.coding.system  | CONTAINS urn:oid:2.16.840.1.113883.12.292 |
      | resource.reported                  | false                            |
      | resource.refusedIndicator          | false                            |
      And the FHIR results contain "immunization"
      #Vaccin no3, no5, no11
      | name                                | value                    |
      | resource.text.div                   | CONTAINS Hep B - Adult   |
      | resource.contained.identifier.value | DOD                      |
      | resource.contained.name             | DOD                      |
      | resource.date                       | IS_FHIR_FORMATTED_DATE   |
      | resource.vaccineType.coding.code    | 43                                |
      | resource.vaccineType.coding.system  | urn:oid:2.16.840.1.113883.12.292  |
      | resource.vaccineType.coding.display | hepatitis B vaccine, adult dosage |
      | resource.reported                   | false                             |
      | resource.refusedIndicator           | false                             |
      And the FHIR results contain "immunization"
      #Vaccin no4
      | name                                | value          |
      | resource.text.div                   | CONTAINS MMR   |
      | resource.contained.identifier.value | DOD            |
      | resource.contained.name             | DOD            |
      | resource.date                       | IS_FHIR_FORMATTED_DATE           |
      | resource.vaccineType.coding.code    | 3                                |
      | resource.vaccineType.coding.system  | urn:oid:2.16.840.1.113883.12.292 |
      | resource.reported                   | false                            |
      | resource.refusedIndicator           | false                            |
      And the FHIR results contain "immunization"
      #Vaccin no6
      | name                                | value           |
      | resource.text.div                   | CONTAINS IPPD   |
      | resource.contained.identifier.value | DOD             |
      | resource.contained.name             | DOD             |
      | resource.date                       | IS_FHIR_FORMATTED_DATE  |
      | resource.vaccineType.coding.code    | 96    |
      | resource.reported                   | false |
      | resource.refusedIndicator           | false |
      And the FHIR results contain "immunization"
      #Vaccin no7
      | name                                | value                           |
      | resource.text.div                   | CONTAINS Rabies - Intradermal   |
      | resource.contained.identifier.value | DOD                             |
      | resource.contained.name             | DOD                             |
      | resource.date                       | IS_FHIR_FORMATTED_DATE                    |
      | resource.vaccineType.coding.code    | 40                                        |
      | resource.vaccineType.coding.display | rabies vaccine, for intradermal injection |
      | resource.reported                   | false                                     |
      | resource.refusedIndicator           | false                                     |
      And the FHIR results contain "immunization"
      #Vaccin no8
      | name                                | value                 |
      | resource.text.div                   | CONTAINS Rabies NOS   |
      | resource.contained.identifier.value | DOD                   |
      | resource.contained.name             | DOD                   |
      | resource.date                       | IS_FHIR_FORMATTED_DATE                  |
      | resource.vaccineType.coding.code    | 90                                      |
      | resource.vaccineType.coding.display | rabies vaccine, unspecified formulation |
      | resource.reported                   | false                                   |
      | resource.refusedIndicator           | false                                   |
      And the FHIR results contain "immunization"
      #Vaccin no9
      | name                                | value              |
      | resource.text.div                   | CONTAINS Anthrax   |
      | resource.contained.identifier.value | DOD                |
      | resource.contained.name             | DOD                |
      | resource.date                       | IS_FHIR_FORMATTED_DATE |
      | resource.vaccineType.coding.code    | 24              |
      | resource.vaccineType.coding.display | anthrax vaccine |
      | resource.reported                   | false           |
      | resource.refusedIndicator           | false           |
      And the FHIR results contain "immunization"
      #Vaccin no10
      | name                                | value                |
      | resource.text.div                   | CONTAINS Influenza   |
      | resource.contained.identifier.value | DOD                  |
      | resource.contained.name             | DOD                  |
      | resource.date                       | IS_FHIR_FORMATTED_DATE               |
      | resource.vaccineType.coding.code    | 16                                   |
      | resource.vaccineType.coding.display | influenza virus vaccine, whole virus |
      | resource.reported                   | false                                |
      | resource.refusedIndicator           | false                                |

@F138_4_fhir_immunzation @fhir @enrich @9E7A3
Scenario: Client can request immunization results in FHIR format
      Given a patient with "immunization" in multiple VistAs
      And a patient with pid "9E7A;3" has been synced through the RDK API
      When the client requests immunization for the patient "9E7A;3" in FHIR format
      Then a successful response is returned
      And the FHIR results contain "immunization"
      #Vaccin no1
      | name                                | value          |
      | resource.text.div                   | CONTAINS MMR   |
      | resource.contained.identifier.value | DOD            |
      | resource.contained.name             | DOD            |
      | resource.date                    | IS_FHIR_FORMATTED_DATE |
      | resource.vaccineType.coding.code | 3     |
      | resource.reported                | false |
      | resource.refusedIndicator        | false |
      And the FHIR results contain "immunization"
      #Vaccin no2
      | name                                | value                   |
      | resource.text.div                   | CONTAINS Yellow Fever   |
      | resource.contained.identifier.value | DOD                     |
      | resource.contained.name             | DOD                     |
      | resource.date                       | IS_FHIR_FORMATTED_DATE  |
      | resource.vaccineType.coding.code    | 37                      |
      | resource.vaccineType.coding.display | yellow fever vaccine    |
      | resource.reported                   | false                   |
      | resource.refusedIndicator           | false                   |
      And the FHIR results contain "immunization"
      #Vaccin no3
      | name                                | value           |
      | resource.text.div                   | CONTAINS Tdap   |
      | resource.contained.identifier.value | DOD             |
      | resource.contained.name             | DOD             |
      | resource.date                       | IS_FHIR_FORMATTED_DATE  |
      | resource.vaccineType.coding.code    | 115                     |
      | resource.vaccineType.coding.display | tetanus toxoid, reduced diphtheria toxoid, and acellular pertussis vaccine, adsorbed |
      | resource.reported                   | false                   |
      | resource.refusedIndicator           | false                   |

@F138_5_fhir_immunzation @fhir @5123456789V027402
Scenario: Client can break the glass when requesting immunization in FHIR format for a sensitive patient
      Given a patient with "immunization" in multiple VistAs
      And a patient with pid "9E7A;18" has been synced through the RDK API
      When the client requests immunization for that sensitive patient "9E7A;18"
      Then a permanent redirect response is returned
      When the client breaks glass and repeats a request for immunization for that patient "9E7A;18"
      Then a successful response is returned
      And the results contain
      | name | value |
      # @TODO, we now have one CDS immunization record for this patient

@F138_6_fhir_immunzation @fhir @10117V810068
Scenario: Negativ scenario. Client can request immunization results in FHIR format
      Given a patient with "no immunization" in multiple VistAs
      When the client requests immunization for the patient "9E7A;428" in FHIR format
      Then a successful response is returned
      And the results contain
      | name | value |
      # @TODO, we now have one CDS immunization record for this patient

@F138_7_fhir_immunzation @fhir @5000000116V912836 @DE974
Scenario: Client can request immunization results in FHIR format
      Given a patient with "immunization" in multiple VistAs
      And a patient with pid "9E7A;100615" has been synced through the RDK API
      When the client requests "10" immunization for the patient "9E7A;100615" in FHIR format
      Then a successful response is returned
      And total returned resources are "10"
      And the results contain
      | name         | value |
    
