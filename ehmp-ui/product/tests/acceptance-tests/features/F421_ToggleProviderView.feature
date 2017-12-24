@F421 
Feature: F421 -  Implement a User (Provider) Centric View 

@US7215 @US7006 @TC1051 @TC1236 @TC1239
Scenario: Add applets to Provider View
    Given Provider Centric View is active
    Then the applets are displayed on the provider centric view
    | applet   |
    | TASKS |

@US7013 @TC1233 @DE3055
Scenario: Verify provider view is unchanged after selecting a new patient
    Given user searches for and selects "Eight,Patient"
    And Overview is active
    When the user selects Staff View from the navigation bar
    Then Provider Centric View is active

@US7013 @TC1234 @F1274
Scenario: Verify Provider View is unchanged after a patient search

    Given user searches for and selects "Eight,Patient"
    And Overview is active
    And the Patient View Current Patient displays the user name "Eight,Patient (E0008)"
    When the user selects Staff View from navigation bar
    Then staff view screen is displayed
    And the user selects the Current Patient button
    Then Overview is active
    And the Patient View Current Patient displays the user name "Eight,Patient (E0008)"


