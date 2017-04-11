 @reg1
Feature: F117 provides cross cutting UI concerns including: displaying the current patient identifying traits,
  displaying the application version, and providing screen-to-screen navigation.

  In order to identify current patient identifying traits
  As a clinician
  I want to return to the patient search screen and display identifying traits

#  POC: Team EnterPrise
#  Updated by Saikat Barua on Oct, 25th 2015
#  This is the Prototype scenario: How to mix and match both framework Steps !!!

  Scenario: Verify current patient identifying traits
    # Given user is logged into eHMP-UI
    And user searches for and selects "Eight,Patient"
    And Overview is active
    When the user has selected All within the global date picker
    Then POB "Eight,Patient" information is displayed in overview
      | field       | value         |
      | DOB         | 04/07/1935    |
      #| Age         | 79y           |
      | Gender      | Male          |
      | SSN         | ***-**-0008   |
    And "Bottom Region" contains "eHMP version"
#    And POB Bottom Region contains "eHMP version"
    And POB the user clicks the Patient Selection Button
    And the patient search screen is displayed
#    And POB the patient search screen is displayed
