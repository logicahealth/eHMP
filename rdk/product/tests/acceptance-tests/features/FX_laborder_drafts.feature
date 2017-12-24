@F_draft_lab @JBPM @future
Feature: Activity drafts

@add_draft_orders
Scenario:  Client can save / find a draft lab orders action
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER    " has started an orders action for patient "SITE;100728" with parameters
      | parameters        | value                             |
      | patientUid        | urn:va:patient:SITE:100728:100728 |
      | authorUid         | urn:va:user:SITE:10000000016      |
      | availableLabTests | 3441                              |
      | labTestText       | 24 HR URINE PROTEIN               |
      | collectionType    | SP                                |
      | collectionSample  | 68                                |
      | specimen          | 8755                              |
      | displayName       | 24 HR URINE PROTEIN - ROUTINE     |
  And a successful response is returned
  And the successful response contains a processInstanceId

  When the user "SITE;USER    " requests order drafts for patient "SITE;100728"
      | parameters | value |
      | patientUid | urn:va:patient:SITE:100728:100728 |
      | authorUid  | urn:va:user:SITE:10000000016 |
  Then a successful response is returned
  And the order draft list contains the created lab order draft
      | parameter              | value                             |
      | patientUid             | urn:va:patient:SITE:100728:100728 |
      | authorUid              | urn:va:user:SITE:10000000016      |
      | data.availableLabTests | 3441                              |
      | data.labTestText       | 24 HR URINE PROTEIN               |
      | data.collectionType    | SP                                |
      | data.collectionSample  | 68                                |
      | data.specimen          | 8755                              |
      | displayName            | 24 HR URINE PROTEIN - ROUTINE     |

@read_draft_orders
Scenario: Client can read a lab draft
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER    " has started an orders action for patient "SITE;100728" with parameters
      | parameters        | value                             |
      | patientUid        | urn:va:patient:SITE:100728:100728 |
      | authorUid         | urn:va:user:SITE:10000000016      |
      | availableLabTests | 3441                              |
      | labTestText       | 24 HR URINE PROTEIN               |
      | collectionType    | SP                                |
      | collectionSample  | 68                                |
      | specimen          | 8755                              |
      | displayName       | 24 HR URINE PROTEIN - ROUTINE     |
  And a successful response is returned
  And the response contains a uid location

  When the user "SITE;USER    " reads the draft for patient "SITE;100728"
  Then a successful response is returned
  And the order draft list contains the created draft
      | parameter              | value                        |
      | authorUid              | urn:va:user:SITE:10000000016 |
      | data.availableLabTests | 3441                         |
      | data.labTestText       | 24 HR URINE PROTEIN          |
      | data.collectionType    | SP                           |
      | data.collectionSample  | 68                           |
      | data.specimen          | 8755                         |
      | displayName            | 24 HR URINE PROTEIN - ROUTINE|

@delete_draft_order
Scenario: Client can delete a lab draft
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER    " has started an orders action for patient "SITE;100728" with parameters
      | parameters        | value                             |
      | patientUid        | urn:va:patient:SITE:100728:100728 |
      | authorUid         | urn:va:user:SITE:10000000016      |
      | availableLabTests | 3441                              |
      | labTestText       | 24 HR URINE PROTEIN               |
      | collectionType    | SP                                |
      | collectionSample  | 68                                |
      | specimen          | 8755                              |
      | displayName       | 24 HR URINE PROTEIN - ROUTINE     |
  And a successful response is returned
  And the response contains a uid location
  When the user "SITE;USER    " deletes the lab order draft for patient "SITE;100728"
      | parameters        | value                             |
      | patientUid        | urn:va:patient:SITE:100728:100728 |
      | authorUid         | urn:va:user:SITE:10000000016      |
      | availableLabTests | 3441                              |
      | labTestText       | 24 HR URINE PROTEIN               |
      | collectionType    | SP                                |
      | collectionSample  | 68                                |
      | specimen          | 8755                              |
      | displayName       | 24 HR URINE PROTEIN - ROUTINE     |
  Then a successful response is returned
  And the order draft list for user "SITE;USER    " and patient "SITE;100728" does not contain the created draft
      | parameter              | value                        |
      | authorUid              | urn:va:user:SITE:10000000016 |
      | patientUid        | urn:va:patient:SITE:100728:100728 |