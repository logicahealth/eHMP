@F_activities @JBPM @future
Feature: Activities

@F_activities_staff @F_activities_staff_1
Scenario:  Staff view, activity applet requests 'All Activities related to me'
  When the client requests open activities for the staff context
  | extra parameter | value |
  | createdByMe     | true  |
  | intendedForMeAndMyTeams | true |
  Then a successful response is returned

@F_activities_instances
Scenario:  
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests activities instances for pid "SITE;3"
  Then a successful response is returned

@F_activities_available
Scenario:
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests activities available
  Then a successful response is returned

@F_activities_start
Scenario: 
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests activities available
  Then a successful response is returned
  And client grabs the deploymentId
  When the client starts an activity on patient "SITE;3"
  Then a successful response is returned
  And the response contains a process instance id

@F_activities_single_instance
Scenario:
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests activities available
  Then a successful response is returned
  And client grabs the deploymentId
  When the client starts an activity on patient "SITE;3"
  Then a successful response is returned
  And the response contains a process instance id
  And the client has started an activity
  When the client requests a single instance activity for pid "SITE;3"
  Then a successful response is returned
