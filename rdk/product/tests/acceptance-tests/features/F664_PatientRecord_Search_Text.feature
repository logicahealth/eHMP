@F664 @F664_PatientRecord_Search_Text @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-search-text

@F664_PatientRecord_Search_Text_Scenario_1
Scenario: Search Text of lower case single word
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client searches text for pid "9E7A;3" and query "blood"
  Then a successful response is returned
  And the response contains at least 27 items

@F664_PatientRecord_Search_Text_Scenario_2
Scenario: Search Text of site with upper case word
  When the client searches text for pid "9E7A;3" and query "BLOOD"
  Then a successful response is returned
  And the response contains at least 27 items

@F664_PatientRecord_Search_Text_Scenario_3
Scenario: Search Text of multiple words
  Given a patient with pid "9E7A;253" has been synced through the RDK API
  When the client searches text for pid "9E7A;253" and query "brain imaging"
  Then a successful response is returned
  And the response contains at least 4 items

@F664_PatientRecord_Search_Text_Scenario_4
Scenario: Search Text of non-existing pid
  When the client searches text for pid "9E7A;8484" and query "blood"
  Then a non-found response is returned

@F664_PatientRecord_Search_Text_Scenario_6 @debug @DE2243
Scenario: Search Text of words with many synonyms
  Given a patient with pid "9E7A;253" has been synced through the RDK API
  When the client searches text for pid "9E7A;253" and query "m head ct scan"
  Then a internal server error response is returned

@F664_PatientRecord_Search_Text_Scenario_7 @WRM
Scenario Outline: Search Text in supported domains
  When the client searches text for pid "9E7A;3" and query "<query_text>" and types "<types>"
  Then a successful response is returned
  And the response contains at least <total_items> items

    Examples:
    | query_text | types      | total_items |
    | blood      |  document  | 6           |
    | blood      |  lab       | 10          |
    | tablet     |  med       | 13          |
    | blood      |  order     | 10          |
    | pain       |  problem   | 0           |
    | blood      |  vital     | 1           |
    | blood      |  result    | 10          |

@F664_PatientRecord_Search_Text_Scenario_8
Scenario Outline: Search Text in unsupported domains
  When the client searches text for pid "9E7A;253" and query "blood" and types "<types>"
  Then a bad request response is returned

    Examples:
    |  types         |
    |  allergy       |
    |  appointment   |
    |  consult       |
    |  cpt           |
    |  education     |
    |  exam          |
    |  factor        |
    |  image         |
    |  immunization  |
    |  mh            |
    |  obs           |
    |  pov           |
    |  procedure     |
    |  ptf           |
    |  rad           |
    |  skin          |
    |  surgery       |
    |  treatment     |
    |  visit         |
