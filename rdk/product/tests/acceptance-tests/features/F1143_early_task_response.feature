@F_tasks @JBPM @future
Feature: Allow early response to tasks

@early_task_response
Scenario:
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity assigned to a person in the future with parameters
   | parameter        | value |
   | patient_facility | SITE  |
   | patient_id       | 100728    |
   | assignedToFac    | SITE  |
   | assignedToUser   | 10000000270 |
   | full_assignedTo  | SITE;10000000270 |
   | authorFac        | SITE  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
  And a successful response is returned
  And the successful response contains a processInstanceId
  When the client requests tasks instances for "patient" and "any" for patient "SITE;100728"
  Then a successful response is returned
  # And print response
  And the task associated with the processInstanceId has
  | parameter           | value              |
  | ASSIGNEDTO          | SITE;10000000270,  |
  | BEFOREEARLIESTDATE  | true               |
