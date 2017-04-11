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