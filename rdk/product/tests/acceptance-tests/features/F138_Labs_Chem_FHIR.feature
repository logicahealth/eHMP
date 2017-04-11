 @labs_fhir @vxsync @patient
 Feature: F138 Return of Lab (Chem/Hem) Results in FHIR format

 #This feature item covers the return of Chemistry and Hematology Lab results in FHIR format. Also includes cases when no results exist.


 @F138_1_Labs_chem_fhir @fhir @11016V630869
 Scenario: Client can request lab (Chem/Hem) results in FHIR format
       Given a patient with "lab (Chem/Hem) results" in multiple VistAs
      # And a patient with pid "11016V630869" has been synced through the RDK API
       When the client requests lab "(Chem/Hem)" results for that patient "9E7A;227"
       Then a successful response is returned
       And the results contain lab "(Chem/Hem)" results
       | field                                 | panorama_value      |
       | resource.contained.valueQuantity.value | 17.5                |
       | resource.issued                        | IS_FHIR_FORMATTED_DATE |
       | resource.name.text           | PROTIME             |
       | resource.name.coding.code              | CONTAINS urn:va:ien:60:467:73                            |
       | resource.name.coding.display           | PROTIME                                           |
       | resource.name.coding.system            | CONTAINS urn:oid:2.16.840.1.113883.4.642.2.58                  |
       | resource.name.coding.code              | CONTAINS urn:va:ien:60:467:73                                   |
       | resource.name.coding.display           | PROTIME                                          |
       | resource.name.coding.system            | urn:oid:2.16.840.1.113883.4.642.2.58              |
       | resource.contained.referenceRange.high.value     | 13                                              |
       | resource.contained.referenceRange.high.units     | SEC.                                             |
       | resource.contained.referenceRange.low.value      | 10                                                |
       | resource.contained.referenceRange.low.units      | SEC.                                            |
       | resource.contained.status                        | final                                             |
       | resource.contained.reliability                   | ok                                                |
       | resource.contained.specimen.display              | PLASMA                                             |
       | resource.contained.text.status                  | generated                                                       |
       | resource.contained.identifier.type.text         | facility-code                                                   |
       | resource.contained.identifier.value             | 500                                                             |
       | resource.contained.name                         | ALBANY VA MEDICAL CENTER                                        |
       | resource.contained.address.text                 | CONTAINS VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097      |
       | resource.contained.address.line                 | VA MEDICAL CENTER 1 3RD sT.                                     |
       | resource.contained.address.city                 | ALBANY                                                          |
       | resource.contained.address.state                | NY                                                              |
       | resource.contained.address.postalCode           | 12180-0097                                                      |
       | resource.contained.type.text                    | PLASMA                                                          |
       | resource.contained.subject.reference            | Patient/9E7A;227                                            |
       | resource.contained.collection.collectedDateTime | IS_FHIR_FORMATTED_DATE                                            |
       | resource.text.status                            | generated                                                       |
       | resource.name.coding.system                     | urn:oid:2.16.840.1.113883.4.642.2.58                            |
       | resource.status                                 | final                                                           |
       | resource.issued                                 | IS_FHIR_FORMATTED_DATE                                             |
       | resource.subject.reference                      | Patient/9E7A;227                                            |
       | resource.performer.display                      | ALBANY VA MEDICAL CENTER                                        |
       | resource.serviceCategory.coding.code            | CH                                                              |
       | resource.serviceCategory.coding.system          | http://hl7.org/fhir/v2/0074                                     |
       | resource.serviceCategory.coding.display         | Chemistry                                                       |
       | resource.serviceCategory.text                   | Chemistry                                                       |
       | resource.diagnosticDateTime                     | IS_FHIR_FORMATTED_DATE                                            |
       | resource.specimen.display                       | PLASMA                                                          |
       | resource.result.display                         | PROTIME                                                         |
       | resource.subject.reference     | Patient/9E7A;227                               |
       | resource.contained.type.text   | PLASMA                                             |
       | resource.extension.url         | http://vistacore.us/fhir/extensions/lab#groupName  |
       | resource.extension.valueString | COAG 0317 119                                      |
       | resource.extension.url         | http://vistacore.us/fhir/extensions/lab#groupUid   |
       | resource.extension.valueString | urn:va:accession:9E7A:227:CH;6949681.966382        |
       | resource.extension.url         | http://vistacore.us/fhir/extensions/lab#localId    |
       | resource.extension.valueString | CH;6949681.966382;430                              |
       | resource.extension.url         | http://vistacore.us/fhir/extensions/lab#orderUid   |
       | resource.extension.valueString | urn:va:order:9E7A:227:16688                        |


 @F138_2_Labs_chem_fhir @fhir @11016V630869
 Scenario: Client can request lab (Chem/Hem) results in FHIR format
       Given a patient with "lab (Chem/Hem) results" in multiple VistAs
       #And a patient with pid "11016V630869" has been synced through the RDK API
       When the client requests lab "(Chem/Hem)" results for that patient "9E7A;227"
       Then a successful response is returned
       And the results contain lab "(Chem/Hem)" results
       | field                                 | kodak_value         |
       | resource.contained.valueQuantity.value | 17.5                |
       | resource.issued                        | IS_FHIR_FORMATTED_DATE |
       | resource.name.text           | PROTIME             |
       | resource.name.text                     | PROTIME                                            |
       | resource.name.coding.code              | urn:va:ien:60:467:73                               |
       | resource.name.coding.display           | PROTIME                                            |
       | resource.name.coding.system            | urn:oid:2.16.840.1.113883.4.642.2.58                   |
       | resource.name.coding.display           | PROTIME                                            |
       | resource.name.coding.system            | urn:oid:2.16.840.1.113883.4.642.2.58             |
       | resource.contained.valueQuantity.value           | 17.5                                               |
       | resource.contained.valueQuantity.units           | SEC.                                             |
       | resource.contained.referenceRange.high.value     | 13                                              |
       | resource.contained.referenceRange.high.units     | SEC.                                             |
       | resource.contained.referenceRange.low.value      | 10                                               |
       | resource.contained.referenceRange.low.units      | SEC.                                             |
       | resource.contained.status                        | final                                             |
       | resource.contained.reliability                   | ok                                                |
       | resource.contained.specimen.display              | PLASMA                                             |
       | resource.contained.text.status                  | generated                                                       |
       | resource.contained.identifier.type.text         | facility-code                                                   |
       | resource.contained.name                         | ALBANY VA MEDICAL CENTER                                        |
       | resource.contained.address.text                 | CONTAINS VA MEDICAL CENTER 1 3RD sT. ALBANY, NY 12180-0097      |
       | resource.contained.address.line                 | VA MEDICAL CENTER 1 3RD sT.                                     |
       | resource.contained.address.city                 | ALBANY                                                          |
       | resource.contained.address.state                | NY                                                              |
       | resource.contained.address.postalCode           | 12180-0097                                                      |
       | resource.contained.type.text                    | PLASMA                                                          |
       | resource.contained.subject.reference            | Patient/9E7A;227                                            |
       | resource.contained.collection.collectedDateTime | IS_FHIR_FORMATTED_DATE                                            |
       | resource.text.status                            | generated                                                       |
       | resource.name.text                              | PROTIME                                                        |
       | resource.name.coding.display                    | PROTIME                                                        |
       | resource.name.coding.display                    | PROTIME                                                         |
       | resource.name.coding.system                     | urn:oid:2.16.840.1.113883.4.642.2.58                            |
       | resource.status                                 | final                                                           |
       | resource.issued                                 | IS_FHIR_FORMATTED_DATE                                          |
       | resource.subject.reference                      | Patient/9E7A;227                                            |
       | resource.performer.display                      | ALBANY VA MEDICAL CENTER                                        |
       | resource.serviceCategory.coding.code            | CH                                                              |
       | resource.serviceCategory.coding.system          | http://hl7.org/fhir/v2/0074                                     |
       | resource.serviceCategory.coding.display         | Chemistry                                                       |
       | resource.serviceCategory.text                   | Chemistry                                                       |
       | resource.diagnosticDateTime                     | IS_FHIR_FORMATTED_DATE                                            |
       | resource.specimen.display                       | PLASMA                                                          |
       | resource.result.display                         | PROTIME                                                        |
       | resource.subject.reference     | Patient/9E7A;227                               |
       | resource.contained.type.text   | PLASMA                                             |
       | resource.extension.url         | http://vistacore.us/fhir/extensions/lab#groupName  |
       | resource.extension.valueString | urn:va:lab-category:CH                                    |

 @F138_3_Labs_chem_fhir @fhir @9E7A100184
 Scenario: Client can request lab (Chem/Hem) results in FHIR format
       Given a patient with "lab (Chem/Hem) results" in multiple VistAs
       #And a patient with pid "9E7A;100184" has been synced through the RDK API
       When the client requests lab "(Chem/Hem)" results for that patient "9E7A;100184"
       And the results contain lab "(Chem/Hem)" results
      | field                                       | value                                                   |
      | resource.contained.subject.reference         | Patient/9E7A;100184                                     |
      | resource.extension.url                       | http://vistacore.us/fhir/extensions/lab#groupName       |
      | resource.extension.valueString               | CH 0429 152                                             |
      | resource.contained.identifier.type.text      | facility-code                                           |
      | resource.contained.identifier.value          | 500                                                     |
      | resource.name.coding.display                 | GLUCOSE                                                 |
      | resource.contained.valueQuantity.value       | 321                                                     |
      | resource.contained.specimen.display          | SERUM                                                   |
      | resource.contained.referenceRange.high.value | 123                                                     |
      | resource.contained.referenceRange.high.units | mg/dL                                                   |
      | resource.contained.referenceRange.low.value  | 60                                                      |
      | resource.contained.referenceRange.low.units  | mg/dL                                                   |
      | resource.text.div                            | CONTAINS urn:va:accession:9E7A:100184:CH;6969569.838468 |

 @F138_4_Labs_chem_fhir @fhir @9E7A100184
 Scenario: Client can request lab (Chem/Hem) results in FHIR format
       Given a patient with "lab (Chem/Hem) results" in multiple VistAs
     #  And a patient with pid "9E7A;100184" has been synced through the RDK API
       When the client requests lab "(Chem/Hem)" results for that patient "9E7A;100184"
       Then a successful response is returned
       And the results contain lab "(Chem/Hem)" results
      | field                                       | value                                                   |
      | resource.contained.subject.reference         | Patient/9E7A;100184                                     |
      | resource.extension.url                       | http://vistacore.us/fhir/extensions/lab#groupName       |
      | resource.extension.valueString               | CH 0429 152                                             |
      | resource.contained.identifier.type.text      | facility-code                                           |
      | resource.contained.identifier.value          | 500                                                    |
      | resource.name.coding.display                 | GLUCOSE                                                 |
      | resource.contained.valueQuantity.value       | 321                                                     |
      | resource.contained.specimen.display          | SERUM                                                   |
      | resource.contained.referenceRange.high.value | 123                                                     |
      | resource.contained.referenceRange.high.units | mg/dL                                                   |
      | resource.contained.referenceRange.low.value  | 60                                                      |
      | resource.contained.referenceRange.low.units  | mg/dL                                                   |
      | resource.text.div                            | CONTAINS urn:va:accession:9E7A:100184:CH;6969569.838468 |

 @F138_5_Labs_ch_neg_fhir @fhir @5000000009V082878
 Scenario: Negative scenario.  Client can request lab (Chem/Hem) results in FHIR format
 Given a patient with "No lab results" in multiple VistAs
 When the client requests lab "(Chem/Hem)" results for that patient "9E7A;100125"
 Then a successful response is returned
 Then corresponding matching FHIR records totaling "2" are displayed

 @F138_6_Labs_chem_fhir @fhir @11016V630869 @DE974
 Scenario: Client can request lab (Chem/Hem) results in FHIR format
       Given a patient with "lab (Chem/Hem) results" in multiple VistAs
       #And a patient with pid "11016V630869" has been synced through the RDK API
       When the client requests "10" lab "(Chem/Hem)" results for that patient "9E7A;227" in FHIR format
       Then a successful response is returned
       And total returned resources are "10"
