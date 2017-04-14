# Team Europa
# Default.crs_endpoint

@F235
Feature: acceptance test for the CRS VM

@US14664_1 @deploy @crs
Scenario: Testing the CRS server is running
  When the client send a get request to the CRS server 
  Then a successful response is return
  And the CRS server returned a title "Apache Jena Fuseki"
  
 @US14664_2 @deploy @crs
 Scenario: Testing the CRS server is servicing SPARQL queries
  When sending a post request with query data " SELECT ?g WHERE { GRAPH ?g { } }"
  Then successful message returned with code "200"

  