@F883 @JBPM @future
Feature: Triage a Consult Order
# Sep 6 421

@signed_consult_in_tasks
Scenario:
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "REDACTED" has started a consult with parameters
      | parameters                   | value                                      |
      | icn                          | 9E7A;100728                                |
      | assignedTo                   | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:9E7A:10000000272               |
      | executionUserName            | KHAN, VIHAAN                               |
      | formAction                   | accepted                                   |
      | orderingProvider displayName | KHAN, VIHAAN                               |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272               |
      | destination facility code    | 500                                        |
      | destination facility name    | PANORAMA                                   |
  And a successful response is returned
  And the successful response contains a processInstanceId 

  When the "REDACTED" client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the task associated with the processInstanceId has
      | parameter          | value                                      |
      | ASSIGNEDTO         | 9E7A;10000000272,                          |
      | TASKNAME           | Sign Consult                               |
      | STATUS             | Reserved                                   |
      | DEFINITIONID       | Consult.Sign                               |
      | ACTIVITYASSIGNEDTO | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |

  When the "REDACTED" client requests the sign update start
      | parameter                    | value                        |
      | icn                          | 9E7A;100728                  |
      | state                        | start                        |
   Then a successful response is returned

  When the "REDACTED" client signs the consult order
      | parameter | value                        |
      | pid       | 9E7A;100728                  |
      | site      | 9E7A                         |
      | uid       | urn:va:user:9E7A:10000000272 |
      | duz site  | 9E7A                         |
      | duz id    | 10000000272                  |
      | facility  | PANORAMA                     |
      | firstname | VIHAAN                       |
      | lastname  | KHAN                         |
      | division  | 500 |
  Then a successful response is returned
  And the response reports valid signature
  When the "REDACTED" client requests the task is updated to be signed
      | parameter                    | value                        |
      | patient_pid                  | 9E7A;100728                  |
      | icn                          | 9E7A;100728                  |
      | executionUserId              | urn:va:user:9E7A:10000000272 |
      | executionUserName            | KHAN, VIHAAN                 |
      | formAction                   | accepted                     |
      | orderingProvider displayName | KHAN, VIHAAN                 |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272 |
      | state                        | complete                     |
  Then a successful response is returned

  When the "REDACTED" client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the task associated with the processInstanceId has
    | parameter  | value |


@eConsult @DE6792
Scenario: 
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user REDACTED has created and signed a consult for patient "9E7A;100728"
  And the user "REDACTED" signals to activate order
      | parameter | value                        |
      | userId    | urn:va:user:9E7A:10000000272 |
    
  When the user "REDACTED" requests to update task to eConsult (start)
      | parameter          | value            |
      | icn                | 9E7A;100728      |
      | state              | start            |

  Then a successful response is returned
  When the user "REDACTED" requests to update task to eConsult
      | parameter                    | value                        |
      | icn                          | 9E7A;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | KHAN, VIHAAN                 |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272 |
      | formAction                   | eConsult                     |
      | executionUserId              | urn:va:user:9E7A:10000000271 |
      | executionUserName            | XIU, MARGARET                |
      | destination facility code    | 500                                        |
      | destination facility name    | PANORAMA                                   |
  Then a successful response is returned

  When the "REDACTED" client requests tasks instances for "patient" and "teamroles" for patient "9E7A;100728"
  Then a successful response is returned
  And the task associated with the processInstanceId has
  | parameter  | value             |
  | TASKNAME   | Complete Consult  |
  | DEFINITIONID | Consult.Complete |

@return_for_clarafication
Scenario: 
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user REDACTED has created and signed a consult for patient "9E7A;100728"
  And the user "REDACTED" signals to activate order
      | parameter | value                        |
      | userId    | urn:va:user:9E7A:10000000272 |
  When the user "REDACTED" requests to update task to Return for Clarafication (start)
      | parameter          | value            |
      | icn                | 9E7A;100728      |
      | state              | start            |
  Then a successful response is returned
  When the user "REDACTED" requests to update task to Return for Clarafication
      | parameter                    | value                        |
      | icn                          | 9E7A;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | KHAN, VIHAAN                 |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272 |
      | executionUserId              | urn:va:user:9E7A:10000000271 |
      | executionUserName            | XIU, MARGARET                |
      | formAction                   | clarification                |
      | formComment                  | Test Question                |
  Then a successful response is returned


@Referred_to_community_care
Scenario:
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user REDACTED has created and signed a consult for patient "9E7A;100728"
  And the user "REDACTED" signals to activate order
      | parameter | value                        |
      | userId    | urn:va:user:9E7A:10000000272 |
  When the user "REDACTED" requests to update task to Referred to Community Care (start)
      | parameter          | value            |
      | icn                | 9E7A;100728      |
      | state              | start            |
  Then a successful response is returned
  When the user "REDACTED" requests to update task to Referred to Community Care
      | parameter                    | value                        |
      | icn                          | 9E7A;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | KHAN, VIHAAN                 |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272 |
      | executionUserId              | urn:va:user:9E7A:10000000271 |
      | executionUserName            | XIU, MARGARET                |
      | formAction                   | communityCare                |
      | communityCareStatus          | scheduled                    |
      | communityCareType            | Sharing agreement            |
  Then a successful response is returned

@assign_to_triage_memeber
Scenario: 
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user REDACTED has created and signed a consult for patient "9E7A;100728"

  When the user "REDACTED" requests to update task to Assign to triage member (start)
      | parameter                    | value                        |
      | icn                          | 9E7A;100728                  |
      | state                        | start                        |
  Then a successful response is returned
  When the user "REDACTED" requests to update task to Assign to triage member
      | parameter                     | value                        |
      | icn                           | 9E7A;100728                  |
      | state                         | complete                     |
      | acceptingProvider displayName | EHMP, UATTWO (Physician)     |
      | acceptingProvider uid         | urn:va:user:9E7A:10000000236 |
      | executionUserId               | urn:va:user:9E7A:10000000271 |
      | executionUserName             | XIU, MARGARET                |
      | formAction                    | assigned                     |
      | destination facility code     | 500                          |
      | destination facility name     | PANORAMA                     |
      | orderingProvider displayName  | KHAN, VIHAAN                 |
      | orderingProvider uid          | urn:va:user:9E7A:10000000272 |
  Then a successful response is returned

@send_to_scheduling
Scenario: 
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user REDACTED has created and signed a consult for patient "9E7A;100728"
  When the user "REDACTED" requests to update task to Send to Scheduling (start)
      | parameter                    | value                        |
      | icn                          | 9E7A;100728                  |
      | state                        | start                        |
  Then a successful response is returned
  When the user "REDACTED" requests to update task to Send to Scheduling
      | parameter                    | value                        |
      | icn                          | 9E7A;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | KHAN, VIHAAN                 |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272 |
      | executionUserId              | urn:va:user:9E7A:10000000271 |
      | executionUserName            | XIU, MARGARET                |
      | destination facility code    | 500                          |
      | destination facility name    | PANORAMA                     |
      | orderingProvider displayName | KHAN, VIHAAN                 |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272 |
      | formAction                   | triaged                      |
  Then a successful response is returned