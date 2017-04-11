@F140_globalsearch_api @F140
Feature: F140 - Global Patient Search

#Search for global patient with first name, last name, ssn and dob via the Global Patient Search Resource Server

#Team Andromeda
  @F140_globalsearch_api_1 @US2279
  Scenario Outline: When a user searches for Eight,Patient and gets results back
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global patient result contains
      | field       | value                                   |
      | givenNames  | PATIENT                                 |
      | familyName  | EIGHT                                   |
      | ssn         | *****0008                               |
      | birthDate   | 19350407                                |
      | id          | 10108V420871^NI^200M^USVHA^P            |
      | facility    | 200M                                    |
      | pid         | 10108V420871                            |
      | age         | 80                                      |
      | genderName  | Male                                    |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |
      | EIGHT       | NOT DEFINED | 666-00-0008 | NOT DEFINED | application/json    |
      | EIGHT       | PATIENT     | NOT DEFINED | NOT DEFINED | application/json    |
      | EIGHT       | PATIENT     | NOT DEFINED | 04/07/1935  | application/json    |
      | EIGHT       | PATIENT     | 666-00-0008 | 04/07/1935  | application/json    |


  @F140_globalsearch_api_2 @US2279
  Scenario Outline: When a user searches for Eight,Inpatient and gets results back
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHT                                   |
      | givenNames  | INPATIENT                               |
      | ssn         | *****0808                               |
      | birthDate   | 19450309                                |
      | genderName  | Male                                    |
      | id          | 5000000217V519385^NI^200M^USVHA^P       |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |
      | EIGHT       | NOT DEFINED | 666-00-0808 | NOT DEFINED | application/json    |
      | EIGHT       | INPATIENT   | NOT DEFINED | NOT DEFINED | application/json    |
      | EIGHT       | INPATIENT   | NOT DEFINED | 03/09/1945  | application/json    |
      | EIGHT       | INPATIENT   | 666-00-0808 | 03/09/1945  | application/json    |


  @F140_globalsearch_api_3 @US2279
  Scenario Outline: When a user searches for Eighteen,Patient and gets results back
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global patient result contains
      | field       | value                                   | contenttype         |
      | familyName  | EIGHTEEN                                | application/json    |
      | givenNames  | PATIENT                                 | application/json    |
      | ssn         | *****0018                               | application/json    |
      | birthDate   | 19350407                                | application/json    |
      | genderName  | Male                                    | application/json    |
      | id          | 10118V572553^NI^200M^USVHA^P            | application/json    |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |
      | EIGHTEEN    | NOT DEFINED | 666-00-0018 | NOT DEFINED | application/json    |
      | EIGHTEEN    | PATIENT     | NOT DEFINED | 04/07/1935  | application/json    |
      | EIGHTEEN    | PATIENT     | 666-00-0018 | 04/07/1935  | application/json    |

  @F140_globalsearch_api_4 @US2279
  Scenario Outline: When a user searches for Eight,Patient using different variations and gets error messages
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a not acceptable response is returned
    And the global response contains "<error>" message

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         | error                                                                        |
      |             | PATIENT     | NOT DEFINED | NOT DEFINED | application/json    | Last Name is required.                                                       |
      | NOT DEFINED | PATIENT     | NOT DEFINED | NOT DEFINED | application/json    | At least two fields are required to perform a search. Last Name is required. |
      | EIGHT       | NOT DEFINED | NOT DEFINED | NOT DEFINED | application/json    | At least two fields are required to perform a search. Last Name is required. |
      | {EIGHT      | PATIENT     | NOT DEFINED | NOT DEFINED | application/json    | Last Name contains illegal characters.                                       |
      | {EIGHT      | NOT DEFINED | NOT DEFINED | NOT DEFINED | application/json    | At least two fields are required to perform a search. Last Name is required. |
      | EIGHT       | {PATIENT    | NOT DEFINED | NOT DEFINED | application/json    | First Name contains illegal characters.                                      |
      | EIGHT       |             | NOT DEFINED | NOT DEFINED | application/json    | First Name contains illegal characters.                                      |
      | EIGHT       | NOT DEFINED | 0008        | NOT DEFINED | application/json    | SSN is invalid.                                                              |
      | EIGHT       | NOT DEFINED |             | NOT DEFINED | application/json    | SSN is invalid.                                                              |
      | EIGHT       | NOT DEFINED | NOT DEFINED | 1935-04-07  | application/json    | Date of Birth needs to be in MM/DD/YYYY format.                              |
      | EIGHT       | NOT DEFINED | NOT DEFINED | 04071935    | application/json    | Date of Birth needs to be in MM/DD/YYYY format.                              |
      | EIGHT       | PATIENT     | NOT DEFINED | 04071935    | application/json    | Date of Birth needs to be in MM/DD/YYYY format.                              |
      | EIGHT       | PATIENT     | NOT DEFINED | 13/07/1935  | application/json    | Date of Birth is not a valid date. It should be in MM/DD/YYYY format.        |


  @F140_globalsearch_api_5 @US2279
  Scenario Outline: When a user searches for Eight,Outpatient using different variations and gets error messages
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a not acceptable response is returned
    And the global response contains "<error>" message

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         | error                                                                        |
      |             | OUTPATIENT  | NOT DEFINED | NOT DEFINED | application/json    | Last Name is required.                                                       |
      | NOT DEFINED | OUTPATIENT  | NOT DEFINED | NOT DEFINED | application/json    | At least two fields are required to perform a search. Last Name is required. |
      | EIGHT       | NOT DEFINED | NOT DEFINED | NOT DEFINED | application/json    | At least two fields are required to perform a search. Last Name is required. |
      | {EIGHT      | OUTPATIENT  | NOT DEFINED | NOT DEFINED | application/json    | Last Name contains illegal characters.                                       |
      | {EIGHT      | NOT DEFINED | NOT DEFINED | NOT DEFINED | application/json    | At least two fields are required to perform a search. Last Name is required. |
      | EIGHT       | {OUTPATIENT | NOT DEFINED | NOT DEFINED | application/json    | First Name contains illegal characters.                                      |
      | EIGHT       |             | NOT DEFINED | NOT DEFINED | application/json    | First Name contains illegal characters.                                      |
      | EIGHT       | NOT DEFINED | 0608        | NOT DEFINED | application/json    | SSN is invalid.                                                              |
      | EIGHT       | NOT DEFINED |             | NOT DEFINED | application/json    | SSN is invalid.                                                              |
      | EIGHT       | NOT DEFINED | NOT DEFINED | 1945-03-09  | application/json    | Date of Birth needs to be in MM/DD/YYYY format.                              |
      | EIGHT       | NOT DEFINED | NOT DEFINED | 03091945    | application/json    | Date of Birth needs to be in MM/DD/YYYY format.                              |
      | EIGHT       | OUTPATIENT  | NOT DEFINED | 03091945    | application/json    | Date of Birth needs to be in MM/DD/YYYY format.                              |
      | EIGHT       | OUTPATIENT  | NOT DEFINED | 03/32/1945  | application/json    | Date of Birth is not a valid date. It should be in MM/DD/YYYY format.        |


  @F140_globalsearch_api_6 @US2279
  Scenario Outline: When a user searches for Smith,John patient and gets more than 10 results
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global response for too many results contains error message
      | field       | value                                   |
      | msg         | <error>                                 |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         | error                                                                              |
      | SMITH       | JOHN        | NOT DEFINED | NOT DEFINED | application/json    | Search returned too many results please refine your search criteria and try again. |

# These tests don't seem to belong in this feature since sync functionality is
# already tested in F117_Sync_Patient.feature
# @F140_US2039_1 @F140 @future
# Scenario: Verifies that patient is synced

# 	Given a patient with pid "9E7A;287" has been synced through the RDK API
# 	When the client queries the patientSync RDK API for pid "9E7A;287"
# 	Then patient sync status says true

# @F140_US2039_2 @F140 @future
# Scenario: Verifies that patient is unsynced

# 	Given a patient with pid "9E7A;287" has not been synced through the RDK API
# 	When the client queries the patientSync RDK API for pid "9E7A;287"
# 	Then patient sync status says false

@F140_globalsearch_api_8 @DE3534_1
   Scenario Outline: When a user searches for ICNONLY, patient and gets  1 results
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global patient result contains
      | field       | value                                   | contenttype         |
      | familyName  | ICNONLY                                | application/json    |
      | givenNames  | PATIENT                                 | application/json    |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |
      | ICNONLY    | PATIENT     | NOT DEFINED |  NOT DEFINED   | application/json    |

@F140_globalsearch_api_7 @DE3534_2
   Scenario Outline: Nationwide Search for a patient with only one match – Eighteen, Patient with DOB 4/7/1935
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global patient result contains
      | field       | value                                   | contenttype         |
      | familyName  | EIGHTEEN                                | application/json    |
      | givenNames  | PATIENT                                 | application/json    |
      | ssn         | *****0018                               | application/json    |
      | birthDate   | 19350407                                | application/json    |
      | genderName  | Male                                    | application/json    |
      | id          | 10118V572553^NI^200M^USVHA^P            | application/json    |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |
      | EIGHTEEN    | PATIENT     | NOT DEFINED |  04/07/1935   | application/json    |

  
      
 @F140_globalsearch_api_9 @DE3534_3
  Scenario Outline: Nationwide Search for a patient with 10 Results – Eight, Patient
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHT                                   |
      | givenNames  | PATIENT                               |
 
   And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHT                                   |
      | givenNames  | INPATIENT                               |
 
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHT                                   |
      | givenNames  | OUTPATIENT                               |
    
   And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHT                                   |
      | givenNames  | IMAGEPATIENT                               |
 
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHTEEN                                   |
      | givenNames  | PATIENT                               |
 
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHTEEN                                   |
      | givenNames  | OUTPATIENT                               |
 
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHTEEN                                   |
      | givenNames  | INPATIENT                               |
 
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHTEEN                                   |
      | givenNames  | IMAGEPATIENT                               |
 
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHTY                                   |
      | givenNames  | PATIENT                               |
 
    And the global patient result contains
      | field       | value                                   |
      | familyName  | EIGHTY                                   |
      | givenNames  | OUTPATIENT                               |
 
    Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |
      | EIGHT       | PATIENT | NOT DEFINED | NOT DEFINED | application/json    |

@F140_globalsearch_api_8 @DE3534_4
  Scenario Outline: Nationwide Search for a patient with 0 results – Unknown, Patient with DOB 1/1/1953
    When the client requests global patient search with lname "<lastname>" and fname "<firstname>" and ssn "<ssnumber>" and dob "<dobirth>" and Content-Type "<contenttype>"
    Then a successful response is returned
    And the global response for too many results contains error message
      | field       | value                                   |
      | msg         | <error>                                 |

      Examples:
      | lastname    | firstname   | ssnumber    | dobirth     | contenttype         |error                   |
     | Unknown    | PATIENT       | NOT DEFINED | 01/01/1953 | application/json    | No results were found. |
