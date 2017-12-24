@F1222 @Activities_applet @reg1
Feature: F1222 - Display Activity information in patient record text search results

#Team Application
  
@f1222_add_activity_data1 @US17973 @US17974 @US17978 @US17979 
Scenario: Display found eHMP consults in the result set

  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Summary View is active
  And user creates a new Consult "Physical Therapy" with comments "med medical medicine medications"
  And user searches for "med" with timestamp appended
  Then text search results are grouped
  And there exists a main group "Consult"
  When the user expands the main group "Consult"
  And the text search main group Consult result display valid titles
  And the text search main group "Consult" results display
     | field    | search_results                  |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is present                      |
  And the text search results containing search term "med" are highlighted 
  And the user views details of the first "Consult"
  Then the modal is displayed
  And the modal contains highlighted "medications"
  And the modal contains highlighted "medicine"
  And the modal contains highlighted "medical"
  And the modal contains highlighted "med"
 
@f1222_add_activity_data2 @US17976 @US17977 @US17978 @US17979
Scenario: Display found eHMP requests in the result set

  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Summary View is active
  And user creates a new Request "Request glucose test" with details "glucose, sugar, blood sugar"
  And user searches for "glucose" with timestamp appended
  Then text search results are grouped
  And there exists a main group "RequestActivity"
  When the user expands the main group "RequestActivity"
  And the text search main group Request Activity result displays titles
  And the text search main group "RequestActivity" results display
     | field    | search_results                  |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is present                      |
  And the text search results containing search term "glucose" are highlighted 
  And the user views details of the first "RequestActivity"
  Then the modal is displayed
  And the modal contains highlighted "glucose"
  And the modal contains highlighted "sugar"
  And the modal contains highlighted "blood sugar"
