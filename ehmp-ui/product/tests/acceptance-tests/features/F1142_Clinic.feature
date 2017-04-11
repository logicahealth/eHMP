@F1142 @F1142_clinics @reg1
Feature: Implement Clinics search tray


@F1142_clinics_0
Scenario: Verify clinic button is display on My Site screen, user can open clinics tray and make sure clinics tray has heading clinics. Today predefined button is selected default 
  Then the my site screen displays clinics in the sidebar tray
  And the user opens clinic search tray
  And clinics tray heading is clinics
  And make sure predefined date today is selected default
 
@F1142_clinics_1
Scenario: Verify user can open the clinics tray and close with x button 
  Given the my site screen displays clinics in the sidebar tray
  When the user opens clinic search tray
  Then the Clinic tray displays a close x button
  And user selects x button to close the clinics tray

@F1142_clinics_2
Scenario: Verify nationwide tray displays a help button
    When the user opens clinic search tray
    And the clinics tray displays a help button     

@F1142_clinics_3  
Scenario: Verify user can select any item from the clinic location drop down field, select -30d button from the predefined dates. make sure the clinics list is display is in specific format
  When the user opens clinic search tray
  Then clinic location drop down field is displayed
  And user selects "cardiology" from the drop down field
  And user selects minusThirtyDays from the predefined dates
  And the clinics Tray contains search results
  And the clinics Tray table headers are 
      | header           |
      | Appt Date / Time |
      | Patient Name     |
      | Date of Birth    |
  And the clinics Tray Appt Date Time search results are in format date HH:MM
  And the clinics tray patient name search results are in format Last Name, First Name + (First Letter in Last Name + Last 4 SSN )
  And the clinics Tray date of birth search results are in format Date (Agey) - Gender (first letter)
   
  
@F1142_clinics_4  
Scenario: Verify error message when entering invalid search in clinic location drop down field
    When the user opens clinic search tray
    Then clinic location drop down field is displayed
    And user enters "!!" in the drop down field
    Then the clinic location drop down displays error message "No results found" 

@F1142_clinics_5 
Scenario: Verify user can select any item from the clinic location drop down field by not entering full name and results displays "No results found" 
    When the user opens clinic search tray
    Then clinic location drop down field is displayed
    And user enters "c" in the drop down field
    Then user selects camp and pen from the dropdown 
    And search results displays "No results found." error message 


@F1142_clinics_6
Scenario: Verify user can select -30d date button, from and today fields are currently changed, the Clinic search displays correct results with in the specific dates 
  Given the user opens clinic search tray
  And clinic location drop down field is displayed
  When user selects "cardiology" from the drop down field
  And user selects minusThirtyDays from the predefined dates
  Then the clinics Tray contains search results
  And the "From Date" input field is correctly set to "30" days in the past 
  And the Clinic Tray To Date input field is correctly set to current date 
  And the clinic search results are within the last 30 days


@F1142_clinics_7
Scenario: Verify user can select -7d date button, from and today fields are currently changed, the Clinic search displays correct results with in the specific dates 
  Given the user opens clinic search tray
  And clinic location drop down field is displayed
  When user selects "cardiology" from the drop down field
  And user selects minusSevenDays from the predefined dates
  Then the "From Date" input field is correctly set to "7" days in the past 
  And the Clinic Tray To Date input field is correctly set to current date 
  And the clinic search results are within the last 7 days

@F1142_clinics_8
Scenario: Verify user can select -1d date button, from and today fields are currently changed, the Clinic search displays correct results with in the specific dates
  When the user opens clinic search tray
  Then clinic location drop down field is displayed
  And user selects "Audiology" from the drop down field
  And user selects minusOneDay from the predefined dates
  Then the "From Date" input field is correctly set to "1" days in the past 
  And the Clinic Tray To Date input field is correctly set to current date 
  And the clinic search results are within the last 1 days

@F1142_clinics_9
Scenario: Verify user can select +1d date button, from and today fields are currently changed, the Clinic search displays correct results with in the specific dates
  When the user opens clinic search tray
  Then clinic location drop down field is displayed
  And user selects "Audiology" from the drop down field
  And user selects plusOneDay from the predefined dates
  Then the from date input field is correctly set to current date 
  And the Clinic Tray To Date input field is correctly set to 1 days from current date
  And the clinic search results are within the next 1 days

@F1142_clinics_10
Scenario: Verify user can select +7d date button, from and today fields are currently changed, the Clinic search displays correct results with in the specific dates 
  When the user opens clinic search tray
  Then clinic location drop down field is displayed
  And user selects "Audiology" from the drop down field
  And user selects plusSevenDays from the predefined dates
  Then the from date input field is correctly set to current date 
  And the Clinic Tray To Date input field is correctly set to 7 days from current date
  And the clinic search results are within the next 7 days


@F1142_clinics_11
Scenario: Verify user can select today date button, from and today fields are currently changed, the Clinic search displays correct results with in the specific dates 
  Given the user opens clinic search tray
  And clinic location drop down field is displayed
  And user selects "cardiology" from the drop down field
  And user selects plusSevenDays from the predefined dates
  And the from date input field is correctly set to current date 
  And the Clinic Tray To Date input field is correctly set to 7 days from current date
  When user selects today from the predefined dates
  Then the from date input field is correctly set to current date 
  And the Clinic Tray To Date input field is correctly set to current date  
  And the Clinic search results correctly set to current date

@F1142_clinics_12
Scenario: Verify user can enter to and from dates, selects apply button, the Clinic search displays correct results with in the specific dates
  When the user opens clinic search tray
  Then clinic location drop down field is displayed
  And user selects "cardiology" from the drop down field
  And user changes From date "02/01/2010" field 
  And user changes to date "10/10/2020" field
  And user selects apply button  
  And the clinic results displays appointment between "02/01/2010" and "10/10/2020" 

@F1142_clinics_13  
Scenario:  Verify none of the Predefined date filters are selected while a custom date range is selected 
  When the user opens clinic search tray
  And at least 1 Predefined date filter is selected
  Then clinic location drop down field is displayed
  And user selects "cardiology" from the drop down field
  And user changes From date "02/01/2010" field 
  And user changes to date "10/10/2020" field
  And user selects apply button 
  Then none of the Predefined dates filters are selected 

@F1142_clinics_14 
Scenario:  After selecting custom date range verify user can select any of the predefined dates 
  When the user opens clinic search tray
  Then clinic location drop down field is displayed
  And user selects "cardiology" from the drop down field
  And user changes From date "02/01/2010" field 
  And user changes to date "10/10/2020" field
  And user selects apply button 
  And the clinic results displays appointment between "02/01/2010" and "10/10/2020" 
  And user selects minusSevenDays from the predefined dates 
  Then the "From Date" input field is correctly set to "7" days in the past 
  And the Clinic Tray To Date input field is correctly set to current date 
  And the clinic search results are within the last 7 days


@F1142_clinics_15
Scenario: Verify error message when user enters from date more then todate 
  When the user opens clinic search tray
  Then clinic location drop down field is displayed
  And user selects "cardiology" from the drop down field
  And user changes From date "10/11/2020" field 
  And user changes to date "10/10/2010" field
  And user selects apply button  
  And from date error message is displayed currently with dates "01/01/1900" and "10/10/2010"
  And to date error message is displayed currently with dates "10/11/2020" and today + 100 years



