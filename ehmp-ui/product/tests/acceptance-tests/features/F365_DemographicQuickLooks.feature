@F365 @DemographicQuickLooks @regression @future @DE4560
Feature: F365 - Enhance Patient Header - Include Non-Local Demographics by Site
# POC: Team Saturn

  @F365-5.1_DemographicQuickLooks1 @US5692 @US5461 @US5537
  Scenario: Patient Work Phone Demographic Quick Looks (Panorama)
    When user searches for and selects "twentythree,patient"
    And Overview is active
    And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient   |
    And user selects Patient Demographic drop down
    And the user clicks on the "WPhone" decrepancy button
    Then the "WPhone" decrepant information is displayed
    And the user clicks on the "WPhone" decrepancy button
    And the "WPhone" decrepant information is hidden

  @F365-5.2_DemographicQuickLooks2 @US5692 @US5461 @US5456
  Scenario: Patient Address Demographic Quick Looks (Panorama)
    When user searches for and selects "twentythree,patient"
    And Overview is active
    And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient   |
    And user selects Patient Demographic drop down
    And the user clicks on the "TAddress" decrepancy button
    Then the "TAddress" decrepant information is displayed
    And the user clicks on the "TAddress" decrepancy button
    And the "TAddress" decrepant information is hidden

  @F365-5.1_DemographicQuickLooks3 @US5692 @US5461
  Scenario: Patient Next Of Kin Demographic Quick Looks (Panorama)
	# Given user is logged into eHMP-UI
	When user searches for and selects "twentythree,patient"
	And Overview is active
    And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient   |
    And user selects Patient Demographic drop down
    And the user clicks on the "NextOfKin" decrepancy button
    Then the "NextOfKin" decrepant information is displayed
    And the user clicks on the "NextOfKin" decrepancy button
    And the "NextOfKin" decrepant information is hidden

  @F365-5.2_DemographicQuickLooks4.1 @US5692 @US5461 @DE1309 @DE1545 @non_default_login @DE2154
  Scenario: Patient Home Phone Demographic Quick Looks (Kodak)
	Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    When user searches for and selects "twentythree,patient"
	And Cover Sheet is active
	And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient   |
    And user selects Patient Demographic drop down
    And the user clicks on the "HPhone" decrepancy button
    Then the "HPhone" decrepant information is displayed
    And the user clicks on the "HPhone" decrepancy button
    And the "HPhone" decrepant information is hidden

  @F365-5.2_DemographicQuickLooks4.1 @US5692 @US5461 @DE1309 @DE1545 @non_default_login @DE2154
  Scenario: Patient Cell Phone Demographic Quick Looks (Kodak)
    Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    When user searches for and selects "twentythree,patient"
    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
      | field			| value 				|
      | patient name	| Twentythree,Patient   |
#    And Cover Sheet is active
    And user selects Patient Demographic drop down
    And the user clicks on the "CPhone" decrepancy button
    Then the "CPhone" decrepant information is displayed
    And the user clicks on the "CPhone" decrepancy button
    And the "CPhone" decrepant information is hidden

  @F365-5.2_DemographicQuickLooks5 @US5692 @US5461 @DE1309 @DE1545 @non_default_login
  Scenario: Patient Address Demographic Quick Looks (Kodak)
	Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    When user searches for and selects "twentythree,patient"
    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient   |
#    And Cover Sheet is active
    And user selects Patient Demographic drop down
    And the user clicks on the "HAddress" decrepancy button
    Then the "HAddress" decrepant information is displayed
    And the user clicks on the "HAddress" decrepancy button
    And the "HAddress" decrepant information is hidden

  @F365-5.2_DemographicQuickLooks6 @US5692 @US5461 @DE1309 @DE1592 @non_default_login @DE2154
  Scenario: Patient Email Demographic Quick Looks (Kodak)
	Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    When user searches for and selects "twentythree,patient"
    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient   |
#    And Cover Sheet is active
    And user selects Patient Demographic drop down
    And the user clicks on the "Email" decrepancy button
    Then the "Email" decrepant information is displayed
    And the user clicks on the "Email" decrepancy button
    And the "Email" decrepant information is hidden

  @F365-5.2_DemographicQuickLooks7 @US5692 @US5461  @DE1309 @DE1601 @non_default_login @DE2154
  Scenario: Patient Emergency Contact Demographic Quick Looks (Kodak)
	Given POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    When user searches for and selects "twentythree,patient"
    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
	| field			| value 				|
	| patient name	| Twentythree,Patient   |
#    And Cover Sheet is active
    And user selects Patient Demographic drop down
    And the user clicks on the "EmergencyContact" decrepancy button
    Then the "EmergencyContact" decrepant information is displayed
    And the user clicks on the "EmergencyContact" decrepancy button
    And the "EmergencyContact" decrepant information is hidden

