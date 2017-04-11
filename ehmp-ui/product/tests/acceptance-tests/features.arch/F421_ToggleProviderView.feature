@F421 @regression
Feature: F421 -  Implement a User (Provider) Centric View 

@US7215 @TC1237 @TC1238 @DE3041 @debug @DE4208
Scenario: Verify applet selection catalog/bucket lists the default workspace
    # Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    Then Overview is active
    And the user clicks the Workspace Manager
    Then the user deletes all user defined workspaces
    When the user copies My Workspace workspace
    And the user chooses to customize the My Workspace copy
    Then the default workspace applet is also listed in the applet selection catalog/bucket.