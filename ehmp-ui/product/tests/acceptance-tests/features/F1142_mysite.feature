@F1142 @F1142_mysite @US17415
Feature: Implement My Site search tray

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "DNS    " verifycode as  "DNS    !!"
  Then staff view screen is displayed

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



