@F365 @PatientDemographics @regression

Feature: F365 - Enhance Patient Header - Include Non-Local Demographics by Site

# POC: Team Saturn

@F365-1.1_InpatientHeader @US5182 @US5780
Scenario: Verify patient label correctly displays Inpatient and Age is in correct format
	When user searches for and selects "twentythree,inpatient"
#	Then Default Screen is active
	Then the Patient's Name is "Twentythree,Inpatient"
	And the Patient's Status is "Inpatient"
	And the Patient's DOB is in format MM/DD/YYYY (AGEy)
	 
@F365-2.1_OutpatientHeader @US5182 @US5780
Scenario: Verify patient label correctly displays Outpatient and Age is in correct format
	When user searches for and selects "Twentythree,Patient"
#	Then Default Screen is active
	Then the Patient's Name is "Twentythree,Patient"
	And the Patient's Status is "Outpatient"
	And the Patient's DOB is in format MM/DD/YYYY (AGEy)
