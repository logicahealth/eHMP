@F664 @F664_PatientRecord_Search_Detail_Document @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-search-detail-document

@F664_PatientRecord_Search_Detail_Document_Scenario_1 @debug
Scenario: Search Detail Document with existing pid but no matches
  When the client requests authentication with accessCode "pu1234" and verifyCode "pu1234!!" and site "9E7A" and division "500" and contentType "application/json"
  Given a patient with pid "C877;1" has been synced through the RDK API
  When the client searches for detailed documents where pid = "C877;1", query = "document", group.field = "local_title", and group.value is "ADVANCE DIRECTIVE"
  Then a non-found response is returned
