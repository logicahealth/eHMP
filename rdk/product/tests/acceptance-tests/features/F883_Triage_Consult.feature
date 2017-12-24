@F883 @JBPM @future
Feature: Triage a Consult Order
# Sep 6 421

@signed_consult_in_tasks
Scenario:
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER  " has started a consult with parameters
      | parameters                   | value                                      |
      | icn                          | SITE;100728                                |
      | assignedTo                   | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:SITE:10000000272               |
      | executionUserName            | LAST, FIRST                               |
      | formAction                   | accepted                                   |
      | orderingProvider displayName | LAST, FIRST                               |
      | orderingProvider uid         | urn:va:user:SITE:10000000272               |
      | destination facility code    | 500                                        |
      | destination facility name    | PANORAMA                                   |
  And a successful response is returned
  And the successful response contains a processInstanceId 

  When the "SITE;USER  " client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the task associated with the processInstanceId has
      | parameter          | value                                      |
      | ASSIGNEDTO         | SITE;10000000272,                          |
      | TASKNAME           | Sign Consult                               |
      | STATUS             | Reserved                                   |
      | DEFINITIONID       | Consult.Sign                               |
      | ACTIVITYASSIGNEDTO | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |

  When the "SITE;USER  " client requests the sign update start
      | parameter                    | value                        |
      | icn                          | SITE;100728                  |
      | state                        | start                        |
   Then a successful response is returned

  When the "SITE;USER  " client signs the consult order
      | parameter | value                        |
      | pid       | SITE;100728                  |
      | site      | SITE                         |
      | uid       | urn:va:user:SITE:10000000272 |
      | duz site  | SITE                         |
      | duz id    | 10000000272                  |
      | facility  | PANORAMA                     |
      | firstname | FIRST                       |
      | lastname  | LAST                         |
      | division  | 500 |
  Then a successful response is returned
  And the response reports valid signature
  When the "SITE;USER  " client requests the task is updated to be signed
      | parameter                    | value                        |
      | patient_pid                  | SITE;100728                  |
      | icn                          | SITE;100728                  |
      | executionUserId              | urn:va:user:SITE:10000000272 |
      | executionUserName            | LAST, FIRST                 |
      | formAction                   | accepted                     |
      | orderingProvider displayName | LAST, FIRST                 |
      | orderingProvider uid         | urn:va:user:SITE:10000000272 |
      | state                        | complete                     |
  Then a successful response is returned

  When the "SITE;USER  " client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the task associated with the processInstanceId has
    | parameter  | value |


@eConsult @DE6792
Scenario: 
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user SITE;USER   has created and signed a consult for patient "SITE;100728"
  And the user "SITE;USER  " signals to activate order
      | parameter | value                        |
      | userId    | urn:va:user:SITE:10000000272 |
    
  When the user "SITE;USER  " requests to update task to eConsult (start)
      | parameter          | value            |
      | icn                | SITE;100728      |
      | state              | start            |

  Then a successful response is returned
  When the user "SITE;USER  " requests to update task to eConsult
      | parameter                    | value                        |
      | icn                          | SITE;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | LAST, FIRST                 |
      | orderingProvider uid         | urn:va:user:SITE:10000000272 |
      | formAction                   | eConsult                     |
      | executionUserId              | urn:va:user:SITE:10000000271 |
      | executionUserName            | LAST,FIRST                |
      | destination facility code    | 500                                        |
      | destination facility name    | PANORAMA                                   |
  Then a successful response is returned

  When the "SITE;USER  " client requests tasks instances for "patient" and "teamroles" for patient "SITE;100728"
  Then a successful response is returned
  And the task associated with the processInstanceId has
  | parameter  | value             |
  | TASKNAME   | Complete Consult  |
  | DEFINITIONID | Consult.Complete |

@return_for_clarafication
Scenario: 
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user SITE;USER   has created and signed a consult for patient "SITE;100728"
  And the user "SITE;USER  " signals to activate order
      | parameter | value                        |
      | userId    | urn:va:user:SITE:10000000272 |
  When the user "SITE;USER  " requests to update task to Return for Clarafication (start)
      | parameter          | value            |
      | icn                | SITE;100728      |
      | state              | start            |
  Then a successful response is returned
  When the user "SITE;USER  " requests to update task to Return for Clarafication
      | parameter                    | value                        |
      | icn                          | SITE;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | LAST, FIRST                 |
      | orderingProvider uid         | urn:va:user:SITE:10000000272 |
      | executionUserId              | urn:va:user:SITE:10000000271 |
      | executionUserName            | LAST,FIRST                |
      | formAction                   | clarification                |
      | formComment                  | Test Question                |
  Then a successful response is returned


@Referred_to_community_care
Scenario:
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user SITE;USER   has created and signed a consult for patient "SITE;100728"
  And the user "SITE;USER  " signals to activate order
      | parameter | value                        |
      | userId    | urn:va:user:SITE:10000000272 |
  When the user "SITE;USER  " requests to update task to Referred to Community Care (start)
      | parameter          | value            |
      | icn                | SITE;100728      |
      | state              | start            |
  Then a successful response is returned
  When the user "SITE;USER  " requests to update task to Referred to Community Care
      | parameter                    | value                        |
      | icn                          | SITE;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | LAST, FIRST                 |
      | orderingProvider uid         | urn:va:user:SITE:10000000272 |
      | executionUserId              | urn:va:user:SITE:10000000271 |
      | executionUserName            | LAST,FIRST                |
      | formAction                   | communityCare                |
      | communityCareStatus          | scheduled                    |
      | communityCareType            | Sharing agreement            |
  Then a successful response is returned

@assign_to_triage_memeber
Scenario: 
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user SITE;USER   has created and signed a consult for patient "SITE;100728"

  When the user "SITE;USER  " requests to update task to Assign to triage member (start)
      | parameter                    | value                        |
      | icn                          | SITE;100728                  |
      | state                        | start                        |
  Then a successful response is returned
  When the user "SITE;USER  " requests to update task to Assign to triage member
      | parameter                     | value                        |
      | icn                           | SITE;100728                  |
      | state                         | complete                     |
      | acceptingProvider displayName | EHMP, UATTWO (Physician)     |
      | acceptingProvider uid         | urn:va:user:SITE:10000000236 |
      | executionUserId               | urn:va:user:SITE:10000000271 |
      | executionUserName             | LAST,FIRST                |
      | formAction                    | assigned                     |
      | destination facility code     | 500                          |
      | destination facility name     | PANORAMA                     |
      | orderingProvider displayName  | LAST, FIRST                 |
      | orderingProvider uid          | urn:va:user:SITE:10000000272 |
  Then a successful response is returned

@send_to_scheduling
Scenario: 
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user SITE;USER   has created and signed a consult for patient "SITE;100728"
  When the user "SITE;USER  " requests to update task to Send to Scheduling (start)
      | parameter                    | value                        |
      | icn                          | SITE;100728                  |
      | state                        | start                        |
  Then a successful response is returned
  When the user "SITE;USER  " requests to update task to Send to Scheduling
      | parameter                    | value                        |
      | icn                          | SITE;100728                  |
      | state                        | complete                     |
      | orderingProvider displayName | LAST, FIRST                 |
      | orderingProvider uid         | urn:va:user:SITE:10000000272 |
      | executionUserId              | urn:va:user:SITE:10000000271 |
      | executionUserName            | LAST,FIRST                |
      | destination facility code    | 500                          |
      | destination facility name    | PANORAMA                     |
      | orderingProvider displayName | LAST, FIRST                 |
      | orderingProvider uid         | urn:va:user:SITE:10000000272 |
      | formAction                   | triaged                      |
  Then a successful response is returned