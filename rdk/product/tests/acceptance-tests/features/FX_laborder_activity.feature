@F_start_lab__order_activity @JBPM @future
Feature: Start A New Lab Order Activity

@start_lab_order_activity @debug @DE8044
Scenario:  Client can start a new lab order activity
  Given a patient with pid "SITE;8" has been synced through the RDK API
  When the "SITE;USER  " client requests tasks instances for "patient" and "teamroles" for patient "SITE;8"
  Then the user notes the number of tasks returned
  And the user "SITE;USER  " has started a lab order activity for patient "SITE;8" and provider "10000000272" with parameters
      | parameters        | value                             |
      | pid 		          | SITE:8                            |
      | patientUid        | urn:va:patient:SITE:8:8           |
      | authorUid         | urn:va:user:SITE:10000000272      |
      | availableLabTests | 536                               |
      | labTestText       | ALCOHOL PROFILE                   |
      | collectionType    | SP                                |
      | collectionSample  | 1                                 |
      | specimen          | 72                                |
      | displayName       | ALCOHOL PROFILE - ROUTINE         |
      | inputValue4       | 536                               |
      | inputValue126     | 1                                 |
      | inputValue127     | 72                                |
      | inputValue180     | 9                                 |
      | inputValue28      | SP                                |
      | inputValue6       | TODAY                             |
  And a successful response is returned
  And the response contains a lab order id
  Then the "SITE;USER  " client waits for updated tasks instances for "patient" and "teamroles" for patient "SITE;8"
  And the task associated with the lab order has
      | parameter          | value                            |
      | ASSIGNEDTO         | SITE;10000000272,                |
      | TASKNAME           | Sign                             |
      | STATUS             | Reserved                         |
      | DEFINITIONID       | Lab.Sign                         |
      | INSTANCENAME       | ALCOHOL PROFILE                  |
  When the user deletes the lab order
  Then a successful response is returned
