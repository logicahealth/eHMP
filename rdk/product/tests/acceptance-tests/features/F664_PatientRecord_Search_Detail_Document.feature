@F664 @F664_PatientRecord_Search_Detail_Document @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-search-detail-document

@F664_PatientRecord_Search_Detail_Document_Scenario_1
Scenario: Search Detail Document with existing pid but no matches
  When the client requests authentication with accessCode "pu1234" and verifyCode "pu1234!!" and site "9E7A" and division "500" and contentType "application/json"
  Given a patient with pid "C877;1" has been synced through the RDK API
  When the client searches for detailed documents where pid = "C877;1", query = "document", group.field = "local_title", and group.value is "ADVANCE DIRECTIVE"
  Then a successful response is returned

@F664_PatientRecord_Search_Detail_Document_Scenario_2
Scenario: Search Detail Document with site
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client searches for detailed documents where pid = "9E7A;3", query = "document", group.field = "local_title", and group.value is "ADVANCE DIRECTIVE"
  Then a successful response is returned
  And the response contains at least 2 items

 @F664_PatientRecord_Search_Detail_Document_Scenario_3 @de7147
Scenario: Search Detail Document with 1 result
  Given a patient with pid "9E7A;100125" has been synced through the RDK API
  When the client searches for detailed documents where pid = "9E7A;100125", query = "document", group.field = "local_title", and group.value is "ADMISSION REVIEW - NURSING"
  Then a successful response is returned
  And the response contains 2 results

@F664_PatientRecord_Search_Detail_Document_Scenario_4
Scenario: Search Detail Document with missing query
  Given a patient with pid "9E7A;100125" has been synced through the RDK API
  When the client searches for detailed documents where pid = "9E7A;100125", group.field = "local_title", and group.value is "ADVANCE DIRECTIVE"
  Then a bad request response is returned

@F664_PatientRecord_Search_Detail_Document_Scenario_5
Scenario: Search Detail Document with non-existing icn
  When the client searches for detailed documents where pid = "848V484", query = "document", group.field = "local_title", and group.value is "ADVANCE DIRECTIVE"
  Then a non-found response is returned
