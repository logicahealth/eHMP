@writeback 
Feature: F360 - Enter and Store Immunizations

@writeback_immunization
Scenario: Client can write to the VistA and add Immunizations records
	Given a patient with pid "C877;253" has been synced through VX-Sync API for "9E7A;C877;HDR;VLER" site(s)
	And the client requests "Immunizations" for the patient "C877;253" in VPR format
	And save the totalItems
	And a client connect to VistA using "Kodak"
	When the client add new Immunization record for patient with DFN "253" enter
		| field 			    | desc 				              | value |
		| contra			    | ANTHRAX VACCINE SC OR IM  | 41 		|
		| series  			  | booster 			            | b 		|
		| reaction 			  | 					                | Fever |
		| contraindicated | true 				              | 1 		|
		| comment			    | 					                | Test: this patient got ANTHRAX |
		
	Then the client receive the VistA write-back response
	And the new "Immunization" record added for the patient "C877;253" in VPR format
	And VistA write-back generate a new localId with values record dispaly in VPR format
		| field 			      | value 					         |
		| cptName			      | ANTHRAX VACCINE SC OR IM |
		| reactionName      | FEVER						         |
		| contraindicated   | true						         |
		| comment			      | CONTAINS Test: this patient got ANTHRAX |
	When the client use the vx-sync write-back to save the record
	Then the responce is successful
	
	
@writeback_immunization 
Scenario: Client can write to the VistA and add Immunizations records
	Given a patient with pid "9E7A;66" has been synced through VX-Sync API for "9E7A" site(s)
	And the client requests "Immunizations" for the patient "9E7A;66" in VPR format
	And save the totalItems
	And a client connect to VistA using "Panorama"
	When the client add new Immunization record for patient with DFN "66" enter
		| field 			    | desc 				     | value 	  |
		| contra			    | MUMPS VACCINE SC | 15 		  |
		| series  			  | SERIES 3 		     | 3 		    |
		| reaction 			  | 					       | Vomiting |
		| contraindicated | false				     | 0 		    |
		| comment			    | 					       | Test: this patient got MUMPS VIRUS VACCINE |
		
	Then the client receive the VistA write-back response
	And the new "Immunization" record added for the patient "9E7A;66" in VPR format
	And VistA write-back generate a new localId with values record dispaly in VPR format
		| field 			    | value 			      |
		| cptName			    | MUMPS VACCINE SC 	|
		| seriesName  		| SERIES 3 			    |
		| reactionName 		| VOMITING			    |
		| contraindicated | false				      |
		| comment			    | CONTAINS Test: this patient got MUMPS VIRUS VACCINE |
	When the client use the vx-sync write-back to save the record
	Then the responce is successful


@writeback_immunization 
Scenario: Client can not duplicate the same Immunizations to the same patient in VistA
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "Immunizations" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When the client add new Immunization record for patient with DFN "66" enter
    | field           | desc             | value    |
    | contra          | MUMPS VACCINE SC | 15       |
    | series          | SERIES 3         | 3        |
    | reaction        |                  | Vomiting |
    | contraindicated | false            | 0        |
    | comment         |                  | Test: this patient got MUMPS VIRUS VACCINE |
    
  Then the client receive the VistA write-back response
  And the new "Immunization" record added for the patient "C877;66" in VPR format
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field           | value             |
    | cptName         | MUMPS VACCINE SC  |
    | seriesName      | SERIES 3          |
    | reactionName    | VOMITING          |
    | contraindicated | false             |
    | comment         | CONTAINS Test: this patient got MUMPS VIRUS VACCINE |
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  
  Given the client requests "Immunizations" for the patient "C877;66" in VPR format
  When the client add same Immunization record for patient with DFN "66" enter
    | field           | desc             | value    |
    | contra          | MUMPS VACCINE SC | 15       |
    | series          | SERIES 3         | 3        |
    | reaction        |                  | Vomiting |
    | contraindicated | false            | 0        |
    | comment         |                  | Test: this patient got MUMPS VIRUS VACCINE |
  Then the client receive the VistA write-back response
  Then the client receive the error message
		