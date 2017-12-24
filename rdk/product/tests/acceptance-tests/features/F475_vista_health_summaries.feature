@F475
Feature: Application UI Enhancements - F304 - Health Summaries (PSI7)

@US6563
Scenario: Client can query for Vista Health Summary info through the rdk
	Given a patient with pid "SITE;3" has been synced through the RDK API
    When the client requests health summaries for the patient "SITE;3"
    Then a successful response is returned
    And the health summaries response contains
    | path | value |
    | siteKey | SITE |
    And the health summaries response contains
    | path | value |
    | siteKey | SITE |