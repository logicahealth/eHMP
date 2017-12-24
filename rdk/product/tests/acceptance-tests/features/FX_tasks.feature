@F_tasks @JBPM @future
Feature: Tasks

@F_tasks_list_user
Scenario Outline: Get a list of tasks based on given context
  When the client requests tasks instances for "<context>" and "<subContext>"
  Then a successful response is returned

Examples:
  | context | subContext |
  | user    | teamroles  |
  | user    | teams      |


@F_tasks_list_patient
Scenario Outline: Get a list of tasks based on given context
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests tasks instances for "<context>" and "<subContext>" for patient "SITE;3"
  Then a successful response is returned

Examples:
  | context | subContext |
  | patient    | teamroles  |
  | patient    | teams      |
  | patient    | any        |

@F_tasks_me
Scenario:
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  When the client starts an activity on patient "SITE;100728"
  Then a successful response is returned
  And the response contains a process instance id
  When the client requests tasks instances for "user" and "teamroles" for patient "SITE;100728"
  Then a successful response is returned
  And the response contains tasks
  And the response contains a task for the new process instance id

@F_tasks_get_task
Scenario: tasks-gettask
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And there is at least 1 task
  When the client requests a specific task
  Then a successful response is returned

@F_tasks_byid
Scenario: tasks-byid
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And there is at least 1 task
  When the client requests a task by id
  Then a successful response is returned

@F_tasks_openconsults
Scenario: tasks-openconsults
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  When the client requests open consults for pid "SITE;10000000270"
  Then a successful response is returned

@F_tasks_current
Scenario: tasks-current
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  When the client starts an activity on patient "SITE;100728"
  Then a successful response is returned
  And the response contains a process instance id
  When the client requests the current task with the process instance id
  Then a successful response is returned
  And the response contains single task data
  # And print response

# @F_tasks_update
# Scenario: tasks-update
#   Given the client has the current deploymentid
#   And the client has the current deploymentid
#   When the client starts an activity on patient "SITE;100728"
#   Then a successful response is returned
#   And there is at least 1 task
#   When the client updates a task
#   Then a successful response is returned

