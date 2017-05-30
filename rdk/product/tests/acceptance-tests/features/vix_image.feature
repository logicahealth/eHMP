#Team Vista Imaging

Feature: Vista Imaging Perfomance Enhnancements

@Vix_Single_Study

Scenario: Fetch metadata for single imaging
  
  When the client request metadata for an imaging study for the patient with all parameters
  | pid       | siteNumber     | contextId |
  |9E7A;8     | 500    		   | RPT^CPRS^3^RA^6839398.7997-1^69^CAMP MASTER^^^^^^1|

  When the client request metadata for an imaging study for the patient with missing pid parameters
  | pid       | siteNumber     | contextId |
  |           | 500    		   | RPT^CPRS^3^RA^6839398.7997-1^69^CAMP MASTER^^^^^^1|

  When the client request metadata for an imaging study for the patient with missing siteNumber parameters
  | pid       | siteNumber     | contextId |
  | 9E7A;8     |      		   | RPT^CPRS^3^RA^6839398.7997-1^69^CAMP MASTER^^^^^^1|
  
  When the client request metadata for an imaging study for the patient with missing contextId parameters
  | pid       | siteNumber     | contextId |
  | 9E7A;8    | 500     	   |           |



  
  
 

