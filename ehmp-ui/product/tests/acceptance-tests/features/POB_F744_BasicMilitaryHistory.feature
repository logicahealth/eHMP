@F744_BasicMilitaryHistory @US10809 @US10810 @regression
Feature: Basic Military History

  Background:
    Given user searches for and selects "Eight,Patient"
    And Overview is active
    When the user clicks the Workspace Manager
    And the user deletes all user defined workspaces
    And the user creates a user defined workspace named "militaryhistory"
    And the user customizes the "militaryhistory" workspace
    And the user adds an summary "military_hist" applet to the user defined workspace
    And the user selects done to complete customizing the user defined workspace
    Then the "militaryhistory" screen is active
    And the active screen displays 1 applets
    And the "militaryhistory" screen is active

  @US10809 @US10810 @TC2280_1 @TC2281_1
  Scenario: Verify the User Defined Workspace is displayed containing the MILITARY HISTORY applet
    When the "militaryhistory" screen is active
    And the applet "1" Military History Summary applet is displayed
    Then the Military History applet contains headers
      | Headers |
      | Name |
      | Description |
    And the Military History table contains rows
      | Name               |
      | Branch(es) of Service    |
      | Service Date(s)          |
      | Areas of Service         |
      | Occupational Specialties |

  @US10809 @US10810 @TC2280_2 @TC2281_2
  Scenario: Verify the Military History first row Edit View - Branch(s) of Service
    When the user clicks on data row number "1"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 1st testing text row" and clicks row "1" save
    And the description for row "1" is updated to "This is 1st testing text row"

    When the user clicks on data row number "1"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 2nd testing text row" and clicks row "1" save
    And the description for row "1" is updated to "This is 2nd testing text row"

    When the user clicks on data row number "1"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the user edits text and clicks row "1" cancel
    Then the description for row "1" is not updated and displays previous text

    When POB the user clicks the Military History Expand Button
    And POB "military_hist" Military History applet loaded successfully
    Then the Military History applet contains headers
      | Headers |
      | Name |
      | Description |
      | Last Modified |
      | Location |
      | Modified By |
    And the Last Modified column displays last updated date
    And the Location column displays the name of the site "PANORAMA"
    And the Modified By column displays the name of the user "PANORAMA USER" who edited the description
    And the user minimizes the expanded Military History applet

  @US10809 @US10809_detail
  Scenario: Verify the Military History first row Detail View - Branch(s) of Service
    When the user clicks on Detail view button for row "1"
      | Name               |
      | Branch(es) Of Service    |
    Then the user validates Detail view saved text is displayed for row "1"

  @US10809 @US10810 @TC2280_3 @TC2281_3
  Scenario: Verify the Military History second row Edit View - Service Date(s)
    When the user clicks on data row number "2"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 1st testing text row" and clicks row "2" save
    And the description for row "2" is updated to "This is 1st testing text row"

    When the user clicks on data row number "2"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 2nd testing text row" and clicks row "2" save
    And the description for row "2" is updated to "This is 2nd testing text row"

    When the user clicks on data row number "2"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the user edits text and clicks row "2" cancel
    Then the description for row "2" is not updated and displays previous text

  @US10809 @US10810 @TC2280_4 @TC2281_4
  Scenario: Verify the Military History third row Edit View - Areas of Service
    When the user clicks on data row number "3"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 1st testing text row" and clicks row "3" save
    And the description for row "3" is updated to "This is 1st testing text row"

    When the user clicks on data row number "3"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 2nd testing text row" and clicks row "3" save
    And the description for row "3" is updated to "This is 2nd testing text row"

    When the user clicks on data row number "3"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the user edits text and clicks row "3" cancel
    Then the description for row "3" is not updated and displays previous text

  @US10809 @US10810 @TC2280_5 @TC2281_5
  Scenario: Verify the Military History fourth row Edit View - Occupational specialties
    When the user clicks on data row number "4"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 1st testing text row" and clicks row "4" save
    And the description for row "4" is updated to "This is 1st testing text row"

    When the user clicks on data row number "4"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the Edit form has a Text box, Cancel and Save buttons
    Then the user enters text "This is 2nd testing text row" and clicks row "4" save
    And the description for row "4" is updated to "This is 2nd testing text row"

    When the user clicks on data row number "4"
    And the buttons Details form and Edit form are displayed on
    And the user clicks on Edit form button
    And the user edits text and clicks row "4" cancel
    Then the description for row "4" is not updated and displays previous text
