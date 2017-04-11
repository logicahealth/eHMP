@F144_WardSearch @regression @DE2429 @triage
Feature: F144-eHMP Viewer GUI - Patient Search and Selection (Ward)

#POC: Team Mercury

Background:
    # Given user is logged into eHMP-UI
    And the user has navigated to the patient search screen

@inValidWardSearch_2 @US1976 @debug @DE862
Scenario: User attempts invalid search  with wrong refine patient results
    And the User selects mysite and Ward
    And user attempt to filter by keyword "7A"
    And the user select keyword "7A Gen Med"
    And user enters patient "0008@" in the patient filter
    Then no results are displayed in patient search
    Then the user verifies patient "No results were found."

@US1976_1
Scenario: Verify Ward search elements
  Given user has option to search for patients via Wards
  When user chooses to search for patients via Wards
  Then a Ward filter is displayed
  And a Ward list is displayed
  And Ward headers are displayed
      | headers       |
      | Patient Name  |
      | SSN           |
      | Date of Birth |
      | Gender        |
      | Room-Bed      |
  And Ward search results asks user to "User filter to display results"

@US1976_2
Scenario: Verify Ward search displays patients
  Given user has option to search for patients via Wards
  When user chooses to search for patients via Wards
  And user selects a ward with patients
  Then ward patients are displayed

@US1976_3
Scenario: Verify user can filter Ward list
  Given user has option to search for patients via Wards
  When user chooses to search for patients via Wards
  When user filters the Wards by term "7A"
  Then the Ward list only includes wards with letters "7A"

@US1976_4
Scenario: Verify user can load a patient from a Ward
  Given user has option to search for patients via Wards
  When user chooses to search for patients via Wards
  And user selects a ward with patients
  And user chooses to load a patient from the Ward results list
  Then Overview is active
  And Current Encounter displays the expected ward


@inValidWardSearch @US1976
Scenario: User attempts invalid search  with wrong keyword
    And the User selects mysite and Ward
    And user attempt to filter by keyword "@"
    Then no results are displayed in word
    Then the user verifies word "No results were found."

@invalidWardSearch_3 @US1976 @DE1590
Scenario: User attempts search  with  filter which has no data
    And the User selects mysite and Ward
    And user attempt to filter by keyword "3"
    And the user select keyword "3EN"
    Then no results are displayed in patient search
    Then the user verifies patient "No results were found."