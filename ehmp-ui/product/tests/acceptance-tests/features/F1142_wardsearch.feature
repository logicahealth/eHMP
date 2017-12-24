@F1142 @US17412 @reg2
Feature: Home Page Usability (Staff View) - Implement Ward search tray

@F1142_ward_1
Scenario: Verify ward search display
   Then the staff view screen displays Wards in the sidebar tray

@F1142_ward_2
Scenario: Verify Ward tray display
    When the user opens the Ward tray
    And the Ward tray title is "WARDS"
    And the Ward tray displays a close x button
    And the Ward tray displays a help button
    And the Ward tray displays a Ward Location selection box

@F1142_ward_3 @DE7713
Scenario: Verify the patient display is in specific format
	When the user opens the Ward tray
	And the user selects a ward with patients
	Then the Ward Tray contains search results
    And the Ward Tray table headers are 
    | header        |
    | Patient Name  |
    | Date of Birth |
    | Gender        |
    | Room-Bed      |
    And the Ward Tray patient name search results are in format Last Name, First Name + (First Letter in Last Name + Last 4 SSN )
    And the Ward Tray date of birth search results are in format Date (Agey)
    And the Ward Tray Room-Bed contains data
    And the Ward Tray gender search results are in terms Male, Female or Unknown

@F1142_ward_4 @DE7713
Scenario: Verify the ward tray reports when ward search does not result in a patients
	When the user opens the Ward tray
	And the user selects a ward without patients
	And the Ward Tray table headers are 
    | header        |
    | Patient Name  |
    | Date of Birth |
    | Gender        |
    | Room-Bed      |
	Then the Ward Tray no results message displays
    

@F1142_ward_5 @F1142_ward_filter
Scenario: Verify user can filter Ward list - no results
	When the user opens the Ward tray
	And the user filters the Ward Location selection box with "@"
	Then the Ward filter reports "No results found"

@F1142_ward_6 @F1142_ward_filter
Scenario: Verify user can filter Ward list 
	When the user opens the Ward tray
	And the user filters the Ward Location selection box with "7A"
	Then the Ward list only diplays rows including text "7A"

@US1976_7
Scenario: Verify user can load a patient from a Ward
	Given the user opens the Ward tray
	And the user selects a ward with patients
	And the Ward Tray contains search results
	When user chooses to load a patient from the Ward results list
    Then Overview is active
    And Current Encounter displays the expected ward

