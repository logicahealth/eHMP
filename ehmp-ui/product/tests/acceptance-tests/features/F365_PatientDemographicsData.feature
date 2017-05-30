@F365 @PatientDemoData @reg2

Feature: F365 - Enhance Patient Header - Include Non-Local Demographics by Site

# POC: Team Saturn

@F365-3.OutPatientPanorama @US5116 @US5116a
	Scenario: UI indicates when patient data contains a discrepancy
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,patient"
	And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Patient (T0023)"

	And user selects Patient Demographic drop down
    Then the Patient's Home Phone is in acceptable format
    And the Patient's Cell Phone is in acceptable format
	And the Patient's Work Phone is in acceptable format
	And the Patient's "WPhone" indicates discrepant data
	And the Patient's "CPhone" does not indicate discrepant data

@F365-3.OutPatientPanorama @US5116 @US5587 @US4456 @DE1455
	Scenario: Patient Information: Demographic drop down "Data" in Panorama for Outpatient
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,patient"
    And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Patient (T0023)"
	And user selects Patient Demographic drop down
	Then the Patient's Home Address value is displayed
    And the Patient's Email value is displayed
    And the Patient's EM Contact Relationship value is displayed
    And the Patient's EM Contact Name value is displayed
    And the Patient's EM Home Phone value is displayed
    And the Patient's EM Work Phone value is displayed
    And the Patient's EM Home Address value is displayed
    And the Patient's NOK Relationship value is displayed
    And the Patient's NOK Name value is displayed
    And the Patient's NOK Home Phone value is displayed
    And the Patient's NOK Work Phone value is displayed
    And the Patient's NOK Home Address value is displayed
    And the Patient's Ins Service Connected value is displayed
    And the Patient's Ins Service Condition value is displayed
    And the Patient's Ins Service Insurance value is displayed
    And the Patient's Veteran status value is displayed
    And the Patient's Marital status value is displayed
    And the Patient's Religion value is displayed

@F365-3.InpatientPanorama @US5116 @US5587 @US4456 @F365-3.4 @DE3104
	Scenario:  Patient Information: Demographic drop down "Data" in Panorama for Inpatient
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,inpatient"
	And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Inpatient (T0823)"
    And user selects Patient Demographic drop down
    Then the Patient's Home Address value is displayed
    And the Patient's Email value is displayed
    And the Patient's EM Contact Relationship value is displayed
    And the Patient's EM Contact Name value is displayed
    And the Patient's EM Home Phone value is displayed
    And the Patient's EM Work Phone value is displayed
    And the Patient's EM Home Address value is displayed
    And the Patient's NOK Relationship value is displayed
    And the Patient's NOK Name value is displayed
    And the Patient's NOK Home Phone value is displayed
    And the Patient's NOK Work Phone value is displayed
    And the Patient's NOK Home Address value is displayed
    And the Patient's Ins Service Connected value is displayed
    And the Patient's Ins Service Condition value is displayed
    And the Patient's Veteran status value is displayed
    And the Patient's Marital status value is displayed
    And the Patient's Religion value is displayed

@F365-3.3_InPatientKodak2 @US5116 @US5587 @DE1309 @DE2103
	Scenario: Patient Information: Demographic drop down "Data" in Kodak for Inpatient
	When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Then staff view screen is displayed
    And user searches for and selects "twentythree,inpatient"
	And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Inpatient (T0823)"
	And Cover Sheet is active
	And user selects Patient Demographic drop down
	Then the Patient's Work Phone is in acceptable format
    And the Patient's Home Address value is displayed
    And the Patient's Email value is displayed
    And the Patient's NOK Relationship value is displayed
    And the Patient's NOK Name value is displayed
    And the Patient's NOK Home Phone value is displayed
    And the Patient's NOK Work Phone value is displayed
    And the Patient's NOK Home Address value is displayed
    And the Patient's Ins Service Connected value is displayed

@F365-3.3_InPatientKodak2 @US5116 @US5587 @DE1309 @DE2103 @future @DE4560
    Scenario: Patient Information: Demographic drop down "Data" in Kodak for Inpatient
    When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Then staff view screen is displayed
    And user searches for and selects "twentythree,inpatient"
    And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Inpatient (T0823)"
    And user selects Patient Demographic drop down
    Then the Patient's Veteran status value is displayed
    And the Patient's Marital status value is displayed
    And the Patient's Religion value is displayed    

@F365-3.4_OutPatientKodak @US5116 @US5587 @DE1309 @DE2103
	Scenario: Patient Information: Demographic drop down "Data" in Kodak for Outpatient
	When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Then staff view screen is displayed
    And user searches for and selects "twentythree,patient"
	And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Patient (T0023)"
	And user selects Patient Demographic drop down
	Then the Patient's Work Phone is in acceptable format
    And the Patient's Temporary Home Address value is displayed
    And the Patient's NOK Relationship value is displayed
    And the Patient's NOK Name value is displayed
    And the Patient's NOK Home Phone value is displayed
    And the Patient's NOK Work Phone value is displayed
    And the Patient's NOK Home Address value is displayed
    And the Patient's Ins Service Connected value is displayed
    And the Patient's Ins Service Condition value is displayed

@F365-3.4_OutPatientKodak @US5116 @US5587 @DE1309 @DE2103
    Scenario: Patient Information: Demographic drop down "Data" in Kodak for Outpatient
    When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Then staff view screen is displayed
    And user searches for and selects "twentythree,patient"
    And Cover Sheet is active
    And the Global Header displays the user name "Twentythree,Patient (T0023)"
    And user selects Patient Demographic drop down
    Then the Patient's Veteran status value is displayed
    And the Patient's Marital status value is displayed
    And the Patient's Religion value is displayed    
