@F365 @PatientDemoHeaders 

Feature: F365 - Enhance Patient Header - Include Non-Local Demographics by Site

# POC: Team Saturn 

@F365-2.1_DetailDialogOutpatient @US5116 @US4456
  Scenario: Patient Information: Demographic drop down "HEADERS" in Panorama for Outpatient
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,patient"
  And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Patient (T0023)"
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
      | Temporary	                      |
      | Relationship                    |
      | Name                            |
      | Service Connected               |
      | Service Connected Conditions    |
      | Insurance                       |
      | Veteran Status                  |
      | Marital Status                  |

@F365-2.1_DetailDialogInpatient @US5116 @US4456 @DE1309 @DE2154
Scenario: Patient Information: Demographic drop down "HEADERS" in Kodak for Inpatient
	Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Then staff view screen is displayed
  And user searches for and selects "twentythree,inpatient"
    And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Inpatient (T0823)"

  And user selects Patient Demographic drop down
  
  #group labels (In blue fonts)
  Then the Patient Information expanded area contains headers
      | headers                          |
      | Phone                            |
      | Addresses                        |
      | Email	                           |
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
      | Temporary	                      |
      | Relationship                    |
      | Name                            |
      | Service Connected               |
      | Service Connected Conditions    |
      | Insurance                       |


