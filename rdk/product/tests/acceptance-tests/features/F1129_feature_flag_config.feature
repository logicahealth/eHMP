@F1129
Feature: Patient Record Search Status (SOLR sync status)

@US17285 @US17367 @US17285_1 @US17367_1
Scenario: Verify ehmp-config request is included in the resource directory
    When client requests the patient resource directory in RDK format
    Then a successful response is returned
	And the RDK response contains
      | field | value                                 |
      | title | ehmp-config                           |
      | href  | CONTAINS configuration/ehmp-config    |

@US17285 @US17285_2
Scenario: Verify feature flag request returns success and hash containing featureFlags tag
    When the client requests the ehmp-config
    Then a successful response is returned
    And the ehmp-config has a key of "featureFlags"

@US17367 @US17367_2
Scenario: Verify request returns success and hash containing settings tag
    When the client requests the ehmp-config
    Then a successful response is returned
    And the ehmp-config has a key of "settings"
    And the ehmp-config contains the attribute
      | attribute                  |
      | settings.solrIndexingDelay |
