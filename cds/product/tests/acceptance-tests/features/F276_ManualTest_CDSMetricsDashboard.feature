# Team Europa
@manual @future
Feature: F276 - CDS Metrics Dashboard

@US3098 @manual
Scenario: Metrics Listener service listens to the JMX feed from DROOLs engine
    Given JMX is configured on opencds
    And cdsinvocation virtual machine is running
    When user sends request to opencds
    Then the sessioncount metrics are displyed in JMX console
    And sessioncounts are logged to metrics data store on cdsinvocation vm

@US4021 @manual
Scenario: Rule invocation metrics are created and stored in the metrics data store
    Given Metrics data store is available
    When user invokes a rule through postman
    And user logs into metrics data store
    Then rule invocation metrics are stored in the data store 

@US3802_DashboardExistance
Scenario: User can view a Metrics Dashboard UI
    Given user can access Metrics Dashboard UI
    When user enters Metrics Dashboard URI in browser 
    Then the Metrics Dashboard UI is viewd 

@US3844_CreateDashboard
Scenario: User can create a Dashboard
    Given user is viewing Metrics Dashboard UI
    When user clicks new dashboard button
    And user enters name and notes for the Dashboard
    And user clicks save button
    Then the new dashboard is created in the pane

@US3844_UpdateDashboard
Scenario: User can update a Dashboard
    Given user is viewing Metrics Dashboard UI
    When user selects existing dashboard
    And user changes settings or name for the Dashboard
    And user clicks save button
    Then the dashboard is updated with given data

@US3844_ViewDashboard
Scenario: User can view a Dashboard
    Given user is viewing Metrics Dashboard UI
    When user selects existing dashboard
    Then the dashboard is viewed

@US3844_UpdateDashboard
Scenario: User can delete a Dashboard
    Given user is viewing Metrics Dashboard UI
    When user selects existing dashboard
    And user clicks trash button
    Then the dashboard is deleted from the pane

@US3099_NewChartTypes_Bar
Scenario: User can create and view Bar chart on the dashboard
    Given user is viewing Metrics Dashboard UI
    And user selects existing dashboard
    When user creates new chart with Chart Type BAR
    Then BAR chart is created

@US3099_NewChartTypes_Area
Scenario: User can create and view Bar chart on the dashboard
    Given user is viewing Metrics Dashboard UI
    And user selects existing dashboard
    When user creates new chart with Chart Type AREA
    Then AREA chart is created
    
@US3097_SimpleRuleExec
Scenario: User can create charts for rules execution
    Given user is viewing Metrics Dashboard UI
    And user creates a dashboard
    When user creates new chart for rule execution
    Then a new chart is created to show numbers of rules executed in given time and granularity
