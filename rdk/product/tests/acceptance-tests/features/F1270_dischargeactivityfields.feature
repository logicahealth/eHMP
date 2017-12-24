@F1270 @JBPM @future
Feature: Activities With Details Resource

@US18860
Scenario: Validate that the active Discharge Activity Records for assigned primary care patients including all the Discharge Follow-up Activity Data fields are returned by the Activities With Details Resource
  When the user requests activitiesWithDetails
      | parameter_name         | parameter_value         |
      | mode                   | open                    |
      | processDefinitionId    | Order.DischargeFollowup |
      | returnActivityJSONData | true                    |
  Then a successful response is returned
  And the activitiesWithDetails response items contain fields
      | field             |
      | ISACTIVITYHEALTHY |
  Then the activitiesWithDetails response items contain a "activity" object
      | field                     |
      | deploymentId              |
      | processDefinitionId       |
      | type                      |
      | domain                    |
      | processInstanceId         |
      | instanceName              |
      | patientUid                |
      | clinicalObjectUid         |
      | sourceFacilityId          |
      | destinationFacilityId     |
      | state                     |
      | initiator                 |
      | timeStamp                 |
      | urgency                   |
      | assignedTo                |
      | activityHealthy           |
      | activityHealthDescription |
      | health.id                 |
      | health.isHealthy          |
      | health.description        |
      | health.importance         |
  Then the activitiesWithDetails response items contain a "discharge" object
  #And the response items contain a discharge object
      | field                               |
      | dateTime                            |
      | admitDateTime                       |
      | fromFacilityId                      |
      | fromFacilityDescription             |
      | disposition                         |
      # | primaryCarePhysicianNameAtDischarge |
      # | primaryCareTeamAtDischarge          |
      | diagnosis                           |
      | timeout                             |

  Then the activitiesWithDetails response items contain a "contact" object
      | field       |
      | dueDateTime |
      | attempts    |

  Then the activitiesWithDetails response items contain a "follow-up" object
      | field                 |
      | actionId              |
      | actionText            |
      | executionUserId       |
      | executionUserName     |
      | executionDateTime     |
      | visit.location        |
      | visit.serviceCategory |
      | visit.dateTime        |
      | comment               |
      | attempt               |

  Then the activitiesWithDetails response items contain a "signals" object
      | field             |
      | name              |
      | actionId          |
      | actionText        |
      | history           |
      | executionUserId   |
      | executionDateTime |
      | data.comment      |

