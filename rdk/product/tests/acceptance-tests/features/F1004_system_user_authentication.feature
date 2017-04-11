@F1004_external_systems_provisioning @F868_internal_systems_provisioning @DE4928
Feature: provide internal (F868) and external (F1004) login services.

	@F868 @internal_system_authentication_api_1 @DE4928 
	Scenario Outline: An Untrusted system can not authenticate and has no ehmp session
		Given "<systemname>" attempts to establish an "<systemtype>" session with the resource server
		And an unauthorized response is returned
				
		Examples:
		| systemname	| systemtype 	| 
		| LOKI			| internal 		| 

	@F868 @internal_system_authentication_api_2 @DE4928 
	Scenario Outline: Trusted system can authenticate and establish an ehmp session
		Given "<systemname>" attempts to establish an "<systemtype>" session with the resource server
		Then a successful response is returned
		And the authentication result contains
		| field			| value		|
		| name			| JBPM 		|
		| consumerType 	| system 	|
		
		Examples:
		| systemname	| systemtype 	|
		| JBPM			| internal 	 	|
	
	@F868 @internal_system_authentication_api_3 @DE4928
	Scenario Outline: Trusted system can refresh an established session
		Given "<systemname>" attempts to refresh an "<systemtype>" session with the resource server
		Then a successful response is returned
		And the authentication result contains
		| field			| value		|
		| name			| JBPM 		|
		| consumerType 	| system 	|
		
		Examples:
		| systemname	| systemtype 	|
		| JBPM			| internal 		|

	@F868 @internal_system_authentication_api_4 @DE4928
	Scenario Outline: Trusted system can request to end the session 
		Given "<systemname>" attempts to destroy an "<systemtype>" session with the resource server
		Then a successful response is returned
		
		Examples:
		| systemname	| systemtype 	|
		| JBPM			| internal 		|
