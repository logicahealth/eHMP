@F1285
Feature: Edit Permission Set thru UI - permission set categories

@US19016_1 @US18970
Scenario: Verify permission set categories request is included in the resource directory
    When client requests the patient resource directory in RDK format
    Then a successful response is returned
	  And the RDK response contains
      | field | value                                 |
      | title | permission-sets-categories            |
      | href  | CONTAINS permission-sets/categories   |

@US19016_2 @US18970
Scenario: Verify request returns success and hash containing lable and value tags
    When the client requests the permission set categories
    Then a successful response is returned
    And the permission set categories contain the attributes
      | attribute                  |
      | items.label                |
      | items.value                |
