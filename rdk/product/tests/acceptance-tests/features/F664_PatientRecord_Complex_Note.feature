@F664 @F664_PatientRecord_Complex_Note @US10697
Feature: F664 RDK Enhancements - PSI 9
# RDK resource: patient-record-complexnote

@F664_PatientRecord_Complex_Note_Scenario_1
Scenario: Search Complex Note 1
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client searches complex notes for pid of "9E7A;3" and uid of "urn:va:document:DOD:0000000003:1000000648"
  Then a successful response is returned

@F664_PatientRecord_Complex_Note_Scenario_2
Scenario: Search Complex Note 2
  When the client searches complex notes for pid of "9E7A;3" and uid of "urn:va:document:DOD:0000000003:1000000648"
  Then a successful response is returned

@F664_PatientRecord_Complex_Note_Scenario_3
Scenario: Complex Note not found
  When the client searches complex notes for pid of "9E7A;100125" and uid of "urn:va:document:DOD:0000000003:1000000648"
  Then a non-found response is returned

@F664_PatientRecord_Complex_Note_Scenario_4
Scenario: Search Complex Note With uid that is a non-complex document
  When the client searches complex notes for pid of "9E7A;3" and uid of "urn:va:document:9E7A:3:2745"
  Then a non-found response is returned
