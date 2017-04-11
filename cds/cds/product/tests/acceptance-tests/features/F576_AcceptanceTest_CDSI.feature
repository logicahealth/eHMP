@F576
Feature: acceptance test for the CDSInvocation VM

@US9854 @DE6879
Scenario: CDSInvocation Results Service Healthcheck
  When I go to the cdsinvocation base url plus "/cds-results-service/rest/healthcheck"
  And a CDSInvocation "cds-results-service" healthcheck is performed
  Then a successful response is returned
  
@US9854 @DE6879
Scenario: CDSInvocation Metrics Service Healthcheck
  When I go to the cdsinvocation base url plus "/cds-metrics-service/rest/healthcheck"
  And a CDSInvocation "cds-metrics-service" healthcheck is performed  
  Then a successful response is returned
  
 @US9854
 Scenario: MongoDB server is running  
  When trying to connect to MongoDB
  Then successful message returned from MongoDB server with "It looks like you are trying to access MongoDB over HTTP on the native driver port."

 @US9854 @test
 Scenario: CDSInvocation Bounceback checking
  When sending a post request with json data "{"context": { "location": {"entityType": "Location", "id": "Location1","name":"Test Location"},"subject": {"entityType": "Subject", "id": "9E7A;253", "name": "TestSubject"},"user": {"entityType": "User", "id": "Id1","name": "Tester"} }, "parameters": { "Weight": { "resourceType": "Observation", "code": { "coding": [ { "system": "http://loinc.org", "code": "29463-7" }]},"valueQuantity": { "value": 19, "units": "lb" }, "issued": "2004-03-30T21:54:42Z",      "comments": "Comment", "issued": "2015-06-11T13:24:21Z", "status": "preliminary" }, "Height": { "resourceType": "Observation", "code": { "coding": [ { "system": "http://loinc.org",  "code": "8302-2" } ] },"valueQuantity": { "value": 680.5    }, "issued": "2004-03-30T21:54:42Z", "comments": "Comment", "status": "preliminary" } },"target": { "intentsSet": [      "BounceBack"],"mode": "Normal", "type": "Direct" }}"
  Then successful message returned with code "200"

@US9854 
Scenario: CDS Advice checking
 When sending a get request for a advice
 Then successful message returned with code "200"
 
 @US9854  
 Scenario: OPEN CDS checking
  When trying to connect to open CDS
  Then successful message returned with code "200"

@US9854 
Scenario: FHIR server checking
  When sending a get request to FHIR server
  Then successful message returned with code "200"
