
@F899
Feature:F899 - Create Order Selection Service (RESTFul Service) that enables the user to Select an orderable from a Local VistA
#Team_Europa

@F899_1_Orderables_Search @US11561 @DE4192
  Scenario: The returned orderables data contains searching strings
  Given the client requests picklist with the parameters for "orderables" with the user "9E7A;vk1234"
  | paramter name | value                 |
  | subtype       | All                   |
  | searchString  | URINE                 |
  And a successful response is returned
  When the client send a orderable request for searching string "URINE"
  Then the field of name in the orderable data contains a string "URINE"
  And the field of type in the orderable data contains a string "vista-orderable"
  And the field of domain in the orderable data contains a string "ehmp-order"
  And the field of subDomain in the orderable data contains a string "laboratory"
  And the field of state in the orderable data contains a string "active"
  And the field of facility-enterprise in the orderable data contains a string "9E7A"

@F899_2_Orderables_Search @US14251 @DE4432
  Scenario: Extend Enterprise Orderable API to support filtration by domain and subdomain
  When the client send a enterprise-orderable request for domain "ehmp-activity" and subdomain "consult" with orderable name "Physical Therapy"
  Then the field of domain in the enterprise-orderable data contains a string "ehmp-activity"
  And the field of subdomain in the enterprise-orderable data contains a string "consult"
  And the field of name in the enterprise-orderable data contains a string "Physical Therapy"
