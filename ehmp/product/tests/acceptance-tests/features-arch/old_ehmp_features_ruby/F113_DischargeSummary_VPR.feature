@discharge_summary_vpr 
Feature: F113 Return Discharge Summary document in VPR format 

#This feature item returns the Discharge Summary document in VPR format


@f113_1_discharge_summary_vpr @vpr 
Scenario: Client can request Discharge Summary in VPR format
	Given a patient with "Discharge Summary" in multiple VistAs
      Given a patient with pid "10199V865898" has been synced through Admin API
	When the client requests document for the patient "10199V865898" in VPR format
	Then the client receives 22 VPR "VistA" result(s)
	Then the client receives 11 VPR "panorama" result(s)
	Then the VPR results contain:                                             
      | field                          | value                                                |
      | uid                            | urn:va:document:SITE:100012:3947                     |
      | summary                        | Discharge Summary                                    |
      | pid                            | CONTAINS ;100012                                          |
      | kind                           | Discharge Summary                                    |
      | urgency                        | routine                                              |
      | text.uid                       | urn:va:document:SITE:100012:3947                     |
      | text.summary                   | DocumentText{uid='urn:va:document:SITE:100012:3947'} |
      | text.dateTime                  | 20040325192854                                       |
      | text.status                    | COMPLETED                                            |
      | facilityCode                   | 998                                                  |
      | facilityName                   | ABILENE (CAA)                                        |
      | localId                        | 3947                                                 |
      | referenceDateTime              | 20040325192854                                       |
      | documentTypeCode               | DS                                                   |
      | documentTypeName               | Discharge Summary                                    |
      | documentClass                  | DISCHARGE SUMMARY                                    |
      | localTitle                     | Discharge Summary                                    |
      | status                         | COMPLETED                                            |
      | statusDisplayName              | Completed                                            |
      | text.content                   | CONTAINS Shortness of breath                         |
      | text.clinicians.uid            | urn:va:user:SITE:20012                               |
      | text.clinicians.summary        | DocumentClinician{uid='urn:va:user:SITE:20012'}      |
      | text.clinicians.name           | VEHU,TEN                                             |
      | text.clinicians.displayName    | Vehu,Ten                                             |
      | text.clinicians.role           | S                                                    |
      | clinicians.uid                 | urn:va:user:SITE:20012                               |
      | clinicians.summary             | DocumentClinician{uid='urn:va:user:SITE:20012'}      |
      | clinicians.name                | VEHU,TEN                                             |
      | clinicians.displayName         | Vehu,Ten                                             |
      | clinicians.role                | S                                                    |
      | signer                         | VEHU,TEN                                             |
      | signedDateTime                 | 20070529102712                                       |
      | text.clinicians.signedDateTime | 20070529102712                                       |
      | text.clinicians.signature      | CONTAINS TEN VEHU                                    |
      | clinicians.signedDateTime      | 20070529102712                                       |
      | clinicians.signature           | CONTAINS TEN VEHU                                    |
      | entered                        | 200705291027                                         |
      
@f113_2_discharge_summary_vpr @vpr 
Scenario: Client can request Discharge Summary in VPR format
	Given a patient with "Discharge Summary" in multiple VistAs
      Given a patient with pid "10199V865898" has been synced through Admin API
	When the client requests document for the patient "10199V865898" in VPR format
	Then the client receives 22 VPR "VistA" result(s)
	Then the client receives 11 VPR "kodak" result(s)
	Then the VPR results contain:
                                                      
      | field                          | value                                                |
      | uid                            | urn:va:document:SITE:100012:3947                     |
      | summary                        | Discharge Summary                                    |
      | pid                            | CONTAINS ;100012                                     |
      | kind                           | Discharge Summary                                    |
      | urgency                        | routine                                              |
      | text.uid                       | urn:va:document:SITE:100012:3947                     |
      | text.summary                   | DocumentText{uid='urn:va:document:SITE:100012:3947'} |
      | text.dateTime                  | 20040325192854                                       |
      | text.status                    | COMPLETED                                            |
      | facilityCode                   | 998                                                  |
      | facilityName                   | ABILENE (CAA)                                        |
      | localId                        | 3947                                                 |
      | referenceDateTime              | 20040325192854                                       |
      | documentTypeCode               | DS                                                   |
      | documentTypeName               | Discharge Summary                                    |
      | documentClass                  | DISCHARGE SUMMARY                                    |
      | localTitle                     | Discharge Summary                                    |
      | status                         | COMPLETED                                            |
      | statusDisplayName              | Completed                                            |
      | text.content                   | CONTAINS Shortness of breath                         |
      | text.clinicians.uid            | urn:va:user:SITE:20012                               |
      | text.clinicians.summary        | DocumentClinician{uid='urn:va:user:SITE:20012'}      |
      | text.clinicians.name           | VEHU,TEN                                             |
      | text.clinicians.displayName    | Vehu,Ten                                             |
      | text.clinicians.role           | S                                                    |
      | clinicians.uid                 | urn:va:user:SITE:20012                               |
      | clinicians.summary             | DocumentClinician{uid='urn:va:user:SITE:20012'}      |
      | clinicians.name                | VEHU,TEN                                             |
      | clinicians.displayName         | Vehu,Ten                                             |
      | clinicians.role                | S                                                    |
      | signer                         | VEHU,TEN                                             |
      | signedDateTime                 | 20070529102712                                       |
      | text.clinicians.signedDateTime | 20070529102712                                       |
      | text.clinicians.signature      | CONTAINS TEN VEHU                                    |
      | clinicians.signedDateTime      | 20070529102712                                       |
      | clinicians.signature           | CONTAINS TEN VEHU                                    |
      | entered                        | 200705291027                                         |
      | documentDefUid                 | urn:va:doc-def:SITE:1                                |
      | encounterUid                   | urn:va:visit:SITE:100012:3648                        |
      | encounterName                  | 7A GEN MED Mar 25, 2004                              |

# following 2 scenarios are checking for another patient for return of document results.
# only few fields are checked to validate data integrity.
                      
@f113_3_discharge_summary_vpr @vpr 
Scenario: Client can request Discharge Summary in VPR format
	Given a patient with "Discharge Summary" in multiple VistAs
      Given a patient with pid "SITE;1" has been synced through Admin API
	When the client requests document for the patient "SITE;1" in VPR format
	Then the client receives 106 VPR "VistA" result(s)
	Then the client receives 106 VPR "panorama" result(s)
	Then the VPR results contain:                                             
      | field                         	| value                                                	|
      | uid								| CONTAINS urn:va:document:SITE:1						|
      | summary							| Discharge Summary										|
      | signer							| PROVIDER,ONE											|
      | signedDateTime					| 19980511143236										|
      | urgency                        	| routine                                              	|
      | text.clinicians.uid            	| CONTAINS urn:va:user:SITE                             |
      | text.clinicians.summary        	| DocumentClinician{uid='urn:va:user:SITE:10958'}      	|
      | text.clinicians.name           	| WARDCLERK,FIFTYTHREE                                  |
      | clinicians.name                	| WARDCLERK,FIFTYTHREE                                  |
      | clinicians.displayName         	| Wardclerk,Fiftythree                                  |
      | clinicians.role                	| AU                                                    |
      | encounterUid                   	| urn:va:visit:SITE:1:1242                        		|
      | encounterName                  	| GEN MED Aug 13, 1991                              	|
      
@f113_4_discharge_summary_vpr @vpr 
Scenario: Client can request Discharge Summary in VPR format
	Given a patient with "Discharge Summary" in multiple VistAs
      Given a patient with pid "SITE;1" has been synced through Admin API
	When the client requests document for the patient "SITE;1" in VPR format
	Then the client receives 106 VPR "VistA" result(s)
	Then the client receives 106 VPR "kodak" result(s)
	Then the VPR results contain:                                             
      | field                         	| value                                                	|
      | uid								| CONTAINS urn:va:document:SITE:1						|
      | summary							| Discharge Summary										|
      | signer							| PROVIDER,ONE											|
      | signedDateTime					| 19980511143236										|
      | urgency                        	| routine                                              	|
      | text.clinicians.uid            	| CONTAINS urn:va:user:SITE                             |
      | text.clinicians.summary        	| DocumentClinician{uid='urn:va:user:SITE:10958'}      	|
      | text.clinicians.name           	| WARDCLERK,FIFTYTHREE                                  |
      | clinicians.name                	| WARDCLERK,FIFTYTHREE                                  |
      | clinicians.displayName         	| Wardclerk,Fiftythree                                  |
      | clinicians.role                	| AU                                                    |
      | encounterUid                   	| urn:va:visit:SITE:1:1242                        		|
      | encounterName                  	| GEN MED Aug 13, 1991                              	|
      
@f113_5_discharge_summary_neg_vpr @vpr	
Scenario: Negative scenario.  Client can request Discharge Summary in VPR format
Given a patient with "No Discharge Summary" in multiple VistAs
Given a patient with pid "SITE;100184" has been synced through Admin API
When the client requests document for the patient "SITE;100184" in VPR format
Then a successful response is returned
Then corresponding matching records totaling "0" are displayed
      
      
 