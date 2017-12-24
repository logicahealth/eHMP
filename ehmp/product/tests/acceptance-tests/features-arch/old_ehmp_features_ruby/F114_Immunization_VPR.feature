@immunization_vpr
Feature: F114 Return of Immunizations in VPR format

#This feature item returns Immunizations in VPR format. Also includes cases when no results are available. 


@f100_1_immunization_vpr @vpr 
Scenario: Client can request Immunizations in VPR format
	Given a patient with "immunization" in multiple VistAs
	Given a patient with pid "SITE;6" has been synced through Admin API
	When the client requests immunization for the patient "SITE;6" in VPR format
	Then the client receives 1 VPR "VistA" result(s)
	Then the client receives 1 VPR "panorama" result(s)
	And the VPR results contain:

      | field                 | value                        |
      | uid                   | urn:va:immunization:SITE:6:3 |
      | summary               | INFLUENZA (HISTORICAL)                    |
      | pid                   | SITE;6                       |
      | localId               | 3                            |
      | facilityCode          | 500                          |
      | facilityName          | CAMP MASTER                  |
      | name                  | INFLUENZA (HISTORICAL)                    |
      | administeredDateTime  | 199610141300                 |
      | contraindicated       | false                        |
      | seriesName            | SERIES 1                     |
      | reactionName          | NONE                         |
      | cptCode               | urn:cpt:90724                |
      | cptName               | INFLUENZA IMMUNIZATION       |
      | performerUid          | urn:va:user:SITE:11285       |
      | encounterUid          | urn:va:visit:SITE:6:158      |
      | kind                  | Immunization                 |
      | performerName         | WARDCLERK,SEVENTYTHREE       |
      | reactionCode          | urn:va:reaction:SITE:6:0     |
      | locationUid           | urn:va:location:SITE:23      |
      | seriesCode            | urn:va:series:SITE:6:SERIES 1|
      | locationName          | GENERAL MEDICINE             |
      | comment               | NONE                         |
      | encounterName         | GENERAL MEDICINE Oct 14, 1996|                       
      
@f100_2_immunization_vpr @vpr 
Scenario: Client can request immunization in VPR format
	Given a patient with "immunization" in multiple VistAs
	Given a patient with pid "SITE;6" has been synced through Admin API
	When the client requests immunization for the patient "SITE;6" in VPR format
	Then the client receives 1 VPR "VistA" result(s)
	Then the client receives 1 VPR "kodak" result(s)
	And the VPR results contain:
                                                      
      | field                 | value                        |
      | uid                   | urn:va:immunization:SITE:6:3 |
      | summary               | INFLUENZA (HISTORICAL)       |
      | pid                   | SITE;6                       |
      | localId               | 3                            |
      | facilityCode          | 500                          |
      | facilityName          | CAMP BEE	                 |
      | name                  | INFLUENZA (HISTORICAL)       |
      | administeredDateTime  | 199610141300                 |
      | contraindicated       | false                        |
      | seriesName            | SERIES 1                     |
      | reactionName          | NONE                         |
      | cptCode               | urn:cpt:90724                |
      | cptName               | INFLUENZA IMMUNIZATION       |
      | performerUid          | urn:va:user:SITE:11285       |
      | encounterUid          | urn:va:visit:SITE:6:158      |
      | kind                  | Immunization                 |
      | performerName         | WARDCLERK,SEVENTYTHREE       |
      | reactionCode          | urn:va:reaction:SITE:6:0     |
      | locationUid           | urn:va:location:SITE:23      |
      | seriesCode            | urn:va:series:SITE:6:SERIES 1|
      | locationName          | GENERAL MEDICINE             |
      | comment               | NONE                         |
      | encounterName         | GENERAL MEDICINE Oct 14, 1996|  
                           
# following 2 scenarios are checking for another patient for return of immunization results.
# only few fields are checked to validate data integrity.

@f100_3_immunization_vpr @vpr
Scenario: Client can request immunization in VPR format
	Given a patient with "immunization" in multiple VistAs
	Given a patient with pid "10146V393772" has been synced through Admin API
	When the client requests immunization for the patient "10146V393772" in VPR format
	Then the client receives 8 VPR "VistA" result(s)
	Then the client receives 4 VPR "panorama" result(s)
	And the VPR results contain:
	
	  | field					| value									|
	  | uid						| CONTAINS urn:va:immunization:SITE:301 |
	  | summary					| DTP									|
	  | facilityCode          	| 500                          			|
      | facilityName          	| CAMP MASTER	               			|
      | name                  	| DTP				        			|
      | administeredDateTime  	| 19970621	                 			|
      | seriesName            	| COMPLETE                    			|
      | reactionName          	| NONE                         			|
      | cptCode               	| urn:cpt:90701                			|
      | cptName               	| DTP VACCINE IM		       			|
      | kind                  	| Immunization                 			|
      | performerName         	| PROVIDER,ONEHUNDREDNINETYONE		    |
      | reactionCode          	| urn:va:reaction:SITE:301:0     		|
      | locationUid           	| IS_NOT_SET			      			|
      | locationName          	| IS_NOT_SET	            			|	
      | comment               	| TESTING                      			|
      | encounterName         	| 0Jun 21, 1997							|  
      
@f100_4_immunization_vpr @vpr
Scenario: Client can request immunization in VPR format
	Given a patient with "immunization" in multiple VistAs
	Given a patient with pid "10146V393772" has been synced through Admin API
	When the client requests immunization for the patient "10146V393772" in VPR format
	Then the client receives 8 VPR "VistA" result(s)
	Then the client receives 4 VPR "kodak" result(s)
	And the VPR results contain:
	
	  | field					| value									|
	  | uid						| CONTAINS urn:va:immunization:SITE:301 |
	  | summary					| DTP									|
	  | facilityCode          	| 500                          			|
      | facilityName          	| CAMP BEE		               			|
      | name                  	| DTP				        			|
      | administeredDateTime  	| 19970621	                 			|
      | seriesName            	| COMPLETE                    			|
      | reactionName          	| NONE                         			|
      | cptCode               	| urn:cpt:90701                			|
      | cptName               	| DTP VACCINE IM		       			|
      | kind                  	| Immunization                 			|
      | performerName         	| PROVIDER,ONEHUNDREDNINETYONE		    |
      | reactionCode          	| urn:va:reaction:SITE:301:0     		|
      | locationUid           	| IS_NOT_SET			      			|
      | locationName          	| IS_NOT_SET	            			|	
      | comment               	| TESTING                      			|
      | encounterName         	| 0Jun 21, 1997							|     
	     	
# negative test case for immunization.  .

@f100_5_immunization_neg_vpr	
Scenario: Negative scenario.  Client can request immunization results in VPR format
Given a patient with "No immunization results" in multiple VistAs
Given a patient with pid "SITE;1" has been synced through Admin API
When the client requests immunization for the patient "SITE;1" in VPR format
Then a successful response is returned
Then corresponding matching records totaling "0" are displayed
