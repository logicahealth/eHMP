@F664 @F664_PatientRecord_Search_Suggest @US10697 @DE3815 @debug @US14684
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-search-suggest

@F664_PatientRecord_Search_Suggest_Scenario_1
Scenario: Search Text Suggestion of lower case single word
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client searches text suggestions for pid "SITE;3" and query "blood"
  Then a successful response is returned
  And the response contains at least 6 items

@F664_PatientRecord_Search_Suggest_Scenario_2
Scenario: Search Text Suggestion of site with upper case word
  When the client searches text suggestions for pid "SITE;100816" and query "PRESSURE"
  Then a successful response is returned
  And the response contains at least 2 items

@F664_PatientRecord_Search_Suggest_Scenario_3
Scenario: Search Text Suggestion of multiple words
  Given a patient with pid "SITE;253" has been synced through the RDK API
  When the client searches text suggestions for pid "SITE;253" and query "beta blockers"
  Then a successful response is returned
  And the response contains at least 1 item

@F664_PatientRecord_Search_Suggest_Scenario_4
Scenario: Search Text Suggestion of non-existing pid
  When the client searches text suggestions for pid "SITE;8484" and query "blood"
  Then a non-found response is returned

@F664_PatientRecord_Search_Suggest_Scenario_5
Scenario: Search Text Suggestion of mixed-case word
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client searches text suggestions for pid "SITE;3" and query "prEssUrE"
  Then a successful response is returned
  And the response contains at least 2 items

@F664_PatientRecord_Search_Suggest_Scenario_6
Scenario: Search Text Suggestion of non-matching query
  Given a patient with pid "SITE;253" has been synced through the RDK API
  When the client searches text suggestions for pid "SITE;253" and query "xxxxxx yyyyy"
  Then a successful response is returned
  And the response contains only 1 item
