@F1270 @JBPM @future
Feature: Activity with Details Resource


@mode
Scenario: verify all mode options
   When the user requests activitiesWithDetails
    | parameter_name | parameter_value |
    | mode           | open            |
  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response only contains items for mode "Open"
  When the user requests activitiesWithDetails
    | parameter_name | parameter_value |
    | mode           | closed          |
  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response only contains items for mode "closed"
  When the user requests activitiesWithDetails
    | parameter_name | parameter_value |
    | mode           | all             |
  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response contains items for mode open and closed

@initiatedBy_single
Scenario: initiatedBy - single user

  When the user requests activitiesWithDetails
    | parameter_name | parameter_value |
    | mode           |open             |
    | initiatedBy |SITE;10000000272 |
  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response only contains items 
    |parameter | user |
    |CREATEDBYID| SITE;10000000272 |

@initiatedBy_multiple
Scenario: initiatedBy - multiple users

  When the user requests activitiesWithDetails
    | parameter_name | parameter_value |
    | mode           |open             |
    | initiatedBy |SITE;10000000272,SITE;10000000271 |

  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response contains at least one of the following items 
    |parameter | user |
    |CREATEDBYID|SITE;10000000272 |
    |CREATEDBYID|SITE;10000000271 |


@filterText @US18859 @TA99715
Scenario: filterText
  When the user requests activitiesWithDetails
    | parameter_name         | parameter_value |
    | mode                   | all             |
    | processDefinitionId | Order.DischargeFollowup |
    | returnActivityJSONData | true            |
    | filterText             | [userid1]     |
  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response contains text "[userid1]"

@FLAGGED
Scenario: Flagged
  When the user requests activitiesWithDetails
    | parameter_name         | parameter_value |
    | mode                   | all             |
    | returnActivityJSONData | true            |
    | flagged                | true            |
  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response only contains items
  | parameter         | value |
  | ISACTIVITYHEALTHY | 0     |
  When the user requests activitiesWithDetails
    | parameter_name         | parameter_value |
    | mode                   | all             |
    | returnActivityJSONData | true            |
    | flagged                | false           |
  Then a successful response is returned
  And the activities details results contain at least 1 results
  And the activitiesWithDetails response contains ISACTIVITYHEALTHY with values 0 or 1


@US18863 @US18863_start
Scenario: start
  Given the user requests activitiesWithDetails
      | parameter_name      | parameter_value         |
      | mode                | all                     |
      | processDefinitionId | Order.DischargeFollowup |
      | primarySortBy       | discharge.dateTime desc |
  And a successful response is returned
  And the activities details results contain at least 2 results
  And the user notes the 2nd result
  When the user requests activitiesWithDetails
      | parameter_name      | parameter_value         |
      | mode                | all                     |
      | processDefinitionId | Order.DischargeFollowup |
      | primarySortBy       | discharge.dateTime desc |
      | start               | 1                       |
  Then a successful response is returned
  And the first activities details result is as expected


@US18863 @US18863_limit
Scenario: limit
  Given the user requests activitiesWithDetails
      | parameter_name | parameter_value |
      | mode           | all             |

  And a successful response is returned
  And the activities details results contain at least 2 results
  And the user notes the total activitiesWithDetails results
  When the user requests activitiesWithDetails with a limit
      | parameter_name | parameter_value |
      | mode           | all             |

  Then a successful response is returned
  And the activities details result is limited as expected

@US18863 @US18863_page
Scenario: results
  Given the user requests activitiesWithDetails
      | parameter_name | parameter_value |
      | mode           | all             |

  Then a successful response is returned
  And the activities details result contains pagination variables
      | key              |
      | itemsPerPage     |
      | nextStartIndex   |
      | startIndex       |
      | pageIndex        |
      | currentItemCount |
      | totalItems       |

@US18861 @US18861_secondary
Scenario: primarySortBy, secondarySortBy
  #Given a patient with pid "SITE;3" has been synced through the RDK API
  When the user requests activitiesWithDetails
      | parameter_name         | parameter_value         |
      | mode                   | all                     |
      | returnActivityJSONData | true                    |
      | processDefinitionId    | Order.DischargeFollowup |
      | primarySortBy          | activity.state desc     |
      | secondarySortBy        | discharge.dateTime desc |
  Then a successful response is returned
  And the activities details results are sorted by activity.state (desc, Primary) and discharge.dateTime (desc, Secondary)



@input_param_processDefinitionId
Scenario: processDefinitionId

  When the user requests activitiesWithDetails
      | parameter_name      | parameter_value |
      | mode                | all             |
      | returnActivityJSONData | true            |
      | processDefinitionId | Order.FakeConsult   |
  Then a successful response is returned
  And the activitiesWithDetails response contains only items with a processDefinitionId of "Order.FakeConsult"
  When the user requests activitiesWithDetails
      | parameter_name      | parameter_value |
      | mode                | all             |
      | returnActivityJSONData | true            |
      | processDefinitionId | Order.DischargeFollowup   |
  Then a successful response is returned
  And the activitiesWithDetails response contains only items with a processDefinitionId of "Order.DischargeFollowup"

@input_param_returnActivityJSONData
Scenario: Verify response responds to returnActivityJSONData parameter
  When the user requests activitiesWithDetails
      | parameter_name         | parameter_value |
      | mode                   | all             |
      | processDefinitionId | Order.DischargeFollowup   |
      | returnActivityJSONData | false           |
  Then a successful response is returned
  And the response items do not contain an ACTIVITYJSON object
  When the user requests activitiesWithDetails
      | parameter_name         | parameter_value |
      | mode                   | all             |
      | processDefinitionId | Order.DischargeFollowup   |
      | returnActivityJSONData | true            |
  Then a successful response is returned
  And the response items do contain an ACTIVITYJSON object
