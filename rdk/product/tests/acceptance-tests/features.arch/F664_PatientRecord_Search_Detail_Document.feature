@F664 @F664_PatientRecord_Search_Detail_Document @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-search-detail-document

@F664_PatientRecord_Search_Detail_Document_Scenario_1 @debug
Scenario: Search Detail Document with existing pid but no matches
  When the client requests authentication with accessCode "USER  " and verifyCode "PW      " and site "SITE" and division "500" and contentType "application/json"
  Given a patient with pid "SITE;1" has been synced through the RDK API
  When the client searches for detailed documents where pid = "SITE;1", query = "document", group.field = "local_title", and group.value is "ADVANCE DIRECTIVE"
  Then a non-found response is returned
