@F1240
Feature: SDK Component Creation: Assign To

@US18345
Scenario: Permission set endpoints are included in the resource directory
	When client requests the patient resource directory in RDK format
	Then a successful response is returned
	And the RDK response contains
      | field      | value                            |
      | title      | permission-sets-bulk-edit        |
	And the RDK response contains
      | field      | value                            |
      | title      | permission-sets-edit             |