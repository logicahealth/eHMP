@F664 @F664_PatientRecord_Search_Detail_Trend @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-search-detail-trend

@F664_PatientRecord_Search_Detail_Trend_Scenario_1
Scenario: Search Detail Trend med
  Given a patient with pid "9E7A;8" has been synced through the RDK API
  When the client searches detailed trends for pid "9E7A;8" with uid "urn:va:med:9E7A:8:8145"
  Then a successful response is returned
  And the response contains at least 2 items

@F664_PatientRecord_Search_Detail_Trend_Scenario_2
Scenario: Search Detail Trend
  Given a patient with pid "9E7A;100125" has been synced through the RDK API
  When the client searches detailed trends for pid "9E7A;100125" with uid "urn:va:med:9016:5000000009V082878:5587940"
  Then a successful response is returned
  And the response contains at least 1 item

@F664_PatientRecord_Search_Detail_Trend_Scenario_3
Scenario: Search Detail Trend with non-existing uid
  Given a patient with pid "9E7A;100125" has been synced through the RDK API
  When the client searches detailed trends for pid "9E7A;100125" with uid "urn:va:med:9016:5000000009V082878:0000"
  Then a non-found response is returned

@F664_PatientRecord_Search_Detail_Trend_Scenario_4
Scenario: Search Detail Trend with non-existing pid
  When the client searches detailed trends for pid "9E7A;5000000009" with uid "urn:va:med:9016:5000000009V082878:5587940"
  Then a non-found response is returned

@F664_PatientRecord_Search_Detail_Trend_Scenario_5
Scenario: Search Detail Trend with uid of different pid
  Given a patient with pid "9E7A;100125" has been synced through the RDK API
  When the client searches detailed trends for pid "9E7A;100125" with uid "urn:va:med:9E7A:8:8145"
  Then a non-found response is returned
