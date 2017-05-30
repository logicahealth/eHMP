@F1142 @US17646
Feature: Home Page usability (Staff View) - Standardize patient search resource response

@TC6822_1
Scenario: Standardize the no results response for patient search resources - My CPRS list
  When the client "REDACTED" requests CPRS list patient search results
  Then a successful response is returned
  And the response message is "No results found. Please make sure your CPRS Default Search is configured properly."

@TC6822_2
Scenario: Standardize the no results response for patient search resources - My Site
  When the client requests full name patient search with name "NoExpectedResults"
  Then a successful response is returned
  And the response message is "No results found. Verify search criteria."

# marking below as future because it has the potential to fail on people's local env
# if they perform a patient search with the provided credentials ( in rdk or ui ) then this test will start failing
@TC6822_3 @future
Scenario: Standardize the no results response for patient search resources - Recent Patients
  When the client "REDACTED" requests Recent Patient patient search results
  Then a successful response is returned
  And the response message is "No results found."

@TC6822_4
Scenario: Standardize the no results response for patient search resources - Clinics
  When the client requests Clinics patient search results for a clinic without patients
  Then a successful response is returned
  And the response message is "No results found."

@TC6822_5
Scenario: Standardize the no results response for patient search resources - Wards
  When the client requests Wards patient search results for a ward without patients
  Then a successful response is returned
  And the response message is "No results found."

@TC6822_6
Scenario: Standardize the no results response for patient search resources - Nationwide
  When the client requests global patient search with lname "NoExpectedResults" and fname "Patient" and ssn "666-00-0000" and dob "01/01/2012" and Content-Type "application/json"
  Then a successful response is returned
  And the response message is "No results found. Verify search criteria."

@TC6881
Scenario: Update nationwide search displayName mixed case
  When the client requests global patient search with lname "Eight" and fname "Patient" and ssn "666-00-0008" and dob "04/07/1935" and Content-Type "application/json"

  Then a successful response is returned
  Then the nationwide search results displayName are mixed case