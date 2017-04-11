@F_tasks @JBPM @future
Feature: Update tasks

@update_clarification @verify
Scenario: 
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "9E7A;1tdnurse" has started an activity assigned to a person with parameters
      | parameter        | value            |
      | patient_facility | 9E7A             |
      | patient_id       | 100728           |
      | assignedToFac    | 9E7A             |
      | assignedToUser   | 10000000270      |
      | full_assignedTo  | 9E7A;10000000270 |
      | authorFac        | 9E7A             |
      | authorId         | 10000000016      |
      | authorName       | TDNURSE,ONE      |

  When the client requests tasks instances for "patient" and "any" for patient "9E7A;100728"
  Then a successful response is returned
  And the task associated with the processInstanceId has
  | parameter  | value |
  | ASSIGNEDTO | 9E7A;10000000270,  |
  When the "9E7A;pu1234" client requests the task is updated to be clarafication
      | parameter          | value            |
      | patient_pid        | 9E7A;100728      |
      | initiator          | 10000000016      |
      | route_facility     | 500              |
      | route_person       | 9E7A;10000000016 |
      | out_formAction     | start            |
      | state              | start            |
  Then a successful response is returned
  When the "9E7A;pu1234" client requests the task is updated to be clarafication
      | parameter          | value            |
      | patient_pid        | 9E7A;100728      |
      | initiator          | 10000000016      |
      | route_facility     | 500              |
      | route_person       | 9E7A;10000000016 |
      | out_formAction     | accepted         |
      | state              | complete         |
  Then a successful response is returned
  When the client requests tasks instances for "patient" and "any" for patient "9E7A;100728"
  Then a successful response is returned
  And the task associated with the processInstanceId has
  | parameter  | value |
  | ASSIGNEDTO | 9E7A;10000000016,  |
  And the task result contains
  | parameter | value |
  | variables.name | state |
  | variables.value | Active: Clarification Requested |

 
 @update_decline
 Scenario: 
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity assigned to a person with parameters
   | parameter        | value |
   | patient_facility | 9E7A  |
   | patient_id       | 100728     |
   | assignedToFac    | 9E7A  |
   | assignedToUser   | 10000000270 |
   | full_assignedTo  | 9E7A;10000000270 |
   | authorFac        | 9E7A  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
  And a successful response is returned
  And the successful response contains a processInstanceId
  When the client requests tasks instances for "patient" and "any" for patient "9E7A;100728"
  Then a successful response is returned
  And the task associated with the processInstanceId has
  | parameter  | value |
  | ASSIGNEDTO | 9E7A;10000000270,  |

  When the "9E7A;pu1234" client requests the task is updated to be declined
      | parameter          | value            |
      | patient_pid        | 9E7A;100728      |
      | initiator          | 10000000016      |
      | route_facility     | 500              |
      | route_person       | 9E7A;10000000016 |
      | out_formAction     | start            |
      | state              | start            |
  Then a successful response is returned
  When the "9E7A;pu1234" client requests the task is updated to be declined
      | parameter          | value            |
      | patient_pid        | 9E7A;100728      |
      | initiator          | 10000000016      |
      | route_facility     | 500              |
      | route_person       | 9E7A;10000000016 |
      | out_formAction     | accepted         |
      | state              | complete         |
  Then a successful response is returned

  When the "9E7A;pu1234" client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the response does not contain the processInstanceId

  When the "9E7A;1tdnurse" client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the task associated with the processInstanceId has
    | parameter  | value |
    | ASSIGNEDTO | 9E7A;10000000016,  |
  And the task result contains
    | parameter       | value |
    | variables.name  | state |
    | variables.value | Active: Declined |

@update_complete
Scenario:
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity assigned to me with parameters
      | parameter        | value            |
      | patient_facility | 9E7A             |
      | patient_id       | 100728           |
      | assignedToFac    | 9E7A             |
      | assignedToUser   | 10000000016      |
      | full_assignedTo  | 9E7A;10000000016 |
      | authorFac        | 9E7A             |
      | authorId         | 10000000016      |
      | authorName       | TDNURSE,ONE      |
  Then a successful response is returned
  And the successful response contains a processInstanceId
  When the client requests tasks instances for "patient" and "any" for patient "9E7A;100728"
  Then a successful response is returned
  And the task associated with the processInstanceId has
      | parameter  | value |
      | ASSIGNEDTO | 9E7A;10000000016,  |

  When the "9E7A;1tdnurse" client requests the task is updated to be marked as complete
      | parameter      | value       |
      | patient_pid    | 9E7A;100728 |
      | initiator      | 10000000016 |
      | full_assignedTo| 9E7A;10000000016 |
      | out_formAction | start       |
      | state          | start       |
  Then a successful response is returned
  When the "9E7A;1tdnurse" client requests the task is updated to be marked as complete
      | parameter      | value       |
      | patient_pid    | 9E7A;100728 |
      | initiator      | 10000000016 |
      | full_assignedTo| 9E7A;10000000016 |
      | out_formAction | accepted    |
      | state          | complete    |
  Then a successful response is returned
  When the client requests tasks instances for "patient" and "any" for patient "9E7A;100728"
  Then a successful response is returned
  And the response does not contain the processInstanceId


@update_reassign
Scenario:
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity assigned to me with parameters
   | parameter        | value |
   | patient_facility | 9E7A  |
   | patient_id       | 100728    |
   | assignedToFac    | 9E7A  |
   | assignedToUser   | 10000000016 |
   | full_assignedTo  | 9E7A;10000000016 |
   | authorFac        | 9E7A  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
  And a successful response is returned
  And the successful response contains a processInstanceId
  When the client requests tasks instances for "patient" and "any" for patient "9E7A;100728"
  Then a successful response is returned
  And print response
  And the task associated with the processInstanceId has
  | parameter  | value |
  | ASSIGNEDTO | 9E7A;10000000016,  |

  When the "9E7A;1tdnurse" client requests the task is updated for reassignment to 
      | parameter      | value            |
      | route_facility | 500              |
      | route_person   | 9E7A;10000000270 |
      | assigned_to    | 10000000270      |
      | patient_pid    | 9E7A;100728      |
      | initiator      | 10000000016      |
      | out_formAction | start            |
      | state          | start            |
   Then a successful response is returned

   When the "9E7A;1tdnurse" client requests the task is updated for reassignment to 
      | parameter      | value            |
      | route_facility | 500              |
      | route_person   | 9E7A;10000000270 |
      | assigned_to    | 10000000270      |
      | patient_pid    | 9E7A;100728      |
      | initiator      | 10000000016      |
      | out_formAction | accepted         |
      | state          | complete         |
  Then a successful response is returned

  When the client requests tasks instances for "patient" and "any" for patient "9E7A;100728"
  Then a successful response is returned
  And the task associated with the processInstanceId has
  | parameter  | value |
  | ASSIGNEDTO | 9E7A;10000000270,  |

  And the task result contains
    | parameter       | value |
    | variables.name  | state |
    | variables.value | Active: Reassign |