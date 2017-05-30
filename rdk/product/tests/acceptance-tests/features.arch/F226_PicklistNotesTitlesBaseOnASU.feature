
@picklists_notes_titles_with_new_rpc_ASU_Rules @future

Feature:F226 - Enter Plain Text Basic Progress Notes  (TIU)

@F226_1_List_Of_Notes_Titles_based_on_ASU_Rules @US10978
Scenario: Filter Note Titles Pick-lists with New RPC based on ASU Rules
  When the client requests a picklist with the parameters for "progress-notes-titles-asu-filtered" with the user "9E7A;nurse18"
      | paramter name | value         |
      | docStatus      | UNTRANSCRIBED |
      | actionNames    | ENTRY         |
      
  Then a successful response is returned
  And the picklist result contains 
      | field | value                        |
      | ien   | 1295                         |
      | name  | ACROMEGALY  <C&P ACROMEGALY> |
      And the picklist result contains 
      | field | value          |
      | ien   | 1295           |
      | name  | C&P ACROMEGALY |
      And the picklist result contains 
      | field | value                            |
      | ien   | 1295                             |
      | name  | C&P ACROMEGALY  <C&P ACROMEGALY> |
      And the picklist result contains
      | field | value |
      | ien   | 1649 |
      | name  | CONTAINS EVALUATION  <NURSING SURGICAL EVALUATION UNIT  > |


@F226_2_List_Of_Notes_Titles_based_on_ASU_Rules @US10978
Scenario: Filter Note Titles Pick-lists with New RPC based on ASU Rules
  When the client requests a picklist with the parameters for "progress-notes-titles-asu-filtered" with the user "REDACTED"
      | paramter name  | value         |
      | docStatus      | UNTRANSCRIBED |
      | actionNames    | ENTRY         |
  Then a successful response is returned
  And the picklist result contains 
      | field | value                        |
      | ien   | 1295                         |
      | name  | ACROMEGALY  <C&P ACROMEGALY> |
      And the picklist result contains 
      | field | value          |
      | ien   | 1295           |
      | name  | C&P ACROMEGALY |
      And the picklist result contains 
      | field | value                            |
      | ien   | 1295                             |
      | name  | C&P ACROMEGALY  <C&P ACROMEGALY> |
     