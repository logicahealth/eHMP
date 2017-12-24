@F137 @F137_FetchSingleItem  @vxsync @patient
Feature: F137 - SDK Expansion and Enhancement - Add ability to fetch single item

@US1813 @US1813_allergy @5000000217V519385
Scenario: Single Item fetch - allergy
# use pagination
	Given a patient with pid "SITE;100716" has been synced through the RDK API
	And test discovers allergy for patient "SITE;100716"
	When the client requests that item for the patient "SITE;100716" in RDK format
	Then a successful response is returned   
	And the client receives 1 result(s)                                    
    And the VPR results contain the correct uid for that item  

@US1813 @US1813_allergy_neg @5000000217V519385
Scenario: Single Item fetch - will not receive allergy from different patient
# use pagination
	Given a patient with pid "SITE;100716" has been synced through the RDK API
	And a patient with pid "SITE;3" has been synced through the RDK API
	And test discovers allergy for patient "SITE;100716"
	When the client requests that item for the patient "SITE;3" in RDK format
	Then a Not Found response is returned   
	And the response contains error message
		| field		| expected_value 								|
		| message	| Bad key  										|  
		# I do not check domain error message because it could change each run, error message checked in another test 

        

@US1813 @US1813_vital @5000000341V359724
Scenario: Single Item fetch - vital
# use pagination
	Given a patient with pid "SITE;100022" has been synced through the RDK API
	And test discovers vital for patient "SITE;100022"
	When the client requests that item for the patient "SITE;100022" in RDK format
	Then a successful response is returned                                      
    And the client receives 1 result(s)   
    And the VPR results contain the correct uid for that item                                      

@US1813 @US1813_vital_neg  @5000000341V359724
Scenario: Single Item fetch - will not receive vital from different patient
# use pagination
	Given a patient with pid "SITE;100022" has been synced through the RDK API
	And a patient with pid "SITE;3" has been synced through the RDK API
	And test discovers vital for patient "SITE;100022"
	When the client requests that item for the patient "SITE;3" in RDK format
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
	|SITE;3		| problem list		|urn:va:problem:SITE:3:183 				  	|
	|SITE;8		| immunization		|urn:va:immunization:SITE:8:74				|
	|SITE;3		| order				|urn:va:order:SITE:3:33089			 		|
	|SITE;229 		| lab 				|urn:va:lab:SITE:229:CH;6899693.87PORT;80	|
	|SITE;71			| outpatient med	|urn:va:med:SITE:71:10259					|
	|SITE;253		| consults			|urn:va:consult:SITE:253:379				|
	# no demographics?
	|SITE;230			| radiology			|urn:va:image:SITE:230:7059188.8592-1		|
	|SITE;230			| anatomic pathology|urn:va:lab:SITE:230:CY;7059588				|
	|SITE;8		| inpatient med		|urn:va:med:SITE:8:8145						|


@US1813 @single_item_negative @SITE230
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
	|SITE;230		|10108V420871		| problem list		|urn:va:problem:SITE:3:183 				  	| Pid:SITE;230 Key:urn:va:problem:SITE:3:183 	|
	|SITE;230		|SITE;8		| immunization		|urn:va:immunization:SITE:8:42				| Pid:SITE;230 Key:urn:va:immunization:SITE:8:42|
	|SITE;230		|10108V420871		| order				|urn:va:order:SITE:3:33089			 		| Pid:SITE;230 Key:urn:va:order:SITE:3:33089	|
	|SITE;230		|SITE;229 		| lab 				|urn:va:lab:SITE:229:CH;6899693.87PORT;80	| Pid:SITE;230 Key:urn:va:lab:SITE:229:CH;6899693.87PORT;80 |
	|SITE;230		|SITE;71			| outpatient med	|urn:va:med:SITE:71:10259					| Pid:SITE;230 Key:urn:va:med:SITE:71:10259		|
	|SITE;230		|SITE;253		| consults			|urn:va:consult:SITE:253:379				| Pid:SITE;230 Key:urn:va:consult:SITE:253:379	|
	# no demographics?
	|SITE;8	|SITE;230			| radiology			|urn:va:image:SITE:230:7059188.8592-1		| Pid:SITE;8 Key:urn:va:image:SITE:230:7059188.8592-1	|
	|SITE;8	|SITE;230			| anatomic pathology|urn:va:lab:SITE:230:CY;7059588				| Pid:SITE;8 Key:urn:va:lab:SITE:230:CY;7059588		|
	|10108V420871	|SITE;8		| inpatient med		|urn:va:med:SITE:8:8145						| Pid:10108V420871 Key:urn:va:med:SITE:8:8145				|


@US1813 @single_item_positive @10110V004877 @asu @DE1105
Scenario Outline: Single Item fetch - 
	Given a patient with pid "<patient>" has been synced through the RDK API
	When the client requests item "<item_uid>" for the patient "<patient>" in RDK format 
    Then a successful response is returned 

Examples:
	|patient			| domain 			| item_uid 									| 
	|10108V420871		| discharge summary	|urn:va:document:SITE:3:2745			 	|
	|SITE;100125	| clinical docs 	|urn:va:document:SITE:100125:2258			|


@US1813 @single_item_negative @SITE230 @asu @DE1105
Scenario Outline: Single Item fetch - negative test, will not receive items from different patient
	Given a patient with pid "<patient1>" has been synced through the RDK API
	And a patient with pid "<patient2>" has been synced through the RDK API
	When the client requests item "<item_uid>" for the patient "<patient1>" in RDK format 
	Then a non-found response is returned

Examples:
	|patient1		|patient2			| domain 			| item_uid 									| error_message									|
	|SITE;230		|10108V420871		| discharge summary	|urn:va:document:SITE:3:2745			 	| Pid:SITE;230 Key:urn:va:document:SITE:3:2745	|
	|SITE;8	|SITE;100125	| clinical docs 	|urn:va:document:SITE:100125				| Pid:SITE;8 Key:urn:va:document:SITE:100125			|
