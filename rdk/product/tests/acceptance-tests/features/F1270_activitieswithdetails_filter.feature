@F1270 @US18859 @JBPM @future
Feature: Activity with Details Resource



@filter_pid
Scenario: Other filters such as patient "pid" will also continue to be supported for future needs.
  When the user requests activitiesWithDetails
      | parameter_name         | parameter_value         |
      | mode                   | open                    |
      | processDefinitionId    | Order.DischargeFollowup |
      | returnActivityJSONData | true                    |
      | pid                    | SITE;239                |
  Then a successful response is returned
  And the activitiesWithDetails response only contains items for pid "SITE;239"
  And the activitiesWithDetails response only contains active items

@filter_mode
Scenario: Other filters such as patient "mode" will also continue to be supported for future needs.
  When the user requests activitiesWithDetails
      | parameter_name         | parameter_value         |
      | mode                   | closed                  |
      | processDefinitionId    | Order.DischargeFollowup |
      | returnActivityJSONData | true                    |
  Then a successful response is returned
  And the activitiesWithDetails response only contains items for mode "Closed"



