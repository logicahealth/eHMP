@F1142 @F1142_mysite @US17415
Feature: Implement My Site search tray

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  Then staff view screen is displayed

@F1142_mysite_1
Scenario: Verify My Site search display
   Then the staff view screen displays My Site in the sidebar tray
   And the staff view screen displays My Site search input box
   And the staff view My Site search input box placeholder text is "My Site Patient Search (Ex: S1234 or Smith, John...)"

@F1142_mysite_2 @SC_1.3
Scenario: Verify My Site tray display
    When the user opens the My Site tray
    Then the My Site tray displays instruction "Enter either first letter of last name and last four of social security number, or generic name in the search field above."
    And the My Site tray displays a close x button

@F1142_mysite_3
Scenario Outline: Verify My Site search requires at least 3 characters
    When the user searchs My Site with search term <search term>
    Then the error message "Search string must contain at least 3 characters" displays
Examples:
     | search term |
     |             |
     | a           |
     | ab          |

@F1142_mysite_4
Scenario: Verify My Site search reports when search returns results exceeding the maximum allowable
  When the user searchs My Site with search term Five
  Then the tray error message The number of rows returned exceeds the maximum allowable. Be more specific in your search criteria displays

@F1142_mysite_5
Scenario: Verify My Site search reports when search returns no results
  When the user searchs My Site with search term NotValid,Patient
  Then the tray error message "No Results Found. Verify Search Criteria." displays

@F1142_mysite_6
Scenario: Verify My Site search reports when search term contains unallowable characters
  When the user searchs My Site with search term Bad$Name
  Then the tray error message "Invalid Search criteria." displays

@F1142_mysite_7 @DE7713
Scenario: Verify My Site search results are in correct format
    When the user searchs My Site with search term Eight,Patient
    Then the My Site Tray displays
    And the My Site Tray contains search results
    And the My Site Tray table headers are 
    | header        |
    | Patient Name  |
    | Date of Birth |
    | Gender        |
    
    And the My Site Tray patient name search results are in format Last Name, First Name + (First Letter in Last Name + Last 4 SSN )
    And the My Site Tray date of birth search results are in format Date (Agey)
    And the My Site Tray gender search results are in terms Male, Female or Unknown

@F1142_mysite_8
Scenario: Verify My Site search is triggered by search button
    When the user searches My Site by selecting button
    Then the My Site Tray displays
    And the My Site Tray contains search results

@F1142_mysite_9
Scenario: Verify My Site search is triggered by keyboard enter key
	When the user searches My Site by keyboard ENTER
	Then the My Site Tray displays
    And the My Site Tray contains search results

@F1142_mysite_10
Scenario: Verify My Site search returns results when search term is First Letter in Last Name + Last 4 SSN
    When the user searchs My Site with search term E0008
    Then the My Site Tray displays
    And the My Site Tray contains search results

@F1142_mysite_11_a
Scenario Outline: Verify My Site results retained and repopulated when tray is reopened
    When the user searchs My Site with search term Eight,Patient
    Then the My Site Tray displays
    And the My Site Tray contains search results
    When the user opens the <tray> tray
    Then the My Site search input box is cleared
    When the user opens the My Site tray
    Then the My Site Tray displays
    And the My Site search input box is populated with term Eight,Patient
    And the My Site Tray contains search results
Examples:
    | tray            |
    | My CPRS list    |
    | Recent Patients |
    | Ward            |
    | Nationwide      |

