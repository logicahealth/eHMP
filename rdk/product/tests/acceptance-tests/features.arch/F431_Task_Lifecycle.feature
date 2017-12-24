@F431_Task_Lifecycle

Feature: F431 Task Lifecycle Management

@F431_Create_And_Complete_Process @US7729 @US8035 @future
Scenario: Create a fitlab process, then claim and complete that process

  # Get the deployment ID for FitLabProject
  When the client gets list of all available process definitions
  Then a successful response is returned
  And save the deployment ID for "FITLabProject"
  # Create a process
  When the client creates a process with content latest deployment ID and content ""processDefId":"FITLabProject.FITLabActivity","parameter":{"icn":"123123123","facility":"SITE"}}"
  Then a successful response is returned
  # Get list of tasks for a patient
  When the client requests to see the list of tasks for a patient "{"context": "patient","patientICN":"123123123","status":"Ready"}"
  Then a successful response is returned
  And the results contain the new process ID
  And the results contain
      | name                                | value                                                  |
      | data.items.TASKID                   | IS_SET                                                 |
      | data.items.TASKNAME                 | Provide Training and Kit                               |
      | data.items.DESCRIPTION              | Provide Veteran with a FIT/FOBT test kit and instructions on how to collect the stool sample as well as instructions on how to RETURN the sample.                          |
      | data.items.STATUS                   | Ready                                                  |
      | data.items.PRIORITY                 | 0                                                      |
      | data.items.ACTUALOWNERID            |                                                        |
      | data.items.ACTUALOWNERNAME          |                                                        |
      | data.items.CREATEDBYID              | PW                                                     |
      | data.items.CREATEDBYNAME            | PW                                                     |
      | data.items.TASKCREATEDON            | IS_SET                                                 |
      | data.items.EXPIRATIONTIME           |                                                        |
      | data.items.PROCESSINSTANCEID        | IS_SET                                                 |
      | data.items.PROCESSID                | FITLabProject.FITLabActivity                           |
      | data.items.PROCESSNAME              | FITLabActivity                                         |
      | data.items.DEPLOYMENTID             | CONTAINS VistaCore:FITLabProject                       |
      | data.items.PATIENTICN               | 123123123                                              |
      | data.items.PATIENTNAME              |                                                        |
      | data.items.TASKTYPE                 | Human                                                  |
      | data.items.POTENTIALOWNERS          | [TF:Primary Care(201)/TR:Licensed Practical Nurse(412)]                                                                                    |

  # Start a process
  When the client changes state of the newly created task to "start"
  Then a successful response is returned

  # Complete a process
  When the client changes state of the newly created task to "complete"
  Then a successful response is returned

  # Get list of tasks for a patient
  When the client requests to see the list of tasks for a patient "{"context": "patient","patientICN":"123123123","status":"Ready"}"
  Then a successful response is returned
  And the result does not contain the new task ID

  #Cancel all tasks for a process i.e. abort the process
  When the client cancels the new process
  Then a successful response is returned

  # Get list of tasks for a patient
  When the client requests to see the list of tasks for a patient "{"context": "patient","patientICN":"123123123","status":"Ready"}"
  Then a successful response is returned
  And the result is an empty array
