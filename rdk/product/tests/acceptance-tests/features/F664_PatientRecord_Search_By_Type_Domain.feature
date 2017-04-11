@F664 @F664_PatientRecord_Search_By_Type_Domain @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-searchbytype-{domain}

@F664_PatientRecord_Search_By_Type_Domain_Scenario_1
Scenario: Search Domain lab with start date
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client searches domain "lab" by type for pid = "9E7A;3" and type = "HGB" and date.start = "20150101"
  Then a successful response is returned
  And the response contains at least 2 items

@F664_PatientRecord_Search_By_Type_Domain_Scenario_2
Scenario: Search Domain lab #2
  Given a patient with pid "9E7A;100125" has been synced through the RDK API
  When the client searches domain "immunization" by type for pid = "9E7A;100125" and type = "PNEUMOCOCCAL" and date.start "19990101"
  Then a successful response is returned
  And the response contains at least 1 items

@F664_PatientRecord_Search_By_Type_Domain_Scenario_3
Scenario: Search Domain vital
  Given a patient with pid "9E7A;253" has been synced through the RDK API
  When the client searches domain "vital" by type for pid = "9E7A;253" and type = "TEMPERATURE" and date.start = "20150101"
  Then a successful response is returned
  And the response contains at least 2 items

@F664_PatientRecord_Search_By_Type_Domain_Scenario_4
Scenario: Search Domain with no match in date range
  Given a patient with pid "9E7A;253" has been synced through the RDK API
  When the client searches domain "vital" by type for pid = "9E7A;253", type = "TEMPERATURE", date.start = "20150101000000", and date.end = "20150128000000"
  Then a successful response is returned
  And the response contains 0 items

@F664_PatientRecord_Search_By_Type_Domain_Scenario_5
Scenario: Search with match in date range
  Given a patient with pid "9E7A;253" has been synced through the RDK API
  When the client searches domain "vital" by type for pid = "9E7A;253", type = "TEMPERATURE", date.start = "20150201000000", and date.end = "20150228000000"
  Then a successful response is returned
  And the response contains 2 items

@F664_PatientRecord_Search_By_Type_Domain_Scenario_6
Scenario: Search non-existing type
  Given a patient with pid "9E7A;253" has been synced through the RDK API
  When the client searches domain "vital" by type for pid = "9E7A;253", type = "NOT-EXIST"
  Then a successful response is returned
  But the response contains 0 items
  And the response contains field "totalItems" which is "0"

@F664_PatientRecord_Search_By_Type_Domain_Scenario_7
Scenario: Search non-existing pid
  When the client searches domain "vital" by type for pid = "77777V99999", type = "TEMPERATURE"
  Then a non-found response is returned

@F664_PatientRecord_Search_By_Type_Domain_Scenario_8
Scenario: Search Domain lab without start date
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client searches domain "lab" by type for pid = "9E7A;3" and type = "HGB"
  Then a successful response is returned
  Given the response contains matched data items
  Then all "observed" values are within the past 1 year
