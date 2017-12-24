@F1134 @JBPM @future
Feature:F1185 - PCMM Facilities Pick-list Service

  @DE7441 
  Scenario: User requests facilities picklist
    When the user requests facilities of site "SITE" and division "500"
    Then a successful response is returned
    And there are 1 facilities in the response
    And the facilities results contain
    | field           | value                       |
    | facilityID      | 500                         |
    | vistaName       | PANORAMA, COLVILLE, WA      |

  @DE7441 
  Scenario: User requests facilities picklist
    When the user requests facilities of site "SITE" and division "688"
    Then a successful response is returned
    And there are 1 facilities in the response
    And the facilities results contain
    | field           | value                                          |
    | facilityID      | 688                                            |
    | vistaName       | WASHINGTON VA MEDICAL CENTER, WASHINGTON, DC   |

  @DE7441 
  Scenario: User requests facilities picklist
    When the user requests facilities of site "SITE" and no division
    Then a successful response is returned
    And there are 4 facilities in the response
    And the facilities results contain
    | field           | value                                          |
    | facilityID      | 500                                            |
    | vistaName       | PANORAMA, COLVILLE, WA                         |
    | facilityID      | 507                                            |
    | vistaName       | KODAK, COLVILLE, WA                            |
    | facilityID      | 613                                            |
    | vistaName       | MARTINSBURG VA MEDICAL CENTER, MARTINSBURG, WV |
    | facilityID      | 688                                            |
    | vistaName       | WASHINGTON VA MEDICAL CENTER, WASHINGTON, DC   |