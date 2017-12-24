@cds
Feature: F728 - Advanced CDS Infrastructure Integration 

@US10762_1 
Scenario: Create CDS Engine Registry Entry and delete it
     When the entry is deleted
     When user sends POST request to create cds engine registry entry with payload "{"name": "testingEngineRegistry","description": "engine one registry entry","class": "com.cognitive.cds.invocation.model.EngineInfo","type":"OpenCDS","version": "2.0.5","environment": "memory: 32,cpus: 8,java_version:7,webservice: tomcat, webservice_version: 7"}"
     And successful response returned.
     Then get registry
     Then delete the entry
     
@US10762_2
Scenario: Create CDS Engine Registry Entry, modify it and then delete it
     When the entry is deleted
     When user sends POST request to create cds engine registry entry with payload "{"name": "testingEngineRegistry","description": "engine one registry entry","class": "com.cognitive.cds.invocation.model.EngineInfo","type":"OpenCDS","version": "2.0.5","environment": "memory: 32,cpus: 8,java_version:7,webservice: tomcat, webservice_version: 7"}"
     And successful response returned.
     And modify the entry with payload "{"name": "testingEngineRegistry","description": "modified engine registry entry","class": "com.cognitive.cds.invocation.model.EngineInfo","type":"OpenCDS","version": "2.0.5","environment": "memory: 32,cpus: 8,java_version:7,webservice: tomcat, webservice_version: 7"}"
     Then delete modified entry
     
@US10762_3
Scenario: Create CDS Engine Registry Entry, request CDS engine by name and then delete it
     When the entry is deleted
     When user sends POST request to create cds engine registry entry with payload "{"name": "testingEngineRegistry","description": "engine one registry entry","class": "com.cognitive.cds.invocation.model.EngineInfo","type":"OpenCDS","version": "2.0.5","environment": "memory: 32,cpus: 8,java_version:7,webservice: tomcat, webservice_version: 7"}"
     And successful response returned.
     And request CDS engine by name 
     Then delete the entry
     
@US10762_4
Scenario: Create CDS Engine Registry Entry, request CDS engine by ID and then delete it
     When the entry is deleted
     When user sends POST request to create cds engine registry entry with payload "{"name": "testingEngineRegistry","description": "engine one registry entry","class": "com.cognitive.cds.invocation.model.EngineInfo","type":"OpenCDS","version": "2.0.5","environment": "memory: 32,cpus: 8,java_version:7,webservice: tomcat, webservice_version: 7"}"
     And successful response returned.
     And request CDS engine by filter
     Then delete the entry
     
@F728 @US12203  @DE3688 @DE3761
 Scenario: Test for alternate patient IDs when retrieving persisted content related to patient ID (Patient List)
      When the entry is deleted
      Given the patient identifiers list from patient "SITE;140" by calling RDK
      When user sends request to create patient list with content "{"name":"Testing","definition":{"name":"def one","description": "user defined description of this definition template","expression": "{and: [ {or: ['A.A','B.B'], {'A.A'} ]}","date": "2015-03-26T00:14:01.880Z","scope": "private","owner": "SITE;PW","_id": "55134f49857b41493e747d99"},"patients":["SITE;1","SITE;140","VLER;5000000342V438646"]}"
      Then a successful response is returned for created 
      When the client send a request for patient list membership status with one identifier 
      Then the message true returned
      When the client send a request for patient list membership status with another identifier
      Then the message true returned
      And delete the patient list created before
      
   