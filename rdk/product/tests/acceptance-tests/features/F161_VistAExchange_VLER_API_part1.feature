@F161_VLER_FHIR @vxsync @patient
Feature: F161 - VistA Exchange - VLER API

#The purpose of this feature is to establish an interface between eHMP and VLER that allows Transition of Care (TOC) data to be passed from eHMP to VLER. VLER calls the VPR API, creates the CCDA and successfully submits it to the ONC test harness and passes the test

@F161_1_fhir_vler_api @unstable @fhir @10107V395912
Scenario: For a patient a collection of data is made successfully
	Given a patient with "data" in multiple VistAs
	And a patient with pid "9E7A;253" has been synced through the RDK API
	When the client requests data for the patient "9E7A;253" in VPR format in encounter "urn:va:visit:9E7A:253:6491"
	Then a successful response is returned
	And the results contain
		#Header
		| name                                             | value                                        |
		| header.patient.address.city                      | Any Town                                     |
		| header.patient.address.line1                     | Any Street                                   |
		| header.patient.address.state                     | WV                                           |
		| header.patient.address.use                       | H                                            |
		| header.patient.address.zip                       | 99998                                   |
		| header.patient.alias.fullName                    | P7                                           |
		| header.patient.birthDate                         | 19350407                                     |
		| header.patient.briefId                           | S0007                                        |
		| header.patient.contact.name                      | VETERAN,BROTHER                              |
		| header.patient.contact.summary                   | VETERAN,BROTHER                              |
		| header.patient.contact.typeCode                  | urn:va:pat-contact:NOK                       |
		| header.patient.contact.typeName                  | Next of Kin                                  |
		| header.patient.cwadf                             | CAD                                          |
		| header.patient.disability.disPercent             | 10                                           |
		| header.patient.disability.name                   | HEMORRHOIDS                                  |
		| header.patient.disability.serviceConnected       | true                                         |
		| header.patient.disability.summary                | PatientDisability{uid=''}                |
		| header.patient.disability.disPercent             | 0                                            |
		| header.patient.disability.name                   | INGUINAL HERNIA                              |
		| header.patient.disability.serviceConnected       | true                                         |
		| header.patient.disability.summary                | PatientDisability{uid=''}                |
		| header.patient.disability.disPercent             | 20                                           |
		| header.patient.disability.name                   | GASTRIC ULCER                                |
		| header.patient.disability.serviceConnected       | true                                         |
		| header.patient.disability.summary                | PatientDisability{uid=''}                |
		| header.patient.disability.disPercent             | 10                                           |
		| header.patient.disability.name                   | VITAMIN DEFICIENCY                           |
		| header.patient.disability.serviceConnected       | true                                         |
		| header.patient.disability.summary                | PatientDisability{uid=''}                |
		| header.patient.displayName                       | Seven,Patient                                |
		#| header.patient.domainUpdated                     | CONTAINS cpts, syncStatuss, povs, educations |
		| header.patient.exposure.name                     | Unknown                                      |
		| header.patient.exposure.uid                      | urn:va:head-neck-cancer:U                    |
		| header.patient.exposure.name                     | No                                           |
		#| header.patient.exposure.uid                      | urn:va:sw-asia:N                             |
		| header.patient.exposure.name                     | No                                           |
		| header.patient.exposure.uid                      | urn:va:ionizing-radiation:N                  |
		| header.patient.exposure.name                     | Unknown                                      |
		| header.patient.exposure.uid                      | urn:va:mst:U                                 |
		| header.patient.exposure.name                     | No                                           |
		| header.patient.exposure.uid                      | urn:va:combat-vet:N                          |
		| header.patient.exposure.name                     | No                                           |
		| header.patient.exposure.uid                      | urn:va:agent-orange:N                        |
		| header.patient.facility.code                     | 987                                          |
		| header.patient.facility.homeSite                 | false                                        |
		| header.patient.facility.latestDate               | 20010101                                     |
		| header.patient.facility.name                     | ASPEN (CMM)                                  |
		| header.patient.facility.summary                  | ASPEN (CMM)                                  |
		| header.patient.facility.code                     | 988                                          |
		| header.patient.facility.name                     | BOCA RATON (CEE)                             |
		| header.patient.facility.code                     | 989                                          |
		| header.patient.facility.name                     | PARK CITY  (CII)                             |
		| header.patient.facility.code                     | 990                                          |
		| header.patient.facility.name                     | SOUTH BEND (CKK)                             |
		| header.patient.facility.code                     | 991                                          |
		| header.patient.facility.name                     | JAMESTOWN (CJJ)                              |
		| header.patient.facility.code                     | 992                                          |
		| header.patient.facility.name                     | LAREDO (CHH)                                 |
		| header.patient.facility.code                     | 993                                          |
		| header.patient.facility.name                     | YUMA  (CGG)                                  |
		| header.patient.facility.code                     | 994                                          |
		| header.patient.facility.name                     | LUBBOCK (CDD)                                |
		| header.patient.facility.code                     | 995                                          |
		| header.patient.facility.name                     | CENTRAL CITY (CCC)                           |
		| header.patient.facility.code                     | 996                                          |
		| header.patient.facility.name                     | CHAMPAIGN (CFF)                              |
		| header.patient.facility.code                     | 997                                          |
		| header.patient.facility.name                     | CHARLESTON (CBB)                             |
		| header.patient.facility.code                     | 998                                          |
		| header.patient.facility.name                     | ABILENE (CAA)                                |
		| header.patient.facility.code                     | 999                                          |
		| header.patient.facility.name                     | LYNCHBURG (CLL)                              |
		| header.patient.familyName                        | SEVEN                                        |
		| header.patient.fullName                          | SEVEN,PATIENT                                |
		| header.patient.genderCode                        | urn:va:pat-gender:M                          |
		| header.patient.genderName                        | Male                                         |
		| header.patient.givenNames                        | PATIENT                                      |
		| header.patient.homeFacility.code                 | 998                                          |
		| header.patient.homeFacility.homeSite             | true                                         |
		| header.patient.homeFacility.latestDate           | 20010101                                     |
		| header.patient.homeFacility.name                 | ABILENE (CAA)                                |
		| header.patient.homeFacility.summary              | ABILENE (CAA)                                |
		| header.patient.icn                               | 10107V395912                                 |
		| header.patient.localId                           | 253                                          |
		| header.patient.lrdfn                             | 394                                          |
		| header.patient.maritalStatusCode                 | urn:va:pat-maritalStatus:U                   |
		| header.patient.maritalStatusName                 | Unknown                                      |
		| header.patient.meanStatus                        | NO LONGER REQUIRED                           |
		| header.patient.pid                               | 9E7A;253                                     |
		| header.patient.religionCode                      | urn:va:pat-religion:29                       |
		| header.patient.religionName                      | UNKNOWN/NO PREFERENCE                        |
		| header.patient.scPercent                         | 0                                            |
		| header.patient.sensitive                         | false                                        |
		| header.patient.serviceConnected                  | true                                         |
		| header.patient.ssn                               | 666000007                                    |
		# Patient summmary is not being used, comment it out.
		#| header.patient.summary                           | CONTAINS 9E7A;253                            |
		#| header.patient.syncErrorCount                    | 0                                            |
		| header.patient.teamInfo.associateProvider.name   | unassigned                                   |
		| header.patient.teamInfo.attendingProvider.name   | unassigned                                   |
		| header.patient.teamInfo.inpatientProvider.name   | unassigned                                   |
		| header.patient.teamInfo.mhCoordinator.name       | unassigned                                   |
		| header.patient.teamInfo.mhCoordinator.mhPosition | unassigned                                   |
		| header.patient.teamInfo.mhCoordinator.mhTeam     | unassigned                                   |
		| header.patient.teamInfo.primaryProvider.name     | unassigned                                   |
		| header.patient.teamInfo.team.name                | unassigned                                   |
		| header.patient.teamInfo.text                     | CONTAINS Assigned                            |
		| header.patient.telecom.use                       | WP                                           |
		| header.patient.telecom.value                     | (222)555-7720                                |
		| header.patient.telecom.use                       | H                                            |
		| header.patient.telecom.value                     | (222)555-8235                                |
		| header.patient.uid                               | urn:va:patient:9E7A:253:253                  |
		| header.patient.veteran                           | true                                         |
		#Problems
		Then in section "problems" the response contains 11 "problem"s
		And the results contain
		| name                                 | value                                         |
		| problems.problem.facilityCode        | 500                                           |
		| problems.problem.facilityName        | CAMP MASTER                                   |
		| problems.problem.locationName        | PRIMARY CARE                                  |
		| problems.problem.providerName        | VEHU,SEVEN                                    |
		| problems.problem.problemText         | CONTAINS Diabetes Mellitus Type II            |
		| problems.problem.icdCode             | urn:icd:250.00                                |
		| problems.problem.icdName             | DIABETES MELLI W/O COMP TYP II                |
		| problems.problem.acuityCode          | urn:va:prob-acuity:c                          |
		| problems.problem.acuityName          | chronic                                       |
		| problems.problem.removed             | false                                         |
		| problems.problem.entered             | 20000508                                      |
		| problems.problem.updated             | 20040331                                      |
		| problems.problem.onset               | 20000404                                      |
		| problems.problem.kind                | Problem                                       |
		| problems.problem.icdGroup            | 250                                           |
		| problems.problem.uid                 | urn:va:problem:9E7A:253:182                   |
		| problems.problem.summary             | CONTAINS unspecified (ICD-9-CM 250.00)        |
		| problems.problem.pid                 | 9E7A;253                                      |
		| problems.problem.localId             | 182                                           |
		| problems.problem.locationDisplayName | Primary Care                                  |
		| problems.problem.providerDisplayName | Vehu,Seven                                    |
		| problems.problem.statusCode          | urn:sct:55561003                              |
		| problems.problem.statusName          | ACTIVE                                        |
		| problems.problem.statusDisplayName   | Active                                        |
		| problems.problem.unverified          | false                                         |
		| problems.problem.serviceConnected    | false                                         |
		| problems.problem.providerUid         | urn:va:user:9E7A:20008                        |
		| problems.problem.locationUid         | urn:va:location:9E7A:32                       |
		And the results contain
		#Problems
		| problems.problem.facilityCode        | 500                                           |
		| problems.problem.facilityName        | CAMP BEE                                      |
		| problems.problem.service             | MEDICAL                                       |
		| problems.problem.providerName        | VEHU,ONEHUNDRED                               |
		| problems.problem.problemText         | Hypertension (ICD-9-CM 401.9)                 |
		| problems.problem.icdCode             | urn:icd:401.9                                 |
		| problems.problem.icdName             | HYPERTENSION NOS                              |
		| problems.problem.acuityCode          | urn:va:prob-acuity:c                          |
		| problems.problem.acuityName          | chronic                                       |
		| problems.problem.entered             | 20070410                                      |
		| problems.problem.updated             | 20070410                                      |
		| problems.problem.onset               | 20050407                                      |
		| problems.problem.kind                | Problem                                       |
		| problems.problem.icdGroup            | 401                                           |
		| problems.problem.uid                 | urn:va:problem:C877:253:663                   |
		| problems.problem.summary             | Hypertension (ICD-9-CM 401.9)                 |
		| problems.problem.pid                 | C877;253                                      |
		| problems.problem.localId             | 663                                           |
		| problems.problem.providerDisplayName | Vehu,Onehundred                               |
		| problems.problem.statusCode          | urn:sct:55561003                              |
		| problems.problem.statusName          | ACTIVE                                        |
		| problems.problem.statusDisplayName   | Active                                        |
		| problems.problem.serviceConnected    | false                                         |
		| problems.problem.codes.code          | 59621000                                      |
		| problems.problem.codes.system        | http://snomed.info/sct                        |
		| problems.problem.codes.display       | Essential hypertension (disorder)             |
		| problems.problem.providerUid         | urn:va:user:C877:10000000031                  |
		Then in section "encounters" the response contains 25 "encounter"s
		And the results contain
		#Encounter
		| name                                     | value                                        |
		| encounters.encounter.current             | false                                        |
		| encounters.encounter.facilityCode        | 500                                          |
		| encounters.encounter.facilityName        | CAMP MASTER                                  |
		| encounters.encounter.patientClassName    | Ambulatory                                   |
		| encounters.encounter.dateTime            | 200807170800                                 |
		| encounters.encounter.service             | MEDICINE                                     |
		| encounters.encounter.stopCodeName        | GENERAL INTERNAL MEDICINE                    |
		| encounters.encounter.locationUid         | urn:va:location:9E7A:23                      |
		| encounters.encounter.locationName        | GENERAL MEDICINE                             |
		| encounters.encounter.shortLocationName   | GM                                           |
		| encounters.encounter.locationDisplayName | General Medicine                             |
		| encounters.encounter.kind                | Visit                                        |
		| encounters.encounter.uid                 | urn:va:visit:9E7A:253:6491                   |
		| encounters.encounter.summary             | GENERAL INTERNAL MEDICINE                    |
		| encounters.encounter.pid                 | 9E7A;253                                     |
		| encounters.encounter.localId             | 6491                                         |
		| encounters.encounter.typeName            | GENERAL MEDICINE VISIT                       |
		| encounters.encounter.typeDisplayName     | General Medicine Visit                       |
		| encounters.encounter.patientClassCode    | urn:va:patient-class:AMB                     |
		| encounters.encounter.categoryCode        | urn:va:encounter-category:OV                 |
		| encounters.encounter.categoryName        | Outpatient Visit                             |
		| encounters.encounter.stopCodeUid         | urn:va:stop-code:301                         |
		And the results contain
		#Encounter
		| name                                     | value                                        |
		| encounters.encounter.current             | false                                        |
		| encounters.encounter.facilityCode        | 500                                          |
		| encounters.encounter.facilityName        | CAMP BEE                                     |
		| encounters.encounter.patientClassName    | Ambulatory                                   |
		| encounters.encounter.dateTime            | 200807160800                                 |
		| encounters.encounter.service             | MEDICINE                                     |
		| encounters.encounter.stopCodeName        | GENERAL INTERNAL MEDICINE                    |
		| encounters.encounter.locationUid         | urn:va:location:9E7A:23                      |
		| encounters.encounter.locationName        | GENERAL MEDICINE                             |
		| encounters.encounter.shortLocationName   | GM                                           |
		| encounters.encounter.locationDisplayName | General Medicine                             |
		| encounters.encounter.locationOos         | false                                        |
		| encounters.encounter.kind                | Visit                                        |
		| encounters.encounter.uid                 | urn:va:visit:9E7A:253:6390                   |
		| encounters.encounter.summary             | GENERAL INTERNAL MEDICINE                    |
		| encounters.encounter.pid                 | 9E7A;253                                     |
		| encounters.encounter.localId             | 6390                                         |
		| encounters.encounter.typeName            | GENERAL MEDICINE VISIT                       |
		| encounters.encounter.typeDisplayName     | General Medicine Visit                       |
		| encounters.encounter.patientClassCode    | urn:va:patient-class:AMB                     |
		| encounters.encounter.categoryCode        | urn:va:encounter-category:OV                 |
		| encounters.encounter.categoryName        | Outpatient Visit                             |
		| encounters.encounter.encounterType       | P                                            |
		| encounters.encounter.stopCodeUid         | urn:va:stop-code:301                         |
		Then in section "encounters" the response contains 2 "document"s
		And the results contain
		#Encounter-document
		| name                                     | value                                         |
		| encounters.document.authorUid            | urn:va:user:9E7A:20012                        |
		| encounters.document.authorDisplayName    | Vehu,Ten                                      |
		| encounters.document.attendingUid         | urn:va:user:9E7A:20012                        |
		| encounters.document.attendingDisplayName | Vehu,Ten                                      |
		| encounters.document.signerUid            | urn:va:user:9E7A:20012                        |
		| encounters.document.signerDisplayName    | Vehu,Ten                                      |
		| encounters.document.signedDateTime       | 20070529123849                                |
		| encounters.document.urgency              | routine                                       |
		| encounters.document.kind                 | Discharge Summary                             |
		| encounters.document.documentDefUid       | urn:va:doc-def:9E7A:1                         |
		| encounters.document.isInterdisciplinary  | false                                         |
		| encounters.document.facilityCode         | 998                                           |
		| encounters.document.facilityName         | ABILENE (CAA)                                 |
		| encounters.document.referenceDateTime    | 20040325191658                                |
		| encounters.document.documentTypeCode     | DS                                            |
		| encounters.document.documentTypeName     | Discharge Summary                             |
		| encounters.document.documentClass        | DISCHARGE SUMMARY                             |
		| encounters.document.localTitle           | Discharge Summary                             |
		# this is deprecated.
		#| encounters.document.documentDefUidVuid   | urn:va:vuid:4693715                           |
		| encounters.document.uid                  | urn:va:document:9E7A:253:3959                 |
		| encounters.document.summary              | Discharge Summary                             |
		| encounters.document.pid                  | 9E7A;253                                      |
		| encounters.document.author               | VEHU,TEN                                      |
		| encounters.document.attending            | VEHU,TEN                                      |
		| encounters.document.signer               | VEHU,TEN                                      |
		| encounters.document.entered              | 20070529123826                                |
		| encounters.document.localId              | 3959                                          |
		| encounters.document.encounterUid         | urn:va:visit:9E7A:253:3312                    |
		| encounters.document.encounterName        | 7A GEN MED Mar 25, 2004                       |
		| encounters.document.status               | COMPLETED                                     |
		| encounters.document.statusDisplayName    | Completed                                     |
		Then in section "allergies" the response contains 5 "allergy"s
		And the results contain
		#Allergies
		| name                                  | value                                         |
		| allergies.allergy.facilityCode        | 500                                           |
		| allergies.allergy.facilityName        | CAMP MASTER                                   |
		| allergies.allergy.entered             | 200503172006                                  |
		| allergies.allergy.verified            | 20050317200629                                |
		| allergies.allergy.kind                | Allergy/Adverse Reaction                      |
		| allergies.allergy.originatorName      | VEHU,SEVEN                                    |
		| allergies.allergy.verifierName        | <auto-verified>                               |
		| allergies.allergy.mechanism           | PHARMACOLOGIC                                 |
		| allergies.allergy.uid                 | urn:va:allergy:9E7A:253:750                   |
		| allergies.allergy.summary             | PENICILLIN                                    |
		| allergies.allergy.pid                 | 9E7A;253                                      |
		| allergies.allergy.localId             | 750                                           |
		| allergies.allergy.historical          | true                                          |
		| allergies.allergy.reference           | 125;GMRD(120.82,                              |
		| allergies.allergy.products.name       | PENICILLIN                                    |
		| allergies.allergy.products.vuid       | urn:va:vuid:                                  |
		| allergies.allergy.products.summary    | AllergyProduct{uid=''}                    |
		| allergies.allergy.reactions.name      | ITCHING,WATERING EYES                         |
		| allergies.allergy.reactions.vuid      | urn:va:vuid:                                  |
		| allergies.allergy.reactions.summary   | AllergyReaction{uid=''}                   |
		| allergies.allergy.drugClasses.code    | AM114                                         |
		| allergies.allergy.drugClasses.name    | PENICILLINS AND BETA-LACTAM ANTIMICROBIALS    |
		| allergies.allergy.drugClasses.summary | AllergyDrugClass{uid=''}                  |
		| allergies.allergy.typeName            | DRUG                                          |
		And the results contain
		#Allergies
		| name                                  | value                                         |
		| allergies.allergy.facilityCode        | 500                                           |
		| allergies.allergy.facilityName        | CAMP BEE                                      |
		| allergies.allergy.entered             | 200503172006                                  |
		| allergies.allergy.verified            | 20050317200629                                |
		| allergies.allergy.kind                | Allergy/Adverse Reaction                      |
		| allergies.allergy.originatorName      | VEHU,SEVEN                                    |
		| allergies.allergy.verifierName        | <auto-verified>                               |
		| allergies.allergy.mechanism           | PHARMACOLOGIC                                 |
		| allergies.allergy.uid                 | urn:va:allergy:C877:253:750                   |
		| allergies.allergy.summary             | PENICILLIN                                    |
		| allergies.allergy.pid                 | C877;253                                      |
		| allergies.allergy.localId             | 750                                           |
		| allergies.allergy.historical          | true                                          |
		| allergies.allergy.reference           | 125;GMRD(120.82,                              |
		| allergies.allergy.products.name       | PENICILLIN                                    |
		| allergies.allergy.products.vuid       | urn:va:vuid:                                  |
		| allergies.allergy.products.summary    | AllergyProduct{uid=''}                    |
		| allergies.allergy.reactions.name      | ITCHING,WATERING EYES                         |
		| allergies.allergy.reactions.vuid      | urn:va:vuid:                                  |
		| allergies.allergy.reactions.summary   | AllergyReaction{uid=''}                   |
		| allergies.allergy.drugClasses.code    | AM114                                         |
		| allergies.allergy.drugClasses.name    | PENICILLINS AND BETA-LACTAM ANTIMICROBIALS    |
		| allergies.allergy.drugClasses.summary | AllergyDrugClass{uid=''}                  |
		| allergies.allergy.typeName            | DRUG                                          |
		Then in section "medications" the response contains 13 "medication"s
		And the results contain
		#Medication
		| name                                   | value                                 |
		| medications.medication.facilityCode    | 500                                   |
		| medications.medication.facilityName    | CAMP MASTER                           |
		| medications.medication.overallStart    | 20100227                              |
		| medications.medication.overallStop     | 20110228                              |
		| medications.medication.vaType          | O                                     |
		| medications.medication.supply          | false                                 |
		| medications.medication.lastFilled      | 20100227                              |
		| medications.medication.qualifiedName   | METOPROLOL TARTRATE TAB               |
		| medications.medication.units           | MG                                    |
		| medications.medication.kind            | Medication, Outpatient                |
		| medications.medication.uid             | urn:va:med:9E7A:253:27957             |
		| medications.medication.summary         | CONTAINS METOPROLOL TARTRATE 50MG TAB |
		| medications.medication.pid             | 9E7A;253                              |
		| medications.medication.localId         | 403951;O                              |
		| medications.medication.productFormName | TAB                                   |
		| medications.medication.sig             | TAKE ONE TABLET BY MOUTH TWICE A DAY  |
		| medications.medication.stopped         | 20110228                              |
		| medications.medication.medStatus       | urn:sct:392521001                     |
		| medications.medication.medStatusName   | historical                            |
		| medications.medication.medType         | urn:sct:73639000                      |
		| medications.medication.vaStatus        | EXPIRED                               |
		| medications.medication.IMO             | false                                 |
		Then in section "vitalsigns" the response contains 289 "vitalsign"s
		And the results contain
		#VitalSigns
		| name                                          | value                                         |
		| vitalsigns.vitalsign.facilityCode             | 500                                           |
		| vitalsigns.vitalsign.facilityName             | CAMP MASTER                                   |
		| vitalsigns.vitalsign.observed                 | 201003050900                                  |
		| vitalsigns.vitalsign.resulted                 | 20100305105350                                |
		| vitalsigns.vitalsign.locationName             | GENERAL MEDICINE                              |
		| vitalsigns.vitalsign.kind                     | Vital Sign                                    |
		| vitalsigns.vitalsign.displayName              | BP                                            |
		| vitalsigns.vitalsign.result                   | 134/81                                        |
		| vitalsigns.vitalsign.units                    | mm[Hg]                                        |
		| vitalsigns.vitalsign.low                      | 100/60                                        |
		| vitalsigns.vitalsign.high                     | 210/110                                       |
		| vitalsigns.vitalsign.patientGeneratedDataFlag | false                                         |
		| vitalsigns.vitalsign.qualifiedName            | BLOOD PRESSURE                                |
		| vitalsigns.vitalsign.uid                      | urn:va:vital:9E7A:253:23557                   |
		| vitalsigns.vitalsign.summary                  | BLOOD PRESSURE 134/81 mm[Hg]                  |
		| vitalsigns.vitalsign.pid                      | 9E7A;253                                      |
		| vitalsigns.vitalsign.localId                  | 23557                                         |
		| vitalsigns.vitalsign.typeCode                 | urn:va:vuid:4500634                           |
		| vitalsigns.vitalsign.typeName                 | BLOOD PRESSURE                                |
		| vitalsigns.vitalsign.codes.code               | 55284-4                                       |
		| vitalsigns.vitalsign.codes.system             | http://loinc.org                              |
		| vitalsigns.vitalsign.codes.display            | Blood pressure systolic and diastolic         |
		| vitalsigns.vitalsign.locationUid              | urn:va:location:9E7A:23                       |
		Then in section "procedures" the response contains 100 "procedure"s
		And the results contain
		#Procedures
		| name                                               | value                                                 |
		| procedures.procedure.kind                          | Surgery                                               |
		| procedures.procedure.facilityCode                  | 500                                                   |
		| procedures.procedure.facilityName                  | CAMP MASTER                                           |
		| procedures.procedure.statusName                    | COMPLETED                                             |
		| procedures.procedure.uid                           | urn:va:surgery:9E7A:253:10013                         |
		| procedures.procedure.summary                       | LEFT INGUINAL HERNIA REPAIR WITH MESH                 |
		| procedures.procedure.pid                           | 9E7A;253                                              |
		| procedures.procedure.localId                       | 10013                                                 |
		| procedures.procedure.typeName                      | LEFT INGUINAL HERNIA REPAIR WITH MESH                 |
		| procedures.procedure.dateTime                      | 200612080730                                          |
		| procedures.procedure.category                      | SR                                                    |
		| procedures.procedure.providers.providerName        | PROVIDER,ONE                                          |
		| procedures.procedure.providers.providerDisplayName | Provider,One                                          |
		#| procedures.procedure.providers.summary             | ProcedureProvider{uid=''}                         |
		| procedures.procedure.providers.providerUid         | urn:va:user:9E7A:983                                  |
		| procedures.procedure.providerName                  | PROVIDER,ONE                                          |
		| procedures.procedure.providerDisplayName           | Provider,One                                          |
		| procedures.procedure.results.localTitle            | OPERATION REPORT                                      |
		| procedures.procedure.results.uid                   | urn:va:document:9E7A:253:3560                         |
		| procedures.procedure.results.summary               | ProcedureResult{uid='urn:va:document:9E7A:253:3560'}  |
		| procedures.procedure.results.localTitle            | NURSE INTRAOPERATIVE REPORT                           |
		| procedures.procedure.results.uid                   | urn:va:document:9E7A:253:3523                         |
		| procedures.procedure.results.summary               | ProcedureResult{uid='urn:va:document:9E7A:253:3523'}  |
		| procedures.procedure.results.localTitle            | ANESTHESIA REPORT                                     |
		| procedures.procedure.results.uid                   | urn:va:document:9E7A:253:3522                         |
		| procedures.procedure.results.summary               | ProcedureResult{uid='urn:va:document:9E7A:253:3522'}  |
		Then in section "immunizations" the response contains 3 "immunization"s
		And the results contain
		#Immunization
		| name                                            | value                                          |
		| immunizations.immunization.facilityCode         | 888                                            |
		| immunizations.immunization.facilityName         | FT. LOGAN                                      |
		#| immunizations.immunization.administeredDateTime | 200004061200                                   |
		| immunizations.immunization.cptCode              | urn:cpt:90732                                  |
		| immunizations.immunization.cptName              | PNEUMOCOCCAL VACCINE                           |
		| immunizations.immunization.performerUid         | urn:va:user:9E7A:11623                         |
		| immunizations.immunization.encounterUid         | urn:va:visit:9E7A:253:2035                     |
		| immunizations.immunization.kind                 | Immunization                                   |
		| immunizations.immunization.uid                  | urn:va:immunization:9E7A:253:60                |
		| immunizations.immunization.summary              | PNEUMOCOCCAL, UNSPECIFIED FORMULATION          |
		| immunizations.immunization.pid                  | 9E7A;253                                       |
		| immunizations.immunization.localId              | 60                                             |
		| immunizations.immunization.name                 | PNEUMOCOCCAL, UNSPECIFIED FORMULATION          |
		| immunizations.immunization.contraindicated      | false                                          |
		| immunizations.immunization.seriesName           | BOOSTER                                        |
		| immunizations.immunization.codes.code           | 33                                             |
		| immunizations.immunization.codes.system         | urn:oid:2.16.840.1.113883.12.292               |
		| immunizations.immunization.codes.display        | pneumococcal polysaccharide vaccine, 23 valent |
		| immunizations.immunization.performerName        | STUDENT,SEVEN                                  |
		| immunizations.immunization.locationUid          | urn:va:location:9E7A:32                        |
		| immunizations.immunization.seriesCode           | urn:va:series:9E7A:253:BOOSTER                 |
		| immunizations.immunization.locationName         | PRIMARY CARE                                   |
		| immunizations.immunization.encounterName        | PRIMARY CARE Apr 06, 2000                      |
		Then in section "results" the response contains 210 "laboratory"s
		And the results contain
		#Immunization
		| name                               | value                                                                      |
		| results.laboratory.facilityCode    | 500                                                                        |
		| results.laboratory.facilityName    | CAMP MASTER                                                                |
		| results.laboratory.groupName       | CH 0323 2445                                                               |
		| results.laboratory.groupUid        | urn:va:accession:9E7A:253:CH;6899693.879999                                |
		| results.laboratory.categoryCode    | urn:va:lab-category:CH                                                     |
		| results.laboratory.categoryName    | Laboratory                                                                 |
		| results.laboratory.observed        | 201003051200                                                               |
		| results.laboratory.resulted        | 201003231255                                                               |
		| results.laboratory.specimen        | SERUM                                                                      |
		| results.laboratory.comment         | CONTAINS Ordering Provider: Seventeen Labtech Report Released Date/Time: M |
		| results.laboratory.typeCode        | urn:va:ien:60:244:72                                                       |
		| results.laboratory.displayName     | HDL                                                                        |
		| results.laboratory.result          | 58                                                                         |
		| results.laboratory.units           | MG/DL                                                                      |
		| results.laboratory.low             | 40                                                                         |
		| results.laboratory.high            | 60                                                                         |
		| results.laboratory.kind            | Laboratory                                                                 |
		| results.laboratory.resultNumber    | 58                                                                         |
		| results.laboratory.abnormal        | false                                                                      |
		| results.laboratory.micro           | false                                                                      |
		| results.laboratory.qualifiedName   | HDL (SERUM)                                                                |
		| results.laboratory.uid             | urn:va:lab:9E7A:253:CH;6899693.879999;80                                   |
		| results.laboratory.summary         | HDL (SERUM) 58 MG/DL                                                       |
		| results.laboratory.pid             | 9E7A;253                                                                   |
		| results.laboratory.localId         | CH;6899693.879999;80                                                       |
		| results.laboratory.typeName        | HDL                                                                        |
		| results.laboratory.statusCode      | urn:va:lab-status:completed                                                |
		| results.laboratory.statusName      | completed                                                                  |
		| results.laboratory.displayOrder    | 3.9                                                                        |
		| results.laboratory.typeId          | 244                                                                        |
		Then in section "assessment" the response contains 25 "encounter"s
		And the results contain
		#assessment
		| name                                     | value                                         |
		| assessment.encounter.current             | false                                         |
		| assessment.encounter.facilityCode        | 500                                           |
		| assessment.encounter.facilityName        | CAMP MASTER                                   |
		| assessment.encounter.patientClassName    | Ambulatory                                    |
		| assessment.encounter.dateTime            | 200807170800                                  |
		| assessment.encounter.service             | MEDICINE                                      |
		| assessment.encounter.stopCodeName        | GENERAL INTERNAL MEDICINE                     |
		| assessment.encounter.locationUid         | urn:va:location:9E7A:23                       |
		| assessment.encounter.locationName        | GENERAL MEDICINE                              |
		| assessment.encounter.shortLocationName   | GM                                            |
		| assessment.encounter.locationDisplayName | General Medicine                              |
		| assessment.encounter.locationOos         | false                                         |
		| assessment.encounter.kind                | Visit                                         |
		| assessment.encounter.uid                 | urn:va:visit:9E7A:253:6491                    |
		| assessment.encounter.summary             | GENERAL INTERNAL MEDICINE                     |
		| assessment.encounter.pid                 | 9E7A;253                                      |
		| assessment.encounter.localId             | 6491                                          |
		| assessment.encounter.typeName            | GENERAL MEDICINE VISIT                        |
		| assessment.encounter.typeDisplayName     | General Medicine Visit                        |
		| assessment.encounter.patientClassCode    | urn:va:patient-class:AMB                      |
		| assessment.encounter.categoryCode        | urn:va:encounter-category:OV                  |
		| assessment.encounter.categoryName        | Outpatient Visit                              |
		| assessment.encounter.stopCodeUid         | urn:va:stop-code:301                          |
		| assessment.encounter.encounterType       | P                                             |
