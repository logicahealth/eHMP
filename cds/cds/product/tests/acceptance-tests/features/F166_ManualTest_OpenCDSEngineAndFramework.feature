@F166_OpenCDSEngineAndFramework @future
Feature: OpenCDS Engine and Invocation Framework (CDS)

Background: 
	Given OpenCDS source code is available
	And Tomcat is running and communicating with OpenCDS
	And SoapUI is configured for OpenCDS

@US2889_RulesEngineIntegration @US3774 @manual 
Scenario: User invokes a rule through SoapUI and a successful response is received
	When user invokes a rule through SoapUI
	Then a successful response is received and viewd in SoapUI 

@US2890_ImmunizationEngineIntegration_WithOpenCDS @manual
Scenario: User invokes a rule through SoapUI and a successful response is received
	And ICE source code is available
	When user invokes a rule through SoapUI
	Then a successful response is received and viewd in SoapUI 






