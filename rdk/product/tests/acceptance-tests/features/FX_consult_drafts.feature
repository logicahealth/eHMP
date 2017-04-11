@F_draft @JBPM @future
Feature: Activity drafts


@add_draft_consult
Scenario:  Client can save / find a draft consult action
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "9E7A;1tdnurse" has started a consult draft with parameters
      | parameters                   | value                                                         |
      | icn                          | 9E7A;100728                                                   |
      | assignedTo                   | [FC:PANORAMA -PAN- COLVILLE- WA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:9E7A:10000000016                                  |
      | executionUserName            | TDNURSE, ONE                                                  |
      | formAction                   | saved                                                         |
      | orderingProvider displayName | TDNURSE, ONE                                                  |
      | orderingProvider uid         | urn:va:user:9E7A:10000000016                                  |  
  And a successful response is returned
  And the successful response contains a processInstanceId

  When the user "9E7A;1tdnurse" requests activity drafts for patient "9E7A;100728"
      | parameters | value |
      | patientUid | urn:va:patient:9E7A:100728:100728 |
      | authorUid  | urn:va:user:9E7A:10000000016 |
  Then a successful response is returned
  And the draft list contains the created draft
      | parameter                            | value        |
      | data.consultOrders.executionUserName | TDNURSE, ONE |

@read_draft_consult
Scenario:  Client can read a consult draft
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "9E7A;1tdnurse" has started a consult draft with parameters
      | parameters                   | value                                                         |
      | icn                          | 9E7A;100728                                                   |
      | assignedTo                   | [FC:PANORAMA (PAN) COLVILLE, WA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:9E7A:10000000016                                  |
      | executionUserName            | TDNURSE, ONE                                                  |
      | formAction                   | saved                                                         |
      | orderingProvider displayName | TDNURSE, ONE                                                  |
      | orderingProvider uid         | urn:va:user:9E7A:10000000016                                  |  
  And a successful response is returned
  And the successful response contains a processInstanceId
  When the user "9E7A;1tdnurse" reads the consult draft for patient "9E7A;100728"
  Then a successful response is returned
  And the order draft list contains the created consult draft
      | parameter                                                  | value                                                         |
      | icn                                                        | 9E7A;100728                                                   |
      | assignedTo                                                 | [FC:PANORAMA (PAN) COLVILLE, WA(500)/TF:Physical Therapy(81)] |
      | consultClinicalObject.data.consultOrders.executionUserId   | urn:va:user:9E7A:10000000016                                  |
      | consultClinicalObject.data.consultOrders.executionUserName | TDNURSE, ONE                                                  |
      | formAction                                                 | saved                                                         |
      | consultOrder.orderingProvider.displayName                  | TDNURSE, ONE                                                  |
      | consultOrder.orderingProvider.uid                          | urn:va:user:9E7A:10000000016                                  |

@delete_draft_consult
Scenario: Client can delete a consult draft
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "9E7A;1tdnurse" has started a consult draft with parameters
      | parameters                   | value                                                         |
      | icn                          | 9E7A;100728                                                   |
      | assignedTo                   | [FC:PANORAMA -PAN- COLVILLE- WA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:9E7A:10000000016                                  |
      | executionUserName            | TDNURSE, ONE                                                  |
      | formAction                   | saved                                                         |
      | orderingProvider displayName | TDNURSE, ONE                                                  |
      | orderingProvider uid         | urn:va:user:9E7A:10000000016                                  |  
  And a successful response is returned
  And the successful response contains a processInstanceId
  When the user "9E7A;1tdnurse" deletes a consult draft with parameters
      | parameters | value |
      | uid  | urn:va:user:9E7A:10000000016                                  |
      | displayName | TDNURSE, ONE                                                  |
      | executionUserName                  | TDNURSE, ONE                                                  |

  Then a successful response is returned
  And the consult draft list for user "9E7A;1tdnurse" and patient "9E7A;100728" does not contain the created draft
      | parameter              | value                        |
      | patientUid | urn:va:patient:9E7A:100728:100728 |
      | authorUid  | urn:va:user:9E7A:10000000016 |
