@Demographics_FHIR @vxsync @patient
Feature: F138 Return of Demographics in FHIR format

#This feature item returns Demographics data in FHIR format from all VistA instances in which a patient record exists. It includes breaking the glass for a sensitive patient.


  @F138_1_fhir_demographics @US2344-test @fhir @5000000217V519385
  Scenario: Client can request demographics in FHIR format
    Given a patient with "demographics" in multiple VistAs
    When the client requests demographics for that patient "9E7A;253"
    Then a successful response is returned
    And the results contain
      | demographics_supplemental_list | demographics_values |
      | resourceType                   | Patient             |
       # defined on wiki and found in json
      | text.status           | generated                                   |
      | text.div              | <div>SEVEN,PATIENT. SSN: 666000007</div>  |
      | extension.url              | http://vistacore.us/fhir/profiles/@main#service-connected |
      | extension.valueCoding.display| Service Connected                                         |
        # identifier[ssn]
      | identifier.use    | official                       |
      | identifier.system | http://hl7.org/fhir/sid/us-ssn |
      | identifier.value  | 666000007                      |
      | identifier.system | http://vistacore.us/fhir/id/icn |
      | identifier.value  | 10107V395912               |
      |gender                         | male             |
      |birthDate                      | 1935-04-07        |
     
  @F138_2_fhir_demographics @US2344_mar_test @fhir @10105V001065
  Scenario: Client can request demographics in FHIR format
    Given a patient with "demographics" in multiple VistAs
    When the client requests demographics for that patient "9E7A;231"
    Then a successful response is returned
    And the results contain
      | demographics_supplemental_list     | demographics_values                                               |
      | maritalStatus.coding.system        | http://hl7.org/fhir/v3/MaritalStatus                              |
      | maritalStatus.coding.code          | S                                                                 |
      | maritalStatus.coding.display       | Never Married                                                     |
      | extension.url                      | http://vistacore.us/fhir/profiles/@main#service-connected         |
      | extension.url                      | http://vistacore.us/fhir/profiles/@main#sensitive                 |
      | extension.url                      | http://vistacore.us/fhir/profiles/@main#religion                  |
      | extension.url                      | http://vistacore.us/fhir/profiles/@main#service-connected-percent |
      | text.div                           | <div>FIVE,PATIENT. SSN: 666000005</div>                           |
      # identifier
      | identifier.use                      | official                                                         |
      | identifier.system                   | http://hl7.org/fhir/sid/us-ssn                                   |
      | identifier.value                    | 666000005                                                        |
      | identifier.system                   | http://vistacore.us/fhir/id/uid                                  |
      | identifier.value                    | 231                                      |
      | identifier.system                   | http://vistacore.us/fhir/id/dfn                                  |
      | identifier.value                    | 231                                                              |
      | identifier.system                   | http://vistacore.us/fhir/id/pid                                  |
      | identifier.value                    | 231                                                         |
      | identifier.system                   | http://vistacore.us/fhir/id/lrdfn                                |
      | identifier.value                    | 387                                                              |
      | identifier.system                   | http://vistacore.us/fhir/id/icn                                  |
      | identifier.value                    | 10105V001065                                                     |

      | gender                               | male                                                            |
      | birthDate                            | 1935-04-07                                                      |
      #contained[Organization][x].id
      | contained.resourceType               | Organization                                                    |
      | contained.id                         | IS_SET                                                          |
      | contained.identifier.value           | 998                                                             |
      | contained.identifier.system          | urn:oid:2.16.840.1.113883.6.233                                 |
      | contained.name                       | ABILENE (CAA)                                                   |
      | managingOrganization.reference       | IS_SET                          |

      | telecom.value                      | (222)555-7720                                                     |
      | telecom.system                     | phone                                                             |
      | telecom.use                        | work                                                              |
      | telecom.value                      | (222)555-8235                                                     |
      | telecom.use                        | home                                                              |
      | telecom.system                     | phone                                                             |

      | contact.relationship.coding.system | http://hl7.org/fhir/patient-contact-relationship                  |
      | contact.relationship.coding.code   | family                                                            |
      | contact.name.use                   | usual                                                             |
      | contact.name.text                  | VETERAN,BROTHER                                                   |


    # in json, but not defined on wiki
      | extension.valueCoding.code          | urn:va:pat-religion:99 |
      | extension.valueCoding.display       | ROMAN CATHOLIC CHURCH  |
      | extension.valueQuantity.value       | 10                     |
      | extension.valueQuantity.units       | %                      |
      | extension.valueCoding.code          | Y                      |
      | extension.valueCoding.display       | Service Connected      |
      | contact.relationship.coding.display | Next of Kin            |
      | address.line                        | Any Street             |
     # | address.zip                         | 99998                 |
      | address.state                       | WV                     |


  @F138_3_fhir_demographics  @US2344_SEN @fhir @9E7A167
  Scenario: Client can break the glass when requesting demographics in FHIR format for a sensitive patient
    Given a patient with "demographics" in multiple VistAs
    When the client requests demographics for that sensitive patient "urn:va:patient:9E7A:167:167"
    Then a permanent redirect response is returned
    #When the client breaks glass and repeats a request for demographics for that patient "urn:va:patient:9E7A:167:167"
    #Then a successful response is returned
    And the results contain
     | demographics_supplemental_list                   | demographics_values                          |

  @F138_4_fhir_demographics @US2344_WIKI_test @fhir @C877100022
  Scenario: Client can request demographics in FHIR format
    Given a patient with "demographics" in multiple VistAs
    When the client requests demographics for that patient "urn:va:patient:9E7A:100022:100022"
    Then a successful response is returned
    And the results contain
      | demographics_supplemental_list | demographics_values |
      | resourceType                   | Patient             |
      # defined on wiki and found in json
      | text.status           | generated                                   |
      | text.div              |  <div>BCMA,EIGHT. SSN: 666330008</div>       |
      | gender                | male                                        |
      | birthDate             | 1945-04-07                                  |
      | extension.url              | http://vistacore.us/fhir/profiles/@main#service-connected |
      | extension.valueCoding.code | Y                                                         |
       # identifier[ssn]

      | identifier.use    | official                       |
      | identifier.system | http://hl7.org/fhir/sid/us-ssn |
      | identifier.value  | 666330008                      |
       # identifier[zzz uid]

      | identifier.system | http://vistacore.us/fhir/id/uid   |
      | identifier.value  | urn:va:patient:9E7A:100022:100022 |
       # identifier[y icn]
      | identifier.system | http://vistacore.us/fhir/id/lrdfn |
      | identifier.value  | 418                               |
       #identifier[z dfn]
      | identifier.system | http://vistacore.us/fhir/id/dfn |
      | identifier.value  | 100022                          |

      | identifier.system | http://vistacore.us/fhir/id/pid |
      | identifier.value  | 9E7A;100022                     |
      # only in json, not defined on wiki
      | resourceType                  | Patient           |
      | extension.valueCoding.code    | Y                 |
      | extension.valueCoding.display | Service Connected |
      | name.text                     | BCMA,EIGHT        |
