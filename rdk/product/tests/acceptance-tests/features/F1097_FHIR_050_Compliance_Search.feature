 # Team Europa

 Feature: F1097 - v2.0 PSI 12 Production CDS Infrastructure
 
 @F1097_search_1 @US12981
 Scenario: Client can use GET method with compartment-style for the search capability
 When the client use GET requests with compartment-style for patient "SITE;204" of "condition"
 Then a successful response is returned
 And the returned json data meet the requirement of FHIR050_Condition
 And required element "resourceType" is "condition" returned

 @F1097_search_2 @US12981
 Scenario: Client can use POST method with compartment-style for the search capability
 When the client use POST requests with compartment-style for patient "SITE;204" of "condition"
 Then a successful response is returned
 And the returned json data meet the requirement of FHIR050_Condition
 And required element "resourceType" is "condition" returned
 
 @F1097_search_3 @US12981
 Scenario: Client can use GET method with direct-resource-access-style for the search capability
 When the client use GET requests with direct-resource-access-style for patient "SITE;204" of "composition"
 Then a successful response is returned
 And the returned json data meet the requirement of FHIR050_Condition
 And required element "resourceType" is "composition" returned     
        
 @F1097_search_4 @US12981
 Scenario: Client can use POST method with direct-resource-access-style for the search capability
 When the client use POST requests with direct-resource-access-style for patient "SITE;204" of "composition"
 Then a successful response is returned
 And the returned json data meet the requirement of FHIR050_Condition
 And required element "resourceType" is "composition" returned  
 