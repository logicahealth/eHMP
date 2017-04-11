@manual

Feature: F362-Background Patient List Management Services

@US5008_Refresh_Button
Scenario: User can refresh all charts using Global Refresh button  
    Given user is viewing Metrics Dashboard UI
    And user selects existing dashboard
    And charts are displayed for that dashboard
    When user makes changes and clicks Refresh
    Then all charts are refreshed

@US5008_Datepicker 
Scenario: User can select end point using datepicker
    Given user is viewing Metrics Dashboard UI
    And user selects existing dashboard
    When user creates a new chart
    Then user can choose a date using datepicker
    
@US5008_Granularity 
Scenario: User can select any granularity
    Given user is viewing Metrics Dashboard UI
    And user selects existing dashboard
    When user creates a new chart
    Then user can choose any available granularity

@US5208_MultiMetric_Chart
Scenario: User can create mulit metric chart
    Given user is viewing Metrics Dashboard UI
    And user selects existing dashboard
    And user creates a new chart
    When user selects multi metrics from available metrics
    And clicks ok button
    Then the chart is created
    