# Team Europa
@manual @future
Feature: F166 - User invoked clinical decision support (CDS)

@US3810_RuleInvocation @manual
Scenario: User invokes a rule through SoapUI and a successful response is received
		Given CDS invocation source code is available
		And Tomcat is running 
		And SoapUI is configured	
		When user invokes a rule through SoapUI
		Then a successful response is received and viewed in SoapUI 

@US3793_DataPassthrough @US3798 @US3794 @manual
Scenario: User sends request and response is received and logged in to centralized logging service
		Given cdsinvocation vm is running
		When user send request using postman
		Then response is received 
    And request and response are logged in to centralized logging service

@US3086_PatientRuleExecution @manual
Scenario: User invokes a rule through postman and a successful response is received
		Given cdsinvocation and opencds virtual machines are running
		When user posts uri and payload in postman
		Then a successful response is received and viewed in postman
    
@US4065_ErrorHandling_Code0 @manual
Scenario: User invokes a rule through postman and error code 0 is returned for Successful response
    Given jds, cdsinvocation and opencds virtual machines are running
    When user runs valid query with valid payload in postman
    Then a successful response is received with error code 0 in response

@US4065_ErrorHandling_Code1 @manual
Scenario: User invokes a rule through postman and error code 1 is returned for invalid Use type
    Given jds, cdsinvocation and opencds virtual machines are running
    When user runs query with invalid reason value in payload through postman
    Then an error message is returned with error code 1 in response

@US4065_ErrorHandling_Code3 @manual
Scenario: User invokes a rule through postman and error code 3 is returned for invalid data
    Given jds, cdsinvocation and opencds virtual machines are running
    When user runs query with invalid patientId value in payload through postman
    Then an error message is returned with error code 3 in response
    
@US4065_ErrorHandling_Code5 @manual
Scenario: User invokes a rule through postman and error code 5 is returned when opencds is down
    Given cdsinvocation and jds virtual machines are running and opencds is not running
    When user runs valid query with valid payload in postman
    Then an error message is returned with error code 5 in response
  
@US4065_ErrorHandling_Code7 @manual
Scenario: User invokes a rule through postman and error code 7 is returned when JDS is down
    Given cdsinvocation and opencds virtual machines are running and Jds is not running
    When user runs valid query with valid payload in postman
    Then an error message is returned with error code 7 in response

@US3087_MultipleEngineSupport1 @manual
Scenario: User invokes a rule with Family Medicine reason
    Given cdsinvocation and opencds virtual machines are running
    When user invokes FamilyMedicine rule in postman
    Then a successful response is returned from engine 

@US3087_MultipleEngineSupport2 @manual
Scenario: User invokes a rule with Occupational Medicine reason
    Given cdsinvocation and opencds virtual machines are running
    When user invokes OccupationalMedicine rule in postman
    Then a successful response is returned from engine 