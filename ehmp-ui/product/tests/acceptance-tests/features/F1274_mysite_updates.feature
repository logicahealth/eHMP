@F1274
Feature: Global Header Navigation Optimization

@F1142_mysite_1 @US18884
Scenario: Verify My Site search display
   Then the staff view screen displays My Site search input box
   And the staff view My Site search input box placeholder text is "Search My Site"
   And the Patient Search input box displays an i icon
   And when the user hovers over the Patient Search i icon
   Then the tool tip displays "ENTER EITHER FIRST LETTER OF LAST NAME AND LAST FOUR OF SOCIAL SECURITY NUMBER, OR GENERIC NAME. (EX: S1234 OR SMITH, JOHN...)"

@F1142_mysite_2 @SC_1.3 @US18884
Scenario: Verify My Site tray display
    When the user searchs My Site with search term Eight,Patient
    Then the My Site Tray displays
    And the My Site Tray title is "My Site Patient Search Results"
    Then the My Site tray displays instruction "Enter either first letter of last name and last four of social security number, or generic name in the search field."
    And the My Site tray displays a close x button

Scenario: Verify My Site tray close
    Given the user searchs My Site with search term Eight,Patient
    And the My Site Tray displays
    And the Patients header button is highlighted
    When the user closes the My Site tray
    Then the Patient header button is not highlighted

@US18884_2
Scenario: Verify that mysite search input box is clear when user selects any other tray
    Given the staff view My Site search input box is clear
    When the user searchs My Site with search term Eight,Patient
    Then the staff view My Site search input is populated
    And the My Site Tray displays
    When the user opens the Ward tray
    Then the Ward tray title is "WARDS"
    And the staff view My Site search input box is clear
