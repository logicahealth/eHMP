@F365 @PatientDemoHeaders @regression

Feature: F365 - Enhance Patient Header - Include Non-Local Demographics by Site

# POC: Team Saturn 

@F365-2.1_DetailDialogOutpatient @US5116 @US4456
  Scenario: Patient Information: Demographic drop down "HEADERS" in Panorama for Outpatient
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,patient"
#	And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient		|
    And Cover Sheet is active
    And user selects Patient Demographic drop down
  
    #group labels (In blue fonts)
    Then the Patient Information expanded area contains headers
      | headers                          |
      | Phone                            |
      | Addresses                        |
      | Email	                         |
      | Emergency Contact                |
      | Next of Kin                      |
      | Email                            |
      | Health Benefits and Insurance    |
      | Service and Social History       |

    #Field labels
    And the Patient Information expanded area contains fields
      | headers                         |
      | Home                            |
      | Cell                            |
      | Work                            |
      | Temporary	                    |
      | Relationship                    |
      | Name                            |
      | Service Connected               |
      | Service Connected Conditions    |
      | Insurance                       |
      | Veteran Status                  |
      | Marital Status                  |

@F365-2.1_DetailDialogInpatient @US5116 @US4456 @DE1309 @DE2154
	Scenario: Patient Information: Demographic drop down "HEADERS" in Kodak for Inpatient
	When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    And user searches for and selects "twentythree,inpatient"
	And Cover Sheet is active
	And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Inpatient		|
	And Cover Sheet is active
    And user selects Patient Demographic drop down
  
    #group labels (In blue fonts)
    Then the Patient Information expanded area contains headers
      | headers                          |
      | Phone                            |
      | Addresses                        |
      | Email	                         |
      | Emergency Contact                |
      | Next of Kin                      |
      | Email                            |
      | Health Benefits and Insurance    |

    #Field labels
    And the Patient Information expanded area contains fields
      | headers                         |
      | Home                            |
      | Cell                            |
      | Work                            |
      | Temporary	                    |
      | Relationship                    |
      | Name                            |
      | Service Connected               |
      | Service Connected Conditions    |
      | Insurance                       |
#      | Veteran Status                  |
#      | Marital Status                  |
#      | Religion                        |

