@F1207 @US17842 @TC7052
Feature: Make SOLR searched terms available to eHMP UI

#Team Platform
#Story US17842 - Make terms (synonyms) used by SOLR queries available

@F1207-1.1
Scenario: 1. Parameter returnSynonyms is omitted (default), resulting in no synonyms element returned
  When the client searches text for pid "9E7A;253" and query "cdi"
  Then a successful response is returned
  And the response does not contain array "synonyms"

@F1207-1.2
Scenario: 2. Parameter returnSynonyms is false, resulting in no synonyms element returned
  When the client searches text for pid "9E7A;253" and query "cdi" with returnSynonyms "false"
  Then a successful response is returned
  And the response does not contain array "synonyms"

@F1207-1.3
Scenario: 3. Parameter returnSynonyms is non-boolean, resulting in 4xx error
  When the client searches text for pid "9E7A;253" and query "cdi" with returnSynonyms "xxxx"
  Then a bad request response is returned

@F1207-1.4
Scenario: 4. No synonyms found returns just original term
  When the client searches text for pid "9E7A;253" and query "chocolate" with returnSynonyms "true"
  And the response contains array "synonyms"
    | synonym    |
    | chocolate  |

@F1207-1.5
Scenario: 5. One search term returning just one synonym
  When the client searches text for pid "9E7A;253" and query "(1)o(2)" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains array "synonyms"
    | synonym        |
    | singlet oxygen |

@F1207-1.6
Scenario: 6. One search term returning many synonyms (large list)
  When the client searches text for pid "9E7A;253" and query "ct" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains at least 350 synonyms

@F1207-1.7
Scenario: 7. Multiple search terms to verify duplicates are removed on synonym list
  When the client searches text for pid "9E7A;253" and query "bs" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains only 25 synonyms

  When the client searches text for pid "9E7A;253" and query "glucose" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains only 2 synonyms

  When the client searches text for pid "9E7A;253" and query "glucose bs" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains only 26 synonyms
  And the response contains array "synonyms"
    | synonym                  |
    | bachelor of science    |
    | bachelor of surgery    |
    | bartter syndrome       |
    | bartter's syndrome     |
    | bartters syndrome      |
    | behcet syndrome        |
    | behcet's syndrome      |
    | behcets syndrome       |
    | beh\u{e7}et syndrome   |
    | beh\u{e7}et's syndrome |
    | bile salt              |
    | binding site           |
    | binding-site           |
    | blood sugar            |
    | blood-sugar            |
    | bloodsugar             |
    | bloom syndrome         |
    | body surface           |
    | bone scan              |
    | bone scintigraphy      |
    | bowel sounds           |
    | brain stem             |
    | brain-stem             |
    | brainstem              |
    | breath sounds          |
    | sugar                  |

@F1207-1.8
Scenario: 8. Search term where synonym file has duplicate but one is quoted and other is not
  When the client searches text for pid "9E7A;253" and query "blood sugar" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains array "synonyms"
    | synonym         |
    | blood           |
    | blood sugar     |
    | dextrose        |
    | glucose=> other |
    | sugar           |

@F1207-1.9
Scenario: 9. Multiple terms where one has a synonym and the other does not
  When the client searches text for pid "9E7A;253" and query "chocolate (1)o(2)" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains array "synonyms"
    | synonym                   |
    | chocolate                 |
    | singlet oxygen            |

@F1207-1.10
Scenario: 10. Multiple terms where at least one has synonyms, changing search term order does not change list
  When the client searches text for pid "9E7A;253" and query "chocolate bs" with returnSynonyms "true"
  Then a successful response is returned
  And the returned "synonyms" list is saved
  When the client searches text for pid "9E7A;253" and query "bs chocolate" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains at least 2 synonyms
  And the first "synonyms" list matches the second list

@F1207-1.11
Scenario: 11. Both terms where each term individually do not have synonyms (Compare with Scenario #8)
  When the client searches text for pid "9E7A;253" and query "sugar blood" with returnSynonyms "true"
  Then a successful response is returned
  And the response contains array "synonyms"
    | synonym   |
    | blood     |
    | sugar     |
