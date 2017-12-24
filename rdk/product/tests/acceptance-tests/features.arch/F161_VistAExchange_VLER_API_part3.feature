@F161_VLER_FHIR @vxsync @patient
Feature: F161 - VistA Exchange - VLER API

#The purpose of this feature is to establish an interface between eHMP and VLER that allows Transition of Care (TOC) data to be passed from eHMP to VLER. VLER calls the VPR API, creates the CCDA and successfully submits it to the ONC test harness and passes the test

@F161_3_fhir_vler_api @fhir @unstable @10104V248233
Scenario: For a patient a collection of data is made successfully
	Given a patient with "data" in multiple VistAs
	And a patient with pid "SITE;229" has been synced through the RDK API
	When the client requests data for the patient "SITE;229" in VPR format in encounter "urn:va:visit:SITE:229:1462"
	Then a successful response is returned
	Then in section "problems" the response contains 17 "problem"s
	Then in section "encounters" the response contains 0 "encounter"s
	Then in section "encounters" the response contains 0 "document"s
	Then in section "allergies" the response contains 5 "allergy"s
	Then in section "medications" the response contains 43 "medication"s
	Then in section "vitalsigns" the response contains 301 "vitalsign"s
	Then in section "procedures" the response contains 26 "procedure"s
	Then in section "immunizations" the response contains 3 "immunization"s
	Then in section "results" the response contains 1 "imaging"s
	Then in section "results" the response contains 350 "laboratory"s
	Then in section "results" the response contains 0 "document"s
	Then in section "assessment" the response contains 0 "encounter"s
	Then in section "planOfCare" the response contains 0 "encounter"s
	Then in section "planOfCare" the response contains 0 "procedure"s
	Then in section "planOfCare" the response contains 0 "imaging"s
	Then in section "planOfCare" the response contains 6 "order"s

@F161_4_fhir_vler_api @fhir @unstable @5123456789V027402
Scenario: Client can break the glass when requesting data in FHIR format for a sensitive patient
	Given a patient with "data" in multiple VistAs
	And a patient with pid "SITE;18" has been synced through the RDK API
	When the client requests data for that sensitive patient "SITE;18" in encounter "urn:va:visit:SITE:8:6472"
	Then a permanent redirect response is returned
	When the client breaks glass and repeats a request for data for that patient "SITE;18" in encounter "urn:va:visit:SITE:8:6472"
	Then a successful response is returned
	And the results contain
		| name               | value             |
		| header.patient.icn | 5123456789V027402 |

@F161_5_fhir_vler_api @fhir @unstable @10110V004877
Scenario: For a patient a collection of data is made successfully
	Given a patient with "data" in multiple VistAs
	And a patient with pid "SITE;8" has been synced through the RDK API
	When the client requests data for the patient "SITE;8" in VPR format in encounter "urn:va:visit:SITE:8:1845"
	Then a successful response is returned
	Then in section "planOfCare" the response contains 14 "encounter"s
		And the results contain
		#Assessment
		| name                                     | value                                         |
		| planOfCare.encounter.current             | false                                         |
		| planOfCare.encounter.facilityCode        | 998                                           |
		| planOfCare.encounter.facilityName        | ABILENE (CAA)                                 |
		| planOfCare.encounter.typeCode            | 9                                             |
		| planOfCare.encounter.patientClassName    | Inpatient                                     |
		| planOfCare.encounter.dateTime            | 200004061500                                  |
		| planOfCare.encounter.stopCodeName        | PRIMARY CARE/MEDICINE                         |
		| planOfCare.encounter.appointmentStatus   | NO ACTION TAKEN                                     |
		| planOfCare.encounter.locationUid         | urn:va:location:SITE:32                       |
		| planOfCare.encounter.locationName        | PRIMARY CARE                                  |
		| planOfCare.encounter.shortLocationName   | PCM                                           |
		| planOfCare.encounter.locationDisplayName | Primary Care                                  |
		| planOfCare.encounter.kind                | Visit                                         |
		| planOfCare.encounter.uid                 | urn:va:appointment:SITE:8:A;3000406.15;32     |
		| planOfCare.encounter.summary             | PRIMARY CARE/MEDICINE                         |
		| planOfCare.encounter.pid                 | SITE;8                                        |
		| planOfCare.encounter.localId             | A;3000406.15;32                               |
		| planOfCare.encounter.typeName            | REGULAR                                       |
		| planOfCare.encounter.typeDisplayName     | Regular                                       |
		| planOfCare.encounter.patientClassCode    | urn:va:patient-class:IMP                      |
		| planOfCare.encounter.categoryCode        | urn:va:encounter-category:OV                  |
		| planOfCare.encounter.categoryName        | Outpatient Visit                              |
		| planOfCare.encounter.checkOut            | 200203071334                                  |
		| planOfCare.encounter.stopCodeUid         | urn:va:stop-code:323                          |
		Then in section "planOfCare" the response contains 50 "order"s
		And the results contain
		#Assessment
		| name                                       | value                                                 |
		| planOfCare.order.facilityCode              | 998                                                   |
		| planOfCare.order.facilityName              | ABILENE (CAA)                                         |
		| planOfCare.order.name                      | CONTAINS KNEE 2 VIEWS                                 |
		| planOfCare.order.oiName                    | CONTAINS KNEE 2 VIEWS                                 |
		| planOfCare.order.oiPackageRef              | 154;99RAP                                             |
		| planOfCare.order.content                   | CONTAINS KNEE 2 VIEWS LEFT                            |
		| planOfCare.order.start                     | 199912150800                                          |
		| planOfCare.order.displayGroup              | RAD                                                   |
		| planOfCare.order.statusName                | ACTIVE                                                |
		| planOfCare.order.providerDisplayName       | Provider,Twohundredninetyseven                        |
		| planOfCare.order.service                   | RA                                                    |
		| planOfCare.order.kind                      | Radiology                                             |
		| planOfCare.order.uid                       | urn:va:order:SITE:8:11077                             |
		| planOfCare.order.summary                   | CONTAINS KNEE 2 VIEWS LEFT                            |
		| planOfCare.order.pid                       | SITE;8                                                |
		| planOfCare.order.localId                   | 11077                                                 |
		| planOfCare.order.locationName              | 5 WEST PSYCH                                          |
		| planOfCare.order.oiCode                    | urn:va:oi:2748                                        |
		| planOfCare.order.entered                   | 199912151008                                          |
		| planOfCare.order.statusCode                | urn:va:order-status:actv                              |
		| planOfCare.order.statusVuid                | urn:va:vuid:4500659                                   |
		| planOfCare.order.providerUid               | urn:va:user:SITE:11712                                |
		| planOfCare.order.providerName              | PROVIDER,TWOHUNDREDNINETYSEVEN                        |
		| planOfCare.order.locationUid               | urn:va:location:SITE:66                               |
		| planOfCare.order.results.uid               | urn:va:image:SITE:8:7008784.8989-1                    |
		| planOfCare.order.clinicians.name           | PROVIDER,TWOHUNDREDNINETYSEVEN                        |
		| planOfCare.order.clinicians.role           | S                                                     |
		| planOfCare.order.clinicians.signedDateTime | 199912151008                                          |
		| planOfCare.order.clinicians.uid            | urn:va:user:SITE:11712                                |
		Then in section "results" the response contains 2 "document"s
		And the results contain
		#Resutls - imaging
		| name                                 | value                                 |
		| results.document.authorUid           | urn:va:user:SITE:11712                |
		| results.document.authorDisplayName   | Provider,Twohundredninetyseven        |
		| results.document.signerUid           | urn:va:user:SITE:11597                |
		| results.document.signerDisplayName   | Provider,Prf                          |
		| results.document.signedDateTime      | 199901051157                          |
		| results.document.kind                | Radiology Report                      |
		| results.document.isInterdisciplinary | false                                 |
		| results.document.facilityCode        | 998                                   |
		| results.document.facilityName        | ABILENE (CAA)                         |
		| results.document.referenceDateTime   | 199812091138                          |
		| results.document.documentTypeCode    | RA                                    |
		| results.document.documentTypeName    | Radiology Report                      |
		| results.document.documentClass       | RADIOLOGY REPORTS                     |
		| results.document.localTitle          | VAS-CAROTID DUPLEX SCAN               |
		| results.document.nationalTitle.name  | RADIOLOGY REPORT                      |
		| results.document.nationalTitle.vuid  | urn:va:vuid:4695068                   |
		| results.document.uid                 | urn:va:document:SITE:8:7018790.8861-1 |
		| results.document.summary             | VAS-CAROTID DUPLEX SCAN               |
		| results.document.pid                 | SITE;8                                |
		| results.document.author              | PROVIDER,TWOHUNDREDNINETYSEVEN        |
		| results.document.signer              | PROVIDER,PRF                          |

