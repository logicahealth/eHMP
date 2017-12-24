@F1270 @JBPM @future
Feature: Activity with Details Resource

@US18861
Scenario: Activities With Details Resource will support default sorting (Oracle Server side sorting) by Discharge On Date (Primary) and Patient Name (Secondary)
  When the user requests activitiesWithDetails
      | parameter_name         | parameter_value         |
      | mode                   | open                    |
      | processDefinitionId    | Order.DischargeFollowup |
      | returnActivityJSONData | true                    |
      | primarySortBy          | discharge.dateTime desc |
      | secondarySortBy        | activity.patientName    |
  Then a successful response is returned
  And the activities details results are sorted by Discharge On Date (Most recent first, Primary) and Patient Name (Alphabetical, Secondary)

  @US18862 @US18862_sort_fromfacility
  Scenario: Sort by - From Facility
    When the user requests activitiesWithDetails with unique facility descriptions
      | parameter_name         | parameter_value              |
      | mode                   | open                         |
      | processDefinitionId    | Order.DischargeFollowup      |
      | returnActivityJSONData | true                         |
      | primarySortBy          | discharge.fromFacilityDescription asc |
    Then a successful response is returned
    And the activities details results contain at least 2 unique facility descriptions
    And the activities details results are sorted by Facility description asc

  @US18862 @US18862_sort_dispositionto
  Scenario: Sort by - Disposition To
    When the user requests activitiesWithDetails with unique dispositions
      | parameter_name      | parameter_value           |
      | mode                | open                      |
      | processDefinitionId | Order.DischargeFollowup   |
      | returnActivityJSONData | true                   |
      | primarySortBy       | discharge.disposition asc |
    Then a successful response is returned
    And the activities details results contain at least 2 unique dispositions
    And the activities details results are sorted by Disposition asc

  @US18862 @US18862_assignedpcp
  Scenario: Sort by - Assigned PCP
    
    When the user requests activitiesWithDetails with unique pcpNames
      | parameter_name      | parameter_value         |
      | mode                | open                    |
      | processDefinitionId | Order.DischargeFollowup |
      | returnActivityJSONData | true                   |
      | primarySortBy       | discharge.primaryCarePhysicianNameAtDischarge asc|
    Then a successful response is returned
    And the activities details results contain at least 2 unique pcpNames
    And the activities details results are sorted by AssignedPCP asc

  @US18862 @US18862_pct
  Scenario: Sort by - Primary Care Team
    
    When the user requests activitiesWithDetails with unique Primary Care Teams
      | parameter_name      | parameter_value                          |
      | mode                | open                                     |
      | processDefinitionId | Order.DischargeFollowup                  |
      | returnActivityJSONData | true                   |
      | primarySortBy       | discharge.primaryCareTeamAtDischarge asc |
    Then a successful response is returned
    And the activities details results contain at least 2 unique Primary Care Teams
    And the activities details results are sorted by Primary Care Team asc

  @US18862 @US18862_attempts
  Scenario: Sort by - Attempts
    
    When the user requests activitiesWithDetails with unique attempts
      | parameter_name         | parameter_value         |
      | mode                   | open                    |
      | processDefinitionId    | Order.DischargeFollowup |
      | primarySortBy          | contact.attempts asc    |
      | returnActivityJSONData | true                    |
    Then a successful response is returned
    And the activities details results contain at least 2 unique attempts
    And the activities details results are sorted by Attempts asc

  @US18862 @US18862_attempts_desc
  Scenario: Sort by - Attempts
    
    When the user requests activitiesWithDetails with unique attempts
      | parameter_name         | parameter_value         |
      | mode                   | open                    |
      | processDefinitionId    | Order.DischargeFollowup |
      | primarySortBy          | contact.attempts desc   |
      | returnActivityJSONData | true                    |
    Then a successful response is returned
    And the activities details results contain at least 2 unique attempts
    And the activities details results are sorted by Attempts desc

  @US18862 @US18862_flag
  Scenario: Sort by - Flag 

    When the user requests activitiesWithDetails with unique activity healthy fields
      | parameter_name         | parameter_value              |
      | mode                   | open                         |
      | processDefinitionId    | Order.DischargeFollowup      |
      | returnActivityJSONData | true                         |
      | primarySortBy          | activity.activityHealthy asc |
    Then a successful response is returned
    And the activities details results contain at least 2 unique activity healthy fields
    And the activities details results are sorted by activity healthy fields asc

  @US18862 @US18862_dischargedate
  Scenario: Sort by - Discharge On Date ( oldest first)

    When the user requests activitiesWithDetails with unique discharge dates
      | parameter_name         | parameter_value         |
      | mode                   | open                    |
      | processDefinitionId    | Order.DischargeFollowup |
      | returnActivityJSONData | true                    |
      | primarySortBy          | discharge.dateTime desc |
    Then a successful response is returned
    And the activities details results contain at least 2 unique discharge dates
    And the activities details results are sorted by Discharge Date (desc)

 @US18862 @US18862_patientname
  Scenario: Sort by - Patient Name (reverse alpha)

    When the user requests activitiesWithDetails with unique patientnames
      | parameter_name         | parameter_value           |
      | mode                   | open                      |
      | processDefinitionId    | Order.DischargeFollowup   |
      | returnActivityJSONData | true                      |
      | primarySortBy          | activity.patientName desc |
    Then a successful response is returned
    And the activities details results contain at least 2 unique patientnames
    And the activities details results are sorted by PATIENTNAME (desc)

