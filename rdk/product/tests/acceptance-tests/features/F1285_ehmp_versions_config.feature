@F1285
Feature: Edit Permission Set thru UI - ehmp-versions

@US19025_1
Scenario: Verify ehmp-versions request is included in the resource directory
    When client requests the patient resource directory in RDK format
    Then a successful response is returned
	  And the RDK response contains
      | field | value                                 |
      | title | ehmp-versions-list                    |
      | href  | CONTAINS ehmp-versions                |

@US19025_2
Scenario: Verify request returns success and hash containing key versions and id tag
    When the client requests the ehmp-versions
    Then a successful response is returned
    And the ehmp-versions has a key of "versions"
    And the ehmp-versions contains the attribute
      | attribute                  |
      | versions.id                |
