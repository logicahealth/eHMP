@writeback @future
Feature: F413 - Enter, Store Encounter Form - Procedures(CPT)

# There are two issues found in CPT write back 1- there is no error for depilation record. 2. the ime con not get the second like "20150911.145124"

@writeback 
Scenario: Client can write to the VistA and add CPT records
  Given a patient with pid "SITE;253" has been synced through VX-Sync API for "SITE;SITE;2939;FFC7;VLER" site(s)
  And the client requests "CPT" for the patient "SITE;253" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client add new CPT record using Encounter Form for patient with DFN "253" enter
    | field           | value                 |
    | procedure_code  | 86602                 |
    | procedure       | ANTINOMYCES ANTIBODY  |
    | modifiers       | 9D;2T;ET              |
    | entered         | 20150911.145115         |
    | provider        | USER,PANORAMA         |
    | quantity        | 3                     |
    | comment         | Test: this Actinomyces Antibody |
    
  Then the client receive the VistA write-back response
  And the new "CPT" record added for the patient "SITE;253" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field           | value                         |
    | name            | ANTINOMYCES ANTIBODY          |
    | cptCode         | CONTAINS 86602                |
    | quantity        | 3                             |
    | comment         | CONTAINS Test: this Actinomyces Antibody |
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
	
@writeback 
Scenario: Client can write to the VistA and add CPT records
	Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
	And the client requests "CPT" for the patient "SITE;66" in VPR format
	And save the totalItems
	And a client connect to VistA using "Panorama"
	When the client add new CPT record using Encounter Form for patient with DFN "66" enter
		| field 			    | value 	                      |
		| procedure_code	| 00580 		                    |
		| procedure       | ANESTH HEART/LUNG TRANSPLNT   |
		| modifiers  			| ET  	                        |
		| entered         | 20150825.1454                 |
		| provider        | USER,PANORAMA                 |
		| quantity        | 1 		                        |
		| comment			    | Test: this ANESTH HEART/LUNG TRANSPLNT |
		
	Then the client receive the VistA write-back response
	And the new "CPT" record added for the patient "SITE;66" in VPR format
	And the new write back record dispaly in VPR format with value of
		| field 			    | value 			                  |
		| name			      | ANESTH HEART/LUNG TRANSPLNT 	|
		| cptCode         | CONTAINS 00580                |
		| entered         | 201508251454                  |
		| quantity    		| 1  			                      |
		| comment			    | CONTAINS Test: this ANESTH HEART/LUNG TRANSPLNT |
	When the client use the vx-sync write-back to save the record
	Then the responce is successful
	
	
	# Using the same patient and same encounter code with different date
	When the client add new CPT record using Encounter Form for patient with DFN "66" enter
    | field           | value                         |
    | procedure_code  | 00580                         |
    | procedure       | ANESTH HEART/LUNG TRANSPLNT   |
    | modifiers       | ET                            |
    | entered         | 20150925.1454                 |
    | provider        | USER,PANORAMA                 |
    | quantity        | 1                             |
    | comment         | Test: this ANESTH HEART/LUNG TRANSPLNT |
    
  Then the client receive the VistA write-back response
  And the new "CPT" record added for the patient "SITE;66" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field           | value                         |
    | name            | ANESTH HEART/LUNG TRANSPLNT   |
    | cptCode         | CONTAINS 00580                |
    | entered         | 201509251454                  |
    | quantity        | 1                             |
    | comment         | CONTAINS Test: this ANESTH HEART/LUNG TRANSPLNT |
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
	
	
	# Using the same patient with different encounter code
	When the client add new CPT record using Encounter Form for patient with DFN "66" enter
	  | field           | value                         |
    | procedure_code  | D7290                         |
    | procedure       | REPOSITIONING OF TEETH        |
    | modifiers       | ET                            |
    | entered         | 20150825.1454                 |
    | provider        | USER,PANORAMA                 |
    | quantity        | 1                             |
    | comment         | Test: Surgical Repositioning of Teeth |
    
  Then the client receive the VistA write-back response
  And the new "CPT" record added for the patient "SITE;66" in VPR format
  And the new write back record dispaly in VPR format with value of
    | field           | value                         |
    | name            | REPOSITIONING OF TEETH        |
    | cptCode         | CONTAINS D7290                |
    | quantity        | 1                             |
    | comment         | CONTAINS Test: Surgical Repositioning of Teeth |
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
 
@writeback 
Scenario: Client should get error message if some invalid data entered to the VistA and add CPT records
  Given a patient with pid "SITE;66" has been synced through VX-Sync API for "SITE" site(s)
  And the client requests "CPT" for the patient "SITE;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Panorama"
  #wrong CPT code
  When the client add new CPT record using Encounter Form for patient with DFN "66" enter 
    | field           | value                         |
    | procedure_code  | 0058081                       |
    | procedure       | ANESTH HEART/LUNG TRANSPLNT   |
    | modifiers       | ET                            |
    | entered         | 20150819.1454                 |
    | provider        | USER,PANORAMA                 |
    | quantity        | 1                             |
    | comment         | Test: this ANESTH HEART/LUNG TRANSPLNT |
  Then the client receive the "Invalid CPT code" error message
  #wrong modifiers code
  When the client add new CPT record using Encounter Form for patient with DFN "66" enter 
    | field           | value                         |
    | procedure_code  | 00580                         |
    | procedure       | ANESTH HEART/LUNG TRANSPLNT   |
    | modifiers       |      4rtw                     |
    | entered         | 20150819.1454                 |
    | provider        | USER,PANORAMA                 |
    | quantity        | 1                             |
    | comment         | Test: this ANESTH HEART/LUNG TRANSPLNT |
  Then the client receive the "Invalid CPT modifier code" error message
  #Invalid provider
  When the client add new CPT record using Encounter Form for patient with DFN "66" enter 
    | field           | value                         |
    | procedure_code  | 00580                         |
    | procedure       | ANESTH HEART/LUNG TRANSPLNT   |
    | modifiers       | ET                            |
    | entered         | 20150819.1454                 |
    | provider        | Audiologist, One              |
    | quantity        | 1                             |
    | comment         | Test: this ANESTH HEART/LUNG TRANSPLNT |
  Then the client receive the "Invalid provider name" error message
  
   
	