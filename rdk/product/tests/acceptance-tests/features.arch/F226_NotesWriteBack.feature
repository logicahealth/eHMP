@Notes_Writeback  @F226
Feature: F226 - Notes (write-back)
# this test requires jbpm which isn't currently working in master branch jenkins. marking as future until this is resolved.

@future @create_Retrieve_and_delete_unsigned_notes @US7264
Scenario: Retrieving and deleting unsigned notes from eCrud
  #Given a patient with pid "5000000232V962263" has been synced through the RDK API
  When the client adds a notes for patient "9E7A;204" with content "{"encounterDateTime":"19940206080000","encounterServiceCategory":"D","locationUid":"urn:va:location:9E7A:3","author":"USER,PANORAMA","authorDisplayName":"User,Panorama","authorUid":"urn:va:user:9E7A:10000000270","documentClass":"PROGRESS NOTES","documentDefUid":"urn:va:doc-def:9E7A:1295","documentTypeName":"Progress Note","encounterName":"7AGENMEDAug14,2014","encounterUid":"urn:va:visit:9E7A:3:11420","entered":"20150527142231","facilityCode":"998","facilityName":"ABILENE(CAA)","isInterdisciplinary":"false","lastUpdateTime":"20150527142231","localId":"","localTitle":"C&P ACROMEGALY","patientIcn":"5000000232V962263","pid":"9E7A;204","patientName":"Eight,Patient","patientBirthDate":"19301010","referenceDateTime":"201505271422","status":"UNTRANSCRIBED","statusDisplayName":"Untranscribed","text":[{"author":"USER,PANORAMA","authorDisplayName":"USER,PANORAMA","authorUid":"urn:va:user:9E7A:10000000270","content":"This is a new C&P ACROMEGALY note\r created by yamini\r","dateTime":"201505271422","status":"UNSIGNED","uid":"urn:va:note:9E7A:3:114551"}],"uid":"urn:va:note:9E7A:3:114551","facilityDisplay":"BayPinesCIOTest","facilityMoniker":"BAY"}"
  Then a successful response is returned
  When the client requests unsigned notes for the patient "9E7A;204"
  Then a successful response is returned
  And the results contain
      | name                | value              |
      | data.items.notes.encounterName | 7AGENMEDAug14,2014 |
      | data.items.notes.text.status   | UNSIGNED           |
  When the client requests to delete an unsigned notes for the patient "9E7A;204"
  Then a successful response is returned