@F1211
Feature: F1211 - Add Community Health information to patient record text search results
# RDK resource: patient-record-search-text

@US18356
Scenario: Verify RDK results return the highlighting and the authoring institute for Community Health Summary documents C32
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And solrSyncStatus is true
  When the client searches text for pid "9E7A;3" and query "summarization"
  Then a successful response is returned
  Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Summarization of episode note               |
    | institution         | HEALTHeLINK                                 |
    | highlights.body     | CONTAINS Summarization                      |

@US18356
Scenario: Verify RDK results return the highlighting and the authoring institute for Community Health Summary documents CCDA
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And solrSyncStatus is true
  When the client searches text for pid "9E7A;3" and query "continuity"
  Then a successful response is returned
  Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Continuity of Care Document                 | 
    | institution         | Epic CCDA Example 2                         |
    | highlights.body     | CONTAINS Continuity                         |

@US18356
Scenario: Verify RDK results return the highlighting and the authoring institute for Community Health Summary documents CCDA and C32 and search term synonyms are highlighted.
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And solrSyncStatus is true
  When the client searches text for pid "9E7A;3" and query "bp"
  Then a successful response is returned
  Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Summarization of episode note               | 
    | institution         | HEALTHeLINK                                 |
    | highlights.body     | CONTAINS <span class=\"cpe-search-term-match\">Point</span>|
   Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Continuity of Care Document                 | 
    | institution         | Epic CCDA Example 2                         |
    | highlights.body     | CONTAINS <span class=\"cpe-search-term-match\">Blood</span>   |
    | highlights.body     | CONTAINS <span class=\"cpe-search-term-match\">blood</span>   |
    | highlights.body     | CONTAINS <span class=\"cpe-search-term-match\">Pressure</span>|
    | highlights.body     | CONTAINS <span class=\"cpe-search-term-match\">pressure</span>|


