@writeback 
Feature: F423/F170 - Enter and Store Vitals and F170 - Vitals Write-Back EIE


@vital_writeback
Scenario: Client can write to the VistA and add Vital records - adding BLOOD PRESSURE to Panorama
  	Given a patient with pid "9E7A;66" has been synced through VX-Sync API for "9E7A" site(s)
  	And the client requests "VITALS" for the patient "9E7A;66" in VPR format
  	And save the totalItems
  	And a client connect to VistA using "PANORAMA"
	When the client add new Vital record for patient with DFN "66" 
	  	| field              | desc                 | value            |
    	| reference_date     |                      | 20151011.145151  |
	    | qualified_name     | BLOOD PRESSURE       | 1;               |
	    | result             |                      | 110/90           |
	Then the client receive the VistA write-back response
	And the new "Vital" record added for the patient "9E7A;66" in VPR format
	And VistA write-back generate a new localId with values record dispaly in VPR format
	    | field            | value            |
	    | qualifiedName    | BLOOD PRESSURE   |
	    | result           | 110/90           |
	    | uid              | CONTAINS 9E7A    |
	When the client use the vx-sync write-back to save the record
	Then the responce is successful
	
	#Test Vitals Write-Back EIE
	When the client marked the abvoe Vital record as Entered in Error with EIE Reason "INCORRECT DATE/TIME;1"
	Then the client receive the VistA write-back response
	And the above "Vital" record removed for the patient "9E7A;66"
	And the stamp time get update for recorde Entered in Error
	When the client use the vx-sync write-back to save the record
	Then the responce is successful
	
	
@vital_writeback
Scenario: Client can write to the VistA and add Vital records - adding TEMPERATURE to Kodak
	Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
	And the client requests "VITALS" for the patient "C877;66" in VPR format
	And save the totalItems
	And a client connect to VistA using "Kodak"
	When the client add new Vital record for patient with DFN "66" 
	    | field              | desc                 | value            |
	    | reference_date     |                      | 20151011.145151  |
	    | qualified_name     | BODY TEMPERATURE     | 2;               |
	    | result             |                      | 90               |
	Then the client receive the VistA write-back response
	And the new "Vital" record added for the patient "C877;66" in VPR format
	And VistA write-back generate a new localId with values record dispaly in VPR format
	    | field            | value            |
	    | qualifiedName    | TEMPERATURE      |
	    | result           | 90               |
	    | uid              | CONTAINS C877    |
	When the client use the vx-sync write-back to save the record
	Then the responce is successful
	
	#Test Vitals Write-Back EIE
	When the client marked the abvoe Vital record as Entered in Error with EIE Reason "INCORRECT READING;2"
	Then the client receive the VistA write-back response
	And the above "Vital" record removed for the patient "C877;66"
	And the stamp time get update for recorde Entered in Error
	When the client use the vx-sync write-back to save the record
	Then the responce is successful
	
	
@vital_writeback 
Scenario: Client can write to the VistA and add Vital records - TEMPERATURE - Patient with ICN
  Given a patient with pid "C877;253" has been synced through VX-Sync API for "9E7A;C877;2939;FFC7;VLER" site(s)
  And the client requests "VITALS" for the patient "C877;253" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client add new Vital record for patient with DFN "253" 
    | field              | desc                 | value            |
    | reference_date     |                      | 20151011.145151  |
    | qualified_name     | BODY TEMPERATUR      | 2;               |
    | result             |                      | 90               |
  Then the client receive the VistA write-back response
  And the new "Vital" record added for the patient "C877;253" in VPR format
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field            | value            |
    | qualifiedName    | TEMPERATURE      |
    | result           | 90               |
    | uid              | CONTAINS C877    |
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
  #Test Vitals Write-Back EIE
  When the client marked the abvoe Vital record as Entered in Error with EIE Reason "INCORRECT READING;2"
  Then the client receive the VistA write-back response
  And the above "Vital" record removed for the patient "C877;253"
  And the stamp time get update for recorde Entered in Error
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
	
