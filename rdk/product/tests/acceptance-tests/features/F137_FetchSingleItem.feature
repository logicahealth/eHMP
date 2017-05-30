@F137 @F137_FetchSingleItem  @vxsync @patient
Feature: F137 - SDK Expansion and Enhancement - Add ability to fetch single item

@US1813 @US1813_allergy @5000000217V519385
Scenario: Single Item fetch - allergy
# use pagination
	Given a patient with pid "9E7A;100716" has been synced through the RDK API
	And test discovers allergy for patient "9E7A;100716"
	When the client requests that item for the patient "9E7A;100716" in RDK format
	Then a successful response is returned   
	And the client receives 1 result(s)                                    
    And the VPR results contain the correct uid for that item  

@US1813 @US1813_allergy_neg @5000000217V519385
Scenario: Single Item fetch - will not receive allergy from different patient
# use pagination
	Given a patient with pid "9E7A;100716" has been synced through the RDK API
	And a patient with pid "9E7A;3" has been synced through the RDK API
	And test discovers allergy for patient "9E7A;100716"
	When the client requests that item for the patient "9E7A;3" in RDK format
	Then a Not Found response is returned   
	And the response contains error message
		| field		| expected_value 								|
		| message	| Bad key  										|  
		# I do not check domain error message because it could change each run, error message checked in another test 

        

@US1813 @US1813_vital @5000000341V359724
Scenario: Single Item fetch - vital
# use pagination
	Given a patient with pid "9E7A;100022" has been synced through the RDK API
	And test discovers vital for patient "9E7A;100022"
	When the client requests that item for the patient "9E7A;100022" in RDK format
	Then a successful response is returned                                      
    And the client receives 1 result(s)   
    And the VPR results contain the correct uid for that item                                      

@US1813 @US1813_vital_neg  @5000000341V359724
Scenario: Single Item fetch - will not receive vital from different patient
# use pagination
	Given a patient with pid "9E7A;100022" has been synced through the RDK API
	And a patient with pid "9E7A;3" has been synced through the RDK API
	And test discovers vital for patient "9E7A;100022"
	When the client requests that item for the patient "9E7A;3" in RDK format
	Then a Not Found response is returned    
	And the response contains error message
		| field		| expected_value 								|
		| message	| Bad key  										|  
	    # I do not check domain error message because it could change each run, error message checked in another test            
	

@US1813 @single_item_positive @10110V004877
Scenario Outline: Single Item fetch - 
	Given a patient with pid "<patient>" has been synced through the RDK API
	When the client requests item "<item_uid>" for the patient "<patient>" in RDK format 
	Then a successful response is returned                                      
    And the client receives 2 VPR VistA result(s)                               
    And the VPR results contain                                                 
      | field             | panorama_value    |
      | uid               | <item_uid>        |

Examples:
	|patient			| domain 			| item_uid 									| 
	|9E7A;3		| problem list		|urn:va:problem:9E7A:3:183 				  	|
	|9E7A;8		| immunization		|urn:va:immunization:9E7A:8:74				|
	|9E7A;3		| order				|urn:va:order:9E7A:3:33089			 		|
	|9E7A;229 		| lab 				|urn:va:lab:9E7A:229:CH;6899693.879999;80	|
	|9E7A;71			| outpatient med	|urn:va:med:9E7A:71:10259					|
	|9E7A;253		| consults			|urn:va:consult:9E7A:253:379				|
	# no demographics?
	|9E7A;230			| radiology			|urn:va:image:9E7A:230:7059188.8592-1		|
	|9E7A;230			| anatomic pathology|urn:va:lab:9E7A:230:CY;7059588				|
	|9E7A;8		| inpatient med		|urn:va:med:9E7A:8:8145						|


@US1813 @single_item_negative @9E7A230
Scenario Outline: Single Item fetch - negative test, will not receive items from different patient
	Given a patient with pid "<patient1>" has been synced through the RDK API
	And a patient with pid "<patient2>" has been synced through the RDK API
	When the client requests item "<item_uid>" for the patient "<patient1>" in RDK format 
	Then a Not Found response is returned                                       
    And the response contains error message
		| field		| expected_value 								|
		| domain	| <error_message>								|
		| message	| Bad key  										|                                

Examples:
	|patient1		|patient2			| domain 			| item_uid 									| error_message					|				
	|9E7A;230		|10108V420871		| problem list		|urn:va:problem:9E7A:3:183 				  	| Pid:9E7A;230 Key:urn:va:problem:9E7A:3:183 	|
	|9E7A;230		|9E7A;8		| immunization		|urn:va:immunization:9E7A:8:42				| Pid:9E7A;230 Key:urn:va:immunization:9E7A:8:42|
	|9E7A;230		|10108V420871		| order				|urn:va:order:9E7A:3:33089			 		| Pid:9E7A;230 Key:urn:va:order:9E7A:3:33089	|
	|9E7A;230		|9E7A;229 		| lab 				|urn:va:lab:9E7A:229:CH;6899693.879999;80	| Pid:9E7A;230 Key:urn:va:lab:9E7A:229:CH;6899693.879999;80 |
	|9E7A;230		|9E7A;71			| outpatient med	|urn:va:med:9E7A:71:10259					| Pid:9E7A;230 Key:urn:va:med:9E7A:71:10259		|
	|9E7A;230		|9E7A;253		| consults			|urn:va:consult:9E7A:253:379				| Pid:9E7A;230 Key:urn:va:consult:9E7A:253:379	|
	# no demographics?
	|9E7A;8	|9E7A;230			| radiology			|urn:va:image:9E7A:230:7059188.8592-1		| Pid:9E7A;8 Key:urn:va:image:9E7A:230:7059188.8592-1	|
	|9E7A;8	|9E7A;230			| anatomic pathology|urn:va:lab:9E7A:230:CY;7059588				| Pid:9E7A;8 Key:urn:va:lab:9E7A:230:CY;7059588		|
	|10108V420871	|9E7A;8		| inpatient med		|urn:va:med:9E7A:8:8145						| Pid:10108V420871 Key:urn:va:med:9E7A:8:8145				|


@US1813 @single_item_positive @10110V004877 @asu @DE1105
Scenario Outline: Single Item fetch - 
	Given a patient with pid "<patient>" has been synced through the RDK API
	When the client requests item "<item_uid>" for the patient "<patient>" in RDK format 
    Then a successful response is returned 

Examples:
	|patient			| domain 			| item_uid 									| 
	|10108V420871		| discharge summary	|urn:va:document:9E7A:3:2745			 	|
	|9E7A;100125	| clinical docs 	|urn:va:document:9E7A:100125:2258			|


@US1813 @single_item_negative @9E7A230 @asu @DE1105
Scenario Outline: Single Item fetch - negative test, will not receive items from different patient
	Given a patient with pid "<patient1>" has been synced through the RDK API
	And a patient with pid "<patient2>" has been synced through the RDK API
	When the client requests item "<item_uid>" for the patient "<patient1>" in RDK format 
	Then a non-found response is returned

Examples:
	|patient1		|patient2			| domain 			| item_uid 									| error_message									|
	|9E7A;230		|10108V420871		| discharge summary	|urn:va:document:9E7A:3:2745			 	| Pid:9E7A;230 Key:urn:va:document:9E7A:3:2745	|
	|9E7A;8	|9E7A;100125	| clinical docs 	|urn:va:document:9E7A:100125				| Pid:9E7A;8 Key:urn:va:document:9E7A:100125			|
