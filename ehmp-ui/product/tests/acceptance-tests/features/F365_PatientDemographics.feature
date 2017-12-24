@F365 @PatientDemographics 

Feature: F365 - Enhance Patient Header - Include Non-Local Demographics by Site

# POC: Team Saturn

@F365-1.1_InpatientHeader @US5182 @US5780
Scenario: Verify patient label correctly displays Inpatient and Age is in correct format
	When user searches for and selects "twentythree,inpatient"
    Then Overview is active
    And the Patient View Current Patient displays the user name "Twentythree,Inpatient (T0823)"
	And the Patient's Status is "Inpatient"
	And the Patient's DOB is in format MM/DD/YYYY (AGEy)
	 
@F365-2.1_OutpatientHeader @US5182 @US5780
Scenario: Verify patient label correctly displays Outpatient and Age is in correct format
	When user searches for and selects "Twentythree,Patient"
    Then Overview is active
    And the Patient View Current Patient displays the user name "Twentythree,Patient (T0023)"

	And the Patient's Status is "Outpatient"
	And the Patient's DOB is in format MM/DD/YYYY (AGEy)
