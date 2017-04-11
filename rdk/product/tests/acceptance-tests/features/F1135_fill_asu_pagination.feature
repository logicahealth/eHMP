@F1135
Feature: Respond with the number of items that were requested after filtering

  @US17184
  Scenario: Fill ASU pagination for documents resource
    Given a patient with pid "9E7A;100125" has been synced through the RDK API
    And the patient with pid "9E7A;100125" has at least 7 documents
    When the client gets a document-view request with parameters
      | parameter | value       |
      | pid       | 9E7A;100125 |
      | limit     | 2           |
    Then a successful response is returned
    And the response contains 2 items
    And the response contains
      | field            | value |
      | startIndex       | 0     |
      | pageIndex        | 0     |
      | currentItemCount | 2     |
      | itemsPerPage     | 2     |
      | nextStartIndex   | 2     |

    When the client gets a document-view request with parameters
      | parameter | value       |
      | pid       | 9E7A;100125 |
      | start     | 2           |
      | limit     | 2           |
    Then a successful response is returned
    And the response contains 2 items
    And the response contains
      | field            | value |
      | startIndex       | 2     |
      | pageIndex        | 1     |
      | currentItemCount | 2     |
      | itemsPerPage     | 2     |
      | nextStartIndex   | 5     |

    When the client gets a document-view request with parameters
      | parameter | value       |
      | pid       | 9E7A;100125 |
      | start     | 5           |
      | limit     | 2           |
    Then a successful response is returned
    And the response contains 2 items
    And the response contains
      | field            | value |
      | startIndex       | 5     |
      | pageIndex        | 2     |
      | currentItemCount | 2     |
      | itemsPerPage     | 2     |
      | nextStartIndex   | 7     |

    When the client gets a document-view request with parameters
      | parameter | value       |
      | pid       | 9E7A;100125 |
      | start     | TOTAL_ITEMS |
      | limit     | 2           |
    Then a successful response is returned
    And the response contains 0 items
    And the response contains
      | field            | value |
      | startIndex       | IS_SET|
      | pageIndex        | IS_SET|
      | currentItemCount | 0     |
      | itemsPerPage     | 2     |
      | nextStartIndex   | IS_SET|

    When the client gets a document-view request with parameters
      | parameter | value       |
      | pid       | 9E7A;100125 |
      | start     | 4           |
      | limit     | 2           |
    Then a successful response is returned
    And the response contains 2 items
    And the response contains
      | field            | value |
      | startIndex       | 4     |
      | pageIndex        | 2     |
      | currentItemCount | 2     |
      | itemsPerPage     | 2     |
      | nextStartIndex   | 6     |
