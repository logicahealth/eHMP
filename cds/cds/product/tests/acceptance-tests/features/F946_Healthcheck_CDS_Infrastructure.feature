@TeamEuropa @deploy @manual
Feature: Spec ID F946-04
@F946_1_cdsdb_healthcheck @US9639
Scenario: Can connect to a mongo db (cdsdb) 
  Given that we have a browser available
  When trying to connect to MongoDB
  Then a successful response is returned

@F946_2_opencds_healthcheck @US9639
Scenario: Can connect to OPENCDS 
  Given that we have a browser available
  When trying to connect to open CDS
  Then a successful response is returned
    
@F946_3_cdsdashboard_healthcheck @US9639
Scenario: Can connect to CDSDASHBOARD
  Given that we have a browser available
  When trying to connect to cds DASHBOARD
  Then a successful response is returned
   
 @F946_4_cdsinvocation_healthcheck @US9639
 Scenario: Can connect to cds invocation
  Given that we have a browser available
  When I go to the cdsinvocation base url plus "/cds-results-service/rest/healthcheck"
  Then what I get back contains "Status = RUNNING"
