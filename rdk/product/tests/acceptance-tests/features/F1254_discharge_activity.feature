@F1254 @JBPM 
Feature: Discharge activity

@US18845 @US19066 @DE8336
Scenario: Verify that the Tasks resource returns follow up tasks related to only those patients (e.g. TWENTY, PATIENT SITE;420) that are associated with the Discharge Test Teams (e.g. 'Panorama - Discharge Test Team' and users 1nurse/USER    ). 

  Given a patient with pid "SITE;420" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER  " has started a discharge with parameters
      | parameters                   | value                        |
      | icn                          | 10120V889232                 |
      | pid                          | SITE;420                     |
      | patientUid                   | urn:va:patient:SITE:420:420  | 
  And a successful response is returned
  And the successful response contains a processInstanceId 
  When the "SITE;USER    " client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the task associated with the processInstanceId has
      | parameter          | value                                  |
      | TASKNAME           | Follow-Up                              |
      | DEFINITIONID       | Order.DischargeFollowup                |
      | PATIENTICN         | SITE;420                               |


@US19066 @DE8336
Scenario: Verify that the Tasks resource DOES NOT return follow up tasks related to those patients (e.g. TEN,PATIENT pid=SITE;8) that are NOT associated with the Discharge Test Teams (e.g. 'Panorama - Discharge Test Team' and users 1nurse/USER    ). 

  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER  " has started a discharge with parameters
      | parameters                   | value                        |
      | icn                          | 10110V004877                 |
      | pid                          | SITE;8                       |
      | patientUid                   | urn:va:patient:SITE:8:8      | 
  And a successful response is returned
  And the successful response contains a processInstanceId 
  When the "SITE;USER    " client requests tasks instances for "user" and "teamroles"
  Then a successful response is returned
  And the response does not contain the processInstanceId
