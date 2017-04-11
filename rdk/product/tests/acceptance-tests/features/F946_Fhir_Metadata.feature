@TeamEuropa @fhir
Feature: Spec ID F946-08 Ehmp Fhir Conformance Statement
@F946_1_fhir_metadata @US12989 @fhir 
Scenario: Client can request conformance results in FHIR metadata format
  Given a patient with "conformance" in multiple VistAs
  When user sends GET request for conformance results in FHIR metadata format
  Then a successful response is returned
  