
Feature:F946 - v2.0 Production CDS Infrastructure
#Team_Europa

@F946_1 @US13223
  Scenario: Client can request HealthFactors by sending extended FHIR API
  When the client requests healthfactors for the patient "9E7A;253"
  Then a successful response is returned
  And only healthfactors returned
 
@F946_2 @US13223
  Scenario: Client can request both healthfactors and vitals by sending extened FHIR API
  When the client requests both healthfactors and vitals for the patient "9E7A;253"
  Then a successful response is returned
  And both healthfactors and vitals results contain "Observation"
      | name                          | value                        |
      | resource.code.coding.display  | TEMPERATURE                  |
      | resource.resourceType         | Observation                  |
  And both healthfactors and vitals results contain "Observation"
      | resource.text.div  | <div>REFUSES HEPATITIS C TESTING</div>  |
      
@F946_3 @US13223
  Scenario: Client can request Vitals by sending extended FHIR API
  When the client requests Vitals for the patient "9E7A;253"
  Then a successful response is returned
  And only Vitals returned
  
@F946_4 @US13223

  Scenario: Client can request Observation in filtering count by sending extened FHIR API
  When the client requests Observations in filtering count for the patient "9E7A;253"
  Then a successful response is returned
  
@F946_5 @US13223
  Scenario:  Client can request Observation in sorting date by sending extened FHIR API
  When the client requests Observations in sorting date for the patient "9E7A;253"
  Then a successful response is returned
  
@F946_6 @US13223
  Scenario:  Client can request Observation in filtering date range by sending extened FHIR API
  When the client requests Observations in filtering date range for the patient "9E7A;253"
  Then a successful response is returned
  

  
  