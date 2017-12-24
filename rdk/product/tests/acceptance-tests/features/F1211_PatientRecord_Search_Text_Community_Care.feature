@F1211
Feature: F1211 - Add Community Health information to patient record text search results
# RDK resource: patient-record-search-text

@US18356
Scenario: Verify RDK results return the highlighting and the authoring institute for Community Health Summary documents C32
  Given a patient with pid "SITE;3" has been synced through the RDK API
  And solrSyncStatus is true
  When the client searches text for pid "SITE;3" and query "summarization"
  Then a successful response is returned
  Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Summarization of episode note               |
    | institution         | HEALTHeLINK                                 |
    | highlights.body     | CONTAINS Summarization                      |

@US18356
Scenario: Verify RDK results return the highlighting and the authoring institute for Community Health Summary documents CCDA
  Given a patient with pid "SITE;3" has been synced through the RDK API
  And solrSyncStatus is true
  When the client searches text for pid "SITE;3" and query "continuity"
  Then a successful response is returned
  Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Continuity of Care Document                 | 
    | institution         | Epic CCDA Example 2                         |
    | highlights.body     | CONTAINS Continuity                         |

@US18356
Scenario: Verify RDK results return the highlighting and the authoring institute for Community Health Summary documents CCDA and C32 and search term synonyms are highlighted.
  Given a patient with pid "SITE;3" has been synced through the RDK API
  And solrSyncStatus is true
  When the client searches text for pid "SITE;3" and query "bp"
  Then a successful response is returned
  Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Summarization of episode note               | 
    | institution         | HEALTHeLINK                                 |
    | highlights.body     | CONTAINS {{addTag \"Point\" \"mark" \"cpe-search-term-match\"}}|
   Then the VPR results contain
    | field               | value                                       |
    | kind                | Community Health Summaries                  |
    | summary             | Continuity of Care Document                 | 
    | institution         | Epic CCDA Example 2                         |
    | highlights.body     | CONTAINS {{addTag \"Blood\" \"mark" \"cpe-search-term-match\"}}   |
    | highlights.body     | CONTAINS {{addTag \"blood\" \"mark" \"cpe-search-term-match\"}}   |
    | highlights.body     | CONTAINS {{addTag \"Pressure\" \"mark" \"cpe-search-term-match\"}}|
    | highlights.body     | CONTAINS {{addTag \"pressure\" \"mark" \"cpe-search-term-match\"}}|
