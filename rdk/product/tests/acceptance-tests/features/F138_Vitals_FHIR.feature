 @Team_Europa @vitals_fhir @fhir @vxsync @patient
 Feature: F138 - Return of Vitals in FHIR format
 #This feature item returns Vitals in FHIR format. Also includes cases where no Vitals exist.

 @F138_1_vitals_fhir @fhir @9E7A100022
 Scenario: Client can request vital results in FHIR format
 	Given a patient with "vitals" in multiple VistAs
 	When the client requests vitals for the patient "9E7A;100022" in FHIR format
 	Then a successful response is returned
 	And the FHIR results contain "vital results"
 	| field									                  | panorama_value					            |
 	| resource.contained.resourceType	        | Organization					            	|
 	| resource.identifier.value				        | CONTAINS urn:va:vital:9E7A:100022		|
 	| resource.contained.identifier.value	    | 998									                |
 	| resource.contained.name				          | ABILENE (CAA)							          |
 # Not available for this patient.
 	| resource.extention.valueCoding.system	  | IS_NOT_SET			           |
 	| resource.extention.valueCoding.code	    | IS_NOT_SET			           |
 	| resource.extention.valueCoding.display	| IS_NOT_SET			           |
 	| resource.text.status					          | generated				           |
 	| resource.code.coding.system			        | http://loinc.org			     |
 	| resource.appliesDateTime				        | IS_FHIR_FORMATTED_DATE 		 |
 	| resource.status						              | final         						 |
 	| resource.reliability					          | unknown								     |
 	| resource.bodysite.coding.system		      | IS_NOT_SET					    	 |
 	| resource.bodysite.coding.code			      | IS_NOT_SET						   	 |
 	| resource.bodysite.coding.display		    | IS_NOT_SET						  	 |
 	| resource.method.coding.system			      | IS_NOT_SET							   |
 	| resource.method.coding.code			        | IS_NOT_SET							   |
 	| resource.method.coding.display			    | IS_NOT_SET							   |
 	| resource.identifier.use				          | official								   |
 	| resource.identifier.system				      | http://vistacore.us/fhir/id/uid		|
 	| resource.subject.reference				      | Patient/100022						        |

 	And the FHIR results contain "vital results"
 	| field									                  | panorama_value						          |
  | resource.identifier.value               | CONTAINS urn:va:vital:9E7A:100022   |
 	| resource.text.div						            | CONTAINS TEMPERATURE 98.6 F			    |
 	| resource.code.coding.display			      | TEMPERATURE							            |
 	| resource.valueQuantity.value			      | 98.6									              |
  | resource.valueQuantity.units            | F		                               	|
 	| resource.referenceRange.low.value		    | 95									                |
 	| resource.referenceRange.low.units		    | F										                |
 	| resource.referenceRange.high.value		  | 102									                |
 	| resource.referenceRange.high.units		  | F										                |

 	And the FHIR results contain "vital results"
 	| field									                  | panorama_value						          |
  | resource.identifier.value               | CONTAINS urn:va:vital:9E7A:100022   |
 	| resource.text.div						            | CONTAINS RESPIRATION 22 /min		   	|
 	| resource.code.coding.display			      | RESPIRATION							            |
 	| resource.valueQuantity.value			      | 22								                 	|
  | resource.valueQuantity.units            | /min		                           	|
 	| resource.referenceRange.low.value		    | 8										                |
 	| resource.referenceRange.low.units		    | /min									              |
 	| resource.referenceRange.high.value		  | 30								                	|
 	| resource.referenceRange.high.units		  | /min									              |

 	And the FHIR results contain "vital results"
 	| field									                  | panorama_value					          	|
  | resource.identifier.value               | CONTAINS urn:va:vital:9E7A:100022   |
 	| resource.text.div						            | CONTAINS PULSE 70 /min			      	|
 	| resource.code.coding.display			      | PULSE									              |
 	| resource.valueQuantity.value			      | 70									                |
  | resource.valueQuantity.units            | /min		                           	|
 	| resource.referenceRange.low.value		    | 60									                |
 	| resource.referenceRange.low.units		    | /min									              |
 	| resource.referenceRange.high.value		  | 120									                |
 	| resource.referenceRange.high.units		  | /min									              |

 	And the FHIR results contain "vital results"
 	| field									                  | panorama_value						          |
 	| resource.identifier.value				        | CONTAINS urn:va:vital:9E7A:100022		|
 	| resource.text.div						            | CONTAINS HEIGHT 60 in					      |
 	| resource.code.coding.display			      | HEIGHT								              |
 	| resource.valueQuantity.value		      	| 60									                |
  | resource.valueQuantity.units            | in		                             	|
 	| resource.referenceRange.low.value		    | IS_NOT_SET							            |
 	| resource.referenceRange.low.units		    | IS_NOT_SET							            |
 	| resource.referenceRange.high.value		  | IS_NOT_SET							            |
 	| resource.referenceRange.high.units		  | IS_NOT_SET							            |

 	And the FHIR results contain "vital results"
 	| field									                  | panorama_value						          |
 	| resource.identifier.value				        | CONTAINS urn:va:vital:9E7A:100022		|
 	| resource.text.div						            | CONTAINS WEIGHT 200 lb			       	|
 	| resource.code.coding.display			      | WEIGHT								              |
 	| resource.valueQuantity.value			      | 200									                |
  | resource.valueQuantity.units            | lb		                           	  |

  And the FHIR results contain "vital results"
 	| field									              | panorama_value						|
 	| resource.contained.resourceType	    | Organization							|
 	| resource.identifier.value				    | CONTAINS urn:va:vital:9E7A:100022		|
 	| resource.contained.identifier.value	| 998									      |
 	| resource.contained.name				      | ABILENE (CAA)						  |
 	| resource.text.status					            | generated								|
 	| resource.code.coding.system			          | http://loinc.org				|
  | resource.appliesDateTime				          | IS_FHIR_FORMATTED_DATE  |
  | resource.issued						                | IS_FHIR_FORMATTED_DATE 	|
 	| resource.status						                | final         					|

  And the FHIR results contain "vital results"
 	| field									          | panorama_value						|
 	| resource.identifier.value				| CONTAINS urn:va:vital:9E7A:100022		|
 	| resource.text.div						    | CONTAINS PULSE OXIMETRY 98 %			  |
 	| resource.code.coding.display			    | PULSE OXIMETRY			|
 	| resource.valueQuantity.value			    | 98									|
  | resource.valueQuantity.units          | %			              |
 	| resource.referenceRange.low.value		  | 50									|
 	| resource.referenceRange.low.units		  | %										|
 	| resource.referenceRange.high.value		| 100									|
 	| resource.referenceRange.high.units		| %										|

 	And the FHIR results contain "vital results"
 	| field									                | panorama_value						          |
 	| resource.identifier.value				      | CONTAINS urn:va:vital:9E7A:100022		|
 	| resource.text.div						          | CONTAINS PAIN 3					          	|
 	| resource.code.coding.display			    | PAIN									  |
 	| resource.valueQuantity.value			    | 3										    |
  | resource.valueQuantity.units          | EMPTY		                |
 	| resource.referenceRange.low.value		  | IS_NOT_SET							|
 	| resource.referenceRange.high.value		| IS_NOT_SET							|
 And FHIR date and time conver to Zulu format for Vitals

 @F138_vitals_fhir_girth @fhir @9E7A428
 Scenario: Client can request vitals in FHIR format
 	Given a patient with "vitals" in multiple VistAs
 	When the client requests vitals for the patient "9E7A;428" in FHIR format
 	Then a successful response is returned
 	And the FHIR results contain "vitals"
   | name                                           | value                                |
   | resource.text.div                              | CONTAINS CIRCUMFERENCE/GIRTH         |
   | resource.text.status                           | generated                            |
   | resource.code.coding.system                    | urn:oid:2.16.840.1.113883.6.233      |
   | resource.code.coding.code                      | urn:va:vuid:4688720                  |
   | resource.code.coding.display                   | CIRCUMFERENCE/GIRTH                  |
   |resource.appliesDateTime                        | IS_FHIR_FORMATTED_DATE               |
   | resource.status                                | final                                |
   | resource.reliability                           | unknown                              |
   | resource.referenceRange.low.value              | IS_NOT_SET                           |
   | resource.referenceRange.low.units              | IS_NOT_SET                           |
   | resource.referenceRange.high.value             | IS_NOT_SET                           |
   | resource.referenceRange.high.units             | IS_NOT_SET                           |
   | resource.identifier.use                        | official                             |
   | resource.identifier.value                      | IS_SET                               |
   | resource.identifier.system                     | http://vistacore.us/fhir/id/uid      |
   | resource.subject.reference                     | Patient/428                          |
   | resource.referenceRange.meaning.coding.system  | IS_NOT_SET                           |
   | resource.referenceRange.meaning.coding.code    | IS_NOT_SET                           |
   | resource.referenceRange.meaning.coding.display | IS_NOT_SET                           |
   | resource.subject.reference                     | Patient/428                          |
   | resource.valueQuantity.value                   | 42                                   |
   | resource.valueQuantity.units                   | in                                   |
   | resource.issued                                | IS_FHIR_FORMATTED_DATE               |

 # following 2 scenarios are checking for another patient for return of vital results.
 # only few fields are checked to validate data integrity.
 # qualifiers field mapping is checked here which was not available for the above patient
 @F138_3_vitals_fhir @fhir @9E7A100184
 Scenario: Client can request vital results in FHIR format
 	Given a patient with "vitals" in multiple VistAs
 	When the client requests vitals for the patient "9E7A;100184" in FHIR format
 	Then a successful response is returned
 	Then the client receives 13 FHIR "VistA" result(s)
 	And the client receives 13 FHIR "panorama" result(s)
  And the FHIR results contain "vital results"
 	| field									          | panorama_value						             |
 	| resource.identifier.value				| CONTAINS urn:va:vital:9E7A:100184			 |
 	| resource.code.coding.system			| http://loinc.org									     |
 	| resource.code.coding.code				| 8310-5											           |
 	| resource.code.coding.display		| Body temperature									     |
 	| resource.text.div						    | CONTAINS TEMPERATURE 98.7 F						 |
 	| resource.valueQuantity.value			    | 98.7												     |
  | resource.valueQuantity.units          | F			    			               	 |
 	| resource.referenceRange.low.value		  | 95												       |
 	| resource.referenceRange.high.value		| 102												       |

 	And the FHIR results contain "vital results"
 	| field									          | panorama_value						           |
 	| resource.identifier.value				| CONTAINS urn:va:vital:9E7A:100184		 |
 	| resource.code.coding.system			| http://loinc.org									   |
 	| resource.code.coding.code				| 8867-4											         |
 	| resource.code.coding.display  	| Heart rate										       |
 	| resource.text.div						    | CONTAINS PULSE 72 /min							 |
 	| resource.valueQuantity.value		      | 72												     |
  | resource.valueQuantity.units          | /min			    			           |
 	| resource.referenceRange.low.value		  | 60										     	 	 |
 	| resource.referenceRange.high.value		| 120												     |

 @F138_4_vitals_fhir @fhir @9E7A100184
 Scenario: Client can request vital results in FHIR format
 	Given a patient with "vitals" in multiple VistAs
 	When the client requests vitals for the patient "9E7A;100184" in FHIR format
 	Then a successful response is returned
 	Then the client receives 13 FHIR "VistA" result(s)
 	And the client receives 13 FHIR "panorama" result(s)
 	And the FHIR results contain "vital results"
 	| field									          | panorama_value						          |
 	| resource.identifier.value				| CONTAINS urn:va:vital:9E7A:100184		|
 	| resource.code.coding.system			| http://loinc.org									  |
 	| resource.code.coding.code				| 8310-5											        |
 	| resource.code.coding.display  	| Body temperature									  |
 	| resource.text.div						    | CONTAINS TEMPERATURE 98.7 F					|
 	| resource.valueQuantity.value		    | 98.7												    |
  | resource.valueQuantity.units        | F			    			               	|
 	| resource.referenceRange.low.value		| 95												      |
 	| resource.referenceRange.high.value	| 102												      |

 	And the FHIR results contain "vital results"
 	| field									                  | panorama_value						                |
 	| resource.identifier.value				        | CONTAINS urn:va:vital:9E7A:100184					|
 	| resource.code.coding.system			        | http://loinc.org						        			|
 	| resource.code.coding.code				        | 8867-4							              				|
 	| resource.code.coding.display			      | Heart rate						            				|
 	| resource.text.div						            | CONTAINS PULSE 72 /min				      			|
 	| resource.valueQuantity.value			      | 72												                |
  | resource.valueQuantity.units            | /min			    			                      |
  | resource.referenceRange.low.value		    | 60									                			|
  | resource.referenceRange.high.value		  | 120											                	|

 @F138_5_vitals_neg_fhir @fhir @9E7A100184
 Scenario: Negative scenario.  Client can request vital results in FHIR format
 	Given a patient with "vitals" in multiple VistAs
 	When the client requests vitals for the patient "9E7A;100184" in FHIR format
 	Then a successful response is returned
 	Then corresponding matching FHIR records totaling "13" are displayed

 @F138_6_vitals_fhir @fhir @DE974 @9E7A100022
 Scenario: Client can request vital results in FHIR format
 	Given a patient with "vitals" in multiple VistAs
 	When the client requests vitals with _count of "10" for the patient "9E7A;100022" in FHIR format
  Then the FHIR results contain "10" vitals
