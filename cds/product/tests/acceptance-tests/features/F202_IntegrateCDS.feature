# Team Europa

Feature: F202 - Integrate Clinical Decision Support

@F202-9_immunization @US8575 @F202-16
 Scenario: Client can request immunization in FHIR format
     Given a patient with "immunization" in multiple VistAs
     When the client requests immunization for the patient "9E7A;140" in FHIR format
     Then a successful response is returned
     Then FHIR date and time convert to Zulu format for Immunization
       
	And the results contain
        | field                                             | value                                 |
        | entry.resource.resourceType                       | Immunization                          |
        | entry.resource.text.status                        | generated                             |
        | entry.resource.text.div                           | <div>PNEUMOCOCCAL</div>             |
        | entry.resource.identifier.system                  | urn:oid:2.16.840.1.113883.6.233       |
        | entry.resource.identifier.value                   | urn:va:immunization:9E7A:140:1155       |
        | entry.resource.date                               | 2000-04-04T14:55:06Z                   |
        | entry.resource.vaccineType.coding.code            | 33                                    |
        | entry.resource.vaccineType.coding.display         | pneumococcal polysaccharide vaccine, 23 valent |
        | entry.resource.vaccineType.coding.system          | urn:oid:2.16.840.1.113883.12.292      |
        | entry.resource.vaccineType.coding.code            | urn:cpt:90732                         |
        | entry.resource.vaccineType.coding.display         | PNEUMOCOCCAL VACCINE                     |
        | entry.resource.patient.reference                  | Patient/9E7A;140                       |
        | entry.resource.wasNotGiven                        | false                                 |
        | entry.resource.reported                           | false                                 |
        # ------------ CHECKING ORGANIZATION CONTAINED RESOURCE ----------------------
        | entry.resource.contained.resourceType             | Organization                          |
        | entry.resource.contained.identifier.system        | urn:oid:2.16.840.1.113883.6.233       |
        | entry.resource.contained.identifier.value         | 561                                   |
        | entry.resource.contained.name                     | New Jersey HCS                              |
        | entry.resource.contained.text.status              | generated                             |
        | entry.resource.contained.text.div                 | <div>New Jersey HCS</div>                   |
        # ------------ CHECKING PRACTIONTIONER CONTAINED RESOURCE ----------------------
        | entry.resource.contained.resourceType             | Practitioner                          |
        | entry.resource.contained.identifier.system        | http://vistacore.us/fhir/id/uid       |
        | entry.resource.contained.identifier.value         | urn:va:visit:9E7A:140:11789                   |
        # ------------ CHECKING LOCATION CONTAINED RESOURCE ----------------------
        | entry.resource.contained.resourceType             | Location                              |
        | entry.resource.contained.identifier.system        | http://vistacore.us/fhir/id/uid       |
        | entry.resource.contained.identifier.value         | urn:va:location:9E7A:23              |
        | entry.resource.contained.text.status              | generated                             |
        | entry.resource.contained.text.div                 | <div>AUDIOLOGY</div>               |
        # ------------ CHECKING ENCOUNTER CONTAINED RESOURCE ----------------------
        | entry.resource.contained.resourceType             | Encounter                             |
        | entry.resource.contained.text.div                 | <div>AUDIOLOGY Apr 04, 2000</div>  |
        | entry.resource.contained.text.status              | generated                             |
        | entry.resource.contained.status                   | finished                              |
        | entry.resource.contained.identifier.system        | http://vistacore.us/fhir/id/uid       |
        | entry.resource.contained.identifier.value         | urn:va:visit:C877:140:11789            |

@F202-9 @US7176_vitals @DE1444 @DE3295
Scenario: Observation can be requested in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the client requests observation for the patient "9E7A;140" in FHIR format
    Then a successful response is returned
    Then FHIR date and time convert to Zulu format for Observation
    And the results contain
        | field 											| value 								|
     	| entry.resource.resourceType 						| Observation 							|
     	| entry.resource.text.status 						| generated 							|
     	| entry.resource.text.div 							| <div>PAIN 7 </div> 			|
     	| entry.resource.contained.resourceType 			| Organization 							|
     	| entry.resource.contained.identifier.system 		| urn:oid:2.16.840.1.113883.6.233 		|
     	| entry.resource.contained.identifier.value 		| 561 									|
     	| entry.resource.contained.name 					| New Jersey HCS								|
     	| entry.resource.code.coding.system 				| urn:oid:2.16.840.1.113883.6.233 		|
     	| entry.resource.code.coding.code 					| urn:va:vuid:4500635 					|
     	| entry.resource.code.coding.display 				| PAIN 							|
     	| entry.resource.code.coding.system 				| http://loinc.org 						|
     	| entry.resource.code.coding.code 					| 72514-3 								|
     	| entry.resource.code.coding.display 				| Pain severity - 0-10 verbal numeric rating [#] - Reported					|
     	| entry.resource.valueQuantity.value				| 7 									|
     	| entry.resource.appliesDateTime 					| 2000-05-03T14:39:00Z	|
     	| entry.resource.status 							| final 								|
     	| entry.resource.reliability 						| unknown 								|
     	| entry.resource.identifier.use 					| official 								|
     	| entry.resource.identifier.system 					| http://vistacore.us/fhir/id/uid 		|
        | entry.resource.identifier.value 					| urn:va:vital:9E7A:140:1144		|
     	| entry.resource.subject.reference 					| Patient/140 						|
     	| entry.resource.performer.display 					| New Jersey HCS 								|

@F202-9 @US7176_code
Scenario: Observation can be requested and filtered by vital code in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the observation is requested with parameter code value "8310-5" for patient "9E7A;140"
    Then a successful response is returned
    And the results contain
       | entry.resource.code.coding.system 				| http://loinc.org 						|
       | entry.resource.code.coding.code 					| 8310-5								|

@F202-9 @US7176_link
Scenario: Observation can be requested and filtered by system link in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "code" value "http://loinc.org|9279-1" for patient "9E7A;253"
    Then a successful response is returned
   And the FHIR results contain "vital results"
       | resource.code.coding.system 				| http://loinc.org 						|
     	 | resource.code.coding.code 					| 9279-1 								|

@F202-9 @US7176_count
Scenario: Observation can be requested and limited by count in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "_count" value "5" for patient "9E7A;253"
    Then a successful response is returned

@F202-9 @US7176_date @DE1459
Scenario: Observation can be requested and filtered by date in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "2004-03-30" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

   And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2004-03-30T21:31:00	|

@F202-9 @US7176_datetime @DE1459
Scenario: Observation can be requested and filtered by full datetime in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "2004-03-30T21:31:00" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

   And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2004-03-30T21:31:00	|

@F202-9 @US7176_date_yyyymm @DE1459
Scenario: Observation can be requested and filtered by partial date (yyyy-mm) in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "2004-03" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

    And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2004-03-30T21:31:00	|

@F202-9 @US7176_date_yyyy @DE1459
Scenario: Observation can be requested and filtered by partial date (yyyy)in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "2005" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@F202-9 @US7176_datewithcode
Scenario: Observation can be requested and filtered by date and code in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2004-03-30&code=8310-5" for patient "9E7A;253"
    Then a successful response is returned
   And the value of field total is more than one

@DE1457_multiplecodes
Scenario: Observation can be requested and filtered by code in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "code" value "29463-7,9279-1,8310-5" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

    And the FHIR results contain "vital results"
      | resource.code.coding.system 				| http://loinc.org 				|
      | resource.code.coding.code 					| 29463-7 								|
    And the FHIR results contain "vital results"
      | resource.code.coding.system 				| http://loinc.org 				|
     	| resource.code.coding.code 					| 9279-1 								  |
    And the FHIR results contain "vital results"
      | resource.code.coding.system 				| http://loinc.org 				|
     	| resource.code.coding.code 					| 8310-5 								  |

@DE1457_multiplecodeslinks
Scenario: Observation can be requested and filtered by multiple codes and systems in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "code" value "http://loinc.org|9279-1,http://loinc.org|8310-5" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

    And the FHIR results contain "vital results"
      | resource.code.coding.system 				| http://loinc.org 			|
     	| resource.code.coding.code 					| 9279-1 								|
    And the FHIR results contain "vital results"
      | resource.code.coding.system 				| http://loinc.org 			|
     	| resource.code.coding.code 					| 8310-5 								|

@F202-9 @US7176_all
Scenario: Observation can be requested and filtered by date,code and count in Fhir format
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with all parameters for patient "9E7A;253"
    Then a successful response is returned
     And the value of field total is more than one

@DE1458_notdatetime
Scenario: Observation can be requested and filtered by date in Fhir format (!datetime)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "!=2004-03-30T21:31:00" for patient "9E7A;253"
    Then a successful response is returned
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 	| 2005-03-15T11:30:00	|
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 	| 2005-03-16T06:00:00	|
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2005-03-16T10:00:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-03-15T08:00:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-04-11T07:45:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-04-24T08:00:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-11-28T08:00:00 |

@DE1458_notdate
Scenario: Observation can be requested and filtered by date in Fhir format (!date)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "!=2004-03-30" for patient "9E7A;253"
    Then a successful response is returned
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2005-03-15T11:30:00	|
   And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2005-03-16T06:00:00	|

@DE1458_notdateyyyymm
Scenario: Observation can be requested and filtered by date in Fhir format (!dateyyyymm)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "!=2004-03" for patient "9E7A;253"
    Then a successful response is returned
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2005-03-15T11:30:00	|
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2005-03-16T06:00:00	|

@DE1458_notdateyyyy
Scenario: Observation can be requested and filtered by date in Fhir format (!dateyyyy)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "!=2004" for patient "9E7A;253"
    Then a successful response is returned
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2005-03-15T11:30:00	|
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 				| 2005-03-16T06:00:00	|

@DE1458_greaterdatetime
Scenario: Observation can be requested and filtered by date in Fhir format (>datetime)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2004-03-30T21:31:00" for patient "9E7A;253"
    Then a successful response is returned
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 	| 2005-03-15T11:30:00	|
    And the FHIR results contain "vital results"
       | resource.appliesDateTime 	| 2005-03-16T06:00:00	|
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2005-03-16T10:00:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-03-15T08:00:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-04-11T07:45:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-04-24T08:00:00 |
    And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-11-28T08:00:00 |

@DE1458_greaterdate
Scenario: Observation can be requested and filtered by date in Fhir format (>date)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2005-03-30" for patient "9E7A;253"
    Then a successful response is returned
   And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-03-15T08:00:00 |
   And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-04-11T07:45:00 |
   And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-04-24T08:00:00 |
   And the FHIR results contain "vital results"
       | resource.appliesDateTime   | 2007-11-28T08:00:00 |

@DE1458_greaterdateyyyymm
Scenario: Observation can be requested and filtered by date in Fhir format (>dateyyyymm)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2000-03" for patient "9E7A;253"
    Then a successful response is returned
     And the value of field total is more than one

@DE1458_greaterdateyyyy
Scenario: Observation can be requested and filtered by date in Fhir format (>dateyyyy)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2007" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

  
@DE1458_greaterequaldatetime
Scenario: Observation can be requested and filtered by date in Fhir format (>=datetime)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">=2004-03-30T21:31:00" for patient "9E7A;253"
    Then a successful response is returned
   And the value of field total is more than one

@DE1458_greaterequaldate
Scenario: Observation can be requested and filtered by date in Fhir format (>=date)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">=2007-04-11" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_greaterequaldateyyyymm
Scenario: Observation can be requested and filtered by date in Fhir format (>=dateyyyymm)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">=2008-04" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_greaterequaldateyyyy
Scenario: Observation can be requested and filtered by date in Fhir format (>=dateyyyy)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">=2004" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_lessdatetime
Scenario: Observation can be requested and filtered by date in Fhir format (<datetime)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<2004-03-30T01:26:59" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_lessdate
Scenario: Observation can be requested and filtered by date in Fhir format (<date)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<2005-03-30" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_lessdateyyyymm
Scenario: Observation can be requested and filtered by date in Fhir format (<dateyyyymm)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<2005-03" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_lessdateyyyy
Scenario: Observation can be requested and filtered by date in Fhir format (<dateyyyy)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<2006" for patient "9E7A;253"
    Then a successful response is returned
     And the value of field total is more than one

@DE1458_lessequaldatetime
Scenario: Observation can be requested and filtered by date in Fhir format (<=datetime)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<=2003-04-05T15:15:00" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_lessequaldate
Scenario: Observation can be requested and filtered by date in Fhir format (<=date)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<=2003-04-05" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_lessequaldateyyyymm
Scenario: Observation can be requested and filtered by date in Fhir format (<=dateyyyymm)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<=2003-04" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_lessequaldateyyyy
Scenario: Observation can be requested and filtered by date in Fhir format (<=dateyyyy)
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value "<=2004" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_daterange1
Scenario: Observation can be requested and filtered by date range in Fhir format - 1
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2004-03-30T12:30:00&date=<2004-03-30T22:50:00" for patient "9E7A;253"
    Then a successful response is returned
     And the value of field total is more than one

@DE1458_daterange2
Scenario: Observation can be requested and filtered by date range in Fhir format - 2
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2004-03-29&date=<2004-03-30T22:50:00" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_daterange3
Scenario: Observation can be requested and filtered by date range in Fhir format - 3
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2004-03-29&date=<2004-03-31" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_daterange4
Scenario: Observation can be requested and filtered by date range in Fhir format - 4
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">=2004-03-30&date=<2004-03-31" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_daterange5
Scenario: Observation can be requested and filtered by date range in Fhir format - 5
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">=2004-03-30&date=<=2004-03-30" for patient "9E7A;253"
    Then a successful response is returned
    And the value of field total is more than one

@DE1458_date_invalid1 
Scenario: Client receives 400 code for an invalid request - 1
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">!=2004-03-30" for patient "9E7A;253"
    Then a bad request response is returned

@DE1458_date_invalid2 
Scenario: Client receives 400 code for an invalid request - 2
    Given a patient with "observation" in multiple VistAs
    When the "observation" is requested with parameter "date" value ">2005=-03-30" for patient "9E7A;253"
    Then a bad request response is returned
