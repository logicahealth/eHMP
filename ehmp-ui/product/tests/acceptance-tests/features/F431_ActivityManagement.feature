@F431 @DE3055 @reg1
Feature: Build a Activity Management Framework Environment

Background:
    Given staff view screen is displayed
    And the applets are displayed on the provider centric view
    | applet   |
    | TASKS |

@US7422 @TC440
Scenario: Verify a user can access detailed view of a task
  Given My Tasks applet displays at least 1 tasks
  When the user selects a task
  Then a detail view is displayed
