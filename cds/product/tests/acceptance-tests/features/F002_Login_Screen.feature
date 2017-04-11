@F002_Login_Screen
Feature:Simple test for the existence of the Login Screen

@full_stack @debug
Scenario: CDSDashboard Login Screen Existence
  Given that we have a browser available
  When I navigate to the cdsdashboard base url plus "cdsdashboard"
  Then the VA logo is present
