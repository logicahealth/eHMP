@F744
Feature: Basic Military History

@F744_get
Scenario: Request Basic Military History
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests patient meta data (basic military history) for patient "SITE;3"
  Then a successful response is returned 

@F744_edit
Scenario: Edit Basic Military History
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client updates patient meta data ( basic military history) for patient "SITE;3"
      | key       | value                        |
      | appletId  | military_hist                |
      | name      | Branch of Service            |
      | siteHash  | SITE                         |
      | touchedBy | urn:va:user:SITE:10000000270 |
  And a successful response is returned 
  When the client requests patient meta data (basic military history) for patient "SITE;3"
  Then the successful response contains updated response
      | key       | value                        |
      | val.appletId  | military_hist                |
      | val.name      | Branch of Service            |
      | val.siteHash  | SITE                         |
      | val.touchedBy | urn:va:user:SITE:10000000270 |