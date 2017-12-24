@F414
Feature:  verify new persons picklist used by add problems functionality

Scenario:
  When the user requests new persons
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

Scenario:
  When the user requests new persons
      | parameter_name | parameter_value |
      | site           | bad_site        |
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

Scenario:
  When the user requests new persons
      | parameter_name | parameter_value |
      | site           | SITE            |
  Then a successful response is returned
  And the picklist teams response contains
      | key               |
      | code              |
      | name              |
