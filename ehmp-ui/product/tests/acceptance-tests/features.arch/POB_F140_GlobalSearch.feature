@future
Feature: F140 – All Patient Search
  This feature will allow a user to search for patients globally in eHMP through a global patient search feature MVI.
  Once the search criteria is entered, a maximum of 10 results will be shown. If there are more than 10 results,
  than no results will be returned.  This also searches for sensitive patient.

# POC: Team EnterPrise
# Updated by Saikat Barua on Dec, 10th 2015

Scenario: search with full last name and ssn
  Given POB user is logged into EHMP-UI successfully
  And POB the user is on all patient tab Nationwide
  When POB user enters last name in all patient search as "Eight"
  And POB user enters ssn in all patient search as "666000008"
  And POB the user click on All Patient Search
  And POB user selects "Eight, Patient"
  And POB "EIGHT, PATIENT" confirmation section header displays below information
    | field       | value         |
    | DOB         | 04/07/1935    |
    | Age         | 80y           |
    | Gender      | Male          |
    | SSN         | ***-**-0008   |
  And POB user clicks on confirm Flagged Patient Button
  And POB Overview is active
  Then POB "Eight,Patient" information is displayed in overview
    | field       | value         |
    | DOB         | 04/07/1935    |
    | Age         | 80y           |
    | Gender      | Male          |
    | SSN         | ***-**-0008   |

#@f140_3_lastNameDOBSearch @US1977 @DE3047
Scenario: search with full last name and date of birth
  Given POB user is logged into EHMP-UI successfully
  And POB the user is on all patient tab Nationwide
  When POB user enters last name in all patient search as "Eight"
  And POB user enters date of birth in all patient search as "04071935"
  And POB the user click on All Patient Search
  And POB user selects "Eight, Patient"
  And POB "EIGHT, PATIENT" confirmation section header displays below information
    | field       | value         |
    | DOB         | 04/07/1935    |
    | Age         | 80y           |
    | Gender      | Male          |
    | SSN         | ***-**-0008   |
  And POB user clicks on confirm Flagged Patient Button
  And POB Overview is active
  Then POB "Eight,Patient" information is displayed in overview
    | field       | value         |
    | DOB         | 04/07/1935    |
    | Age         | 80y           |
    | Gender      | Male          |
    | SSN         | ***-**-0008   |

