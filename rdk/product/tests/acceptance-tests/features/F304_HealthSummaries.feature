#Team Orion
@F304_HealthSummaries
Feature: F304 - Health Summaries (VistA Web Health Exchange)

@US4748 @F304-1.6 @F304-3.3 @F304-2.4 @F304-2.5
Scenario: Authentication error message received when the RDK endpoint URL is not authenticated
	Given a patient "EIGHTEEN,IMAGEPATIENT"
	Then authentication error returned for an unauthenticated user

@US4748 @F304-1.6 @F304-3.3 @F304-2.4 @F304-2.5
Scenario: Error message received when the RDK endpoint URL is without pid
	Given a patient "EIGHTEEN,IMAGEPATIENT"
	And a request data was sent without pid
	Then validation error message returned

@US4748 @F304-1.6 @F304-3.3 @F304-2.4 @F304-2.5
Scenario: Error message received when the RDK endpoint URL is with bad pid
	Given a patient "EIGHTEEN,IMAGEPATIENT"
    And a request data was sent with bad pid "9E7A;0000"

	Then the error message returned

@US4748 @F304-1.1 @F304-1.3 @F304-1.2 @F304-3.4 @F304-2.3
Scenario: JSON data with VistA sites information received when the RDK endpoint URL with correct pid
	Given a patient "EIGHTEEN,IMAGEPATIENT"
	And a request data was sent with pid "9E7A;3"
	Then correct JSON data returned

@US4748 @F304-1.3 @F304-1.1  @F304-3.4 @F304-2.3
Scenario: JSON data with VistA Primary Sites information received when the RDK endpoint URL with correct pid
    Given a patient "EIGHTEEN,IMAGEPATIENT"
    And a request data was sent with pid "9E7A;3"
    Then correct JSON data of primary sites returned

#@US4748 
#Scenario: JSON data with VistA non-Primary Sites information received when the RDK endpoint URL with correct pid
 #   Given a patient "EIGHTEEN,IMAGEPATIENT"
 #   And a request data was sent with pid "9E7A;3"
 #   Then correct JSON data of non-primary sites returned

@US4750 @F304-1.1 @F304-1.2 @F304-1.3 @F304-3.4 @F304-2.3 @DE2926
Scenario: The patient HS report received when the RDK endpoint URL within correct parameters
    Given a patient "EIGHTEEN,IMAGEPATIENT"
    And a HS report request was sent with patientID "10108V420871", siteID "9E7A", reportID "10;BRIEF CLINICAL"
    Then patient HS report returned

@US4750 @F304-1.6 @F304-3.3 @F304-2.4 @F304-2.5
Scenario: Error message received when the RDK endpoint request for report content is without patient ID
    Given a patient "EIGHTEEN,IMAGEPATIENT"
    And a HS report request was sent with reportID "12;INPATIENT", siteID "9E7A"
    Then the patient id missing error message returned

@US4750 @F304-1.6 @F304-3.3 @F304-2.4 @F304-2.5
Scenario: Error message received when the RDK endpoint request for report content is without site ID
    Given a patient "EIGHTEEN,IMAGEPATIENT"
    And a HS report request was sent with reportID "12;INPATIENT", patientID "9E7A;3"
    Then the site id missing error message returned

@US4750 @F304-1.6 @F304-3.3 @F304-2.4 @F304-2.5
Scenario: Error message received when the RDK endpoint request for report content is without report ID
    Given a patient "EIGHTEEN,IMAGEPATIENT"
    And a HS report request was sent with siteID "9E7A", patientID "9E7A;3"
    Then the report id missing error message returned

@US4750 @F304-1.6 @F304-3.3 @F304-2.4 @F304-2.5
Scenario: Error message received when the RDK endpoint request for report content is without report ID
    Given a patient "EIGHTEEN,IMAGEPATIENT"
    And a HS report request was sent with siteID "9E7A", patientID "9E7A;3", and reportID "12" without report title
    Then the report title missing error message returned