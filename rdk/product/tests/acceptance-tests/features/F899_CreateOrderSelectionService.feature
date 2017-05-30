
@F899
Feature:F899 - Create Order Selection Service (RESTFul Service) that enables the user to Select an orderable from a Local VistA
#Team_Europa



@F899_2_Orderables_Search @US14251 @DE4432
  Scenario: Extend Enterprise Orderable API to support filtration by domain and subdomain
  When the client send a enterprise-orderable request for domain "ehmp-activity" and subdomain "consult" with orderable name "Physical Therapy"
  Then the field of domain in the enterprise-orderable data contains a string "ehmp-activity"
  And the field of subdomain in the enterprise-orderable data contains a string "consult"
  And the field of name in the enterprise-orderable data contains a string "Physical Therapy"
