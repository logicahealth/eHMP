@Notes_Writeback  @F226
Feature: F226 - Notes (write-back)
# this test requires jbpm which isn't currently working in master branch jenkins. marking as future until this is resolved.



@enforce_ASU_rules @US10552
Scenario: Attempt to create a note with an unauthorized title
  #Given a patient with pid "5000000232V962263" has been synced through the RDK API
  When the client adds a notes for patient "9E7A;204" with content "{"author":"USER,PANORAMA","authorDisplayName":"USER,PANORAMA","authorUid":"urn:va:user:9E7A:10000000270","documentClass":"PROGRESS NOTES","documentDefUid":"urn:va:doc-def:9E7A:116","documentTypeName":"Progress Note","encounterName":"7AGENMEDAug14,2014","encounterUid":"urn:va:visit:9E7A:3:11420","entered":"20150527142231","facilityCode":"998","facilityName":"ABILENE(CAA)","isInterdisciplinary":"false","lastUpdateTime":"20150527142231","localId":"","localTitle":"NURSING NOTE","patientIcn":"5000000232V962263","pid":"9E7A;204","referenceDateTime":"201505271422","status":"UNTRANSCRIBED","statusDisplayName":"Untranscribed","text":[{"author":"USER,PANORAMA","authorDisplayName":"USER,PANORAMA","authorUid":"urn:va:user:9E7A:10000000270","content":"This is a new C&P ACROMEGALY note\r created by yamini\r","dateTime":"201505271422","status":"UNSIGNED","uid":"urn:va:note:9E7A:3:114551"}],"uid":"urn:va:note:9E7A:3:114551","facilityDisplay":"BayPinesCIOTest","facilityMoniker":"BAY"}"
  Then an unauthorized response is returned
