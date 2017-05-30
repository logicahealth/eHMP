@DiscrepantDataIndicator @F365  @DE4560 @reg2

Feature: F365 - Enhance Patient Header - Include Non-Local Demographics by Site

# POC: Team Saturn
@F365-4.1_DiscrepantDataOutPatientKodak @US4456 @US5587 @US5078 @DE1309 @DE1545 @DE2154
	Scenario: Discrepancy icon in demographic drop down for Outpatient in Kodak
	When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Then staff view screen is displayed
    And user searches for and selects "twentythree,patient"
	And Cover Sheet is active
    And "Current Patient:" is displayed as "Twentythree, patient"
    And user selects Patient Demographic drop down
	Then the Discrepant Data indicator icon displays for "HPhone"
	And the Discrepant Data indicator icon displays for "CPhone"
	And the Discrepant Data indicator icon displays for "WPhone"
	And the Discrepant Data indicator icon displays for "HAddress"
	And the Discrepant Data indicator icon displays for "Email"
	And the Discrepant Data indicator icon displays for "EmergencyContact"
	And the Discrepant Data indicator icon displays for "NextOfKin"
	And the Discrepant Data indicator icon does not displays for "TAddress"

@F365-4.2_DiscrepantDataInPatientKodak @US4456 @US5587 @US5078 @DE1309 @DE1601 @DE2154
	Scenario: Discrepancy icon in demographic drop down for Inpatient in Kodak
	When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "REDACTED" verifycode as  "REDACTED"
    Then staff view screen is displayed
    And user searches for and selects "Twentythree,inpatient"
	And Cover Sheet is active
    And "Current Patient:" is displayed as "Twentythree, Inpatient"
	And user selects Patient Demographic drop down
	Then the Discrepant Data indicator icon displays for "HPhone"
	And the Discrepant Data indicator icon displays for "CPhone"
	And the Discrepant Data indicator icon displays for "WPhone"
	And the Discrepant Data indicator icon displays for "HAddress"
	And the Discrepant Data indicator icon displays for "Email"
	And the Discrepant Data indicator icon displays for "EmergencyContact"
    And the Discrepant Data indicator icon displays for "NextOfKin"
    And the Discrepant Data indicator icon does not displays for "TAddress"

@F365-4.3_DiscrepantDataOutPatientPanorama @US4456 @US5587 @US5078
	Scenario: Discrepancy icon in demographic drop down for Outpatient in Panorama
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,patient"
	And Cover Sheet is active
    And "Current Patient:" is displayed as "Twentythree, patient"
    And user selects Patient Demographic drop down
    And the Discrepant Data indicator icon displays for "WPhone"
    And the Discrepant Data indicator icon displays for "TAddress"
    And the Discrepant Data indicator icon displays for "NextOfKin"
    And the Discrepant Data indicator icon does not displays for "HPhone"
    And the Discrepant Data indicator icon does not displays for "CPhone"
    And the Discrepant Data indicator icon does not displays for "HAddress"
    And the Discrepant Data indicator icon does not displays for "EmergencyContact"
    And the Discrepant Data indicator icon does not displays for "Email"

@F365-4.1_DiscrepantDataInPatientPanorama @US4456 @US5587 @US5078
	Scenario: Discrepancy icon in demographic drop down for Inpatient in Panorama
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,inpatient"
	And Cover Sheet is active
    And "Current Patient:" is displayed as "Twentythree, Inpatient"
    And user selects Patient Demographic drop down
    Then the Discrepant Data indicator icon displays for "HPhone"
    And the Discrepant Data indicator icon displays for "CPhone"
    And the Discrepant Data indicator icon displays for "WPhone"
    And the Discrepant Data indicator icon displays for "HAddress"
    And the Discrepant Data indicator icon displays for "Email"
    And the Discrepant Data indicator icon displays for "NextOfKin"
    And the Discrepant Data indicator icon does not displays for "TAddress"
    And the Discrepant Data indicator icon does not displays for "EmergencyContact"