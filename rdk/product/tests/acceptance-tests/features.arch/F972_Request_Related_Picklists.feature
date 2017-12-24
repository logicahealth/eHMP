@F972_Request_Related_Picklists @F972 @future
Feature: F972 - Create Request Activity
#Team Mars

@F972_Request_Picklist_1 @US13490 @future @JBPM
Scenario: Fetch facilities pick-list
  When the client requests picklist with the parameters for "facilities" with the user "SITE;USER  "
  | parameter name | value      |
  Then a successful response is returned
  And the picklist result contains
  | field      | value                       |
  | facilityID | 500                         |
  | vistaName  | PANORAMA (PAN) COLVILLE, WA |


@F972_Request_Picklist_2 @US13490
Scenario: Fetch people-for-facility pick-list
  When the client requests picklist with the parameters for "people-for-facility" with the user "SITE;USER  "
  | parameter name | value               |
  | facilityID     | 500                 |
  Then a successful response is returned
  And the picklist result contains
  | field    | value              |
  | personID | SITE;20112         |
  | name     | NURSE, ONE (NURSE) |


@F972_Request_Picklist_3 @US13490 @debug
Scenario: Fetch people-for-facility pick-list with no results
  When the client requests picklist with the parameters for "people-for-facility" with the user "SITE;USER  "
  | parameter name | value               |
  | facilityID     | 0                   |
  Then a successful response is returned
  And the picklist result is empty


@F972_Request_Picklist_4 @US13491 @future @JBPM
Scenario: Fetch roles pick-list
  When the client requests picklist with the parameters for "roles-for-team" with the user "SITE;USER  "
  | parameter name | value          |
  | teamID         | 1128           |
  Then a successful response is returned
  And the picklist result contains
  | field  | value          |
  | roleID | 100            |
  | name   | CONSULT TRIAGE |


@F972_Request_Picklist_5 @US13491 @future @JBPM
Scenario: Fetch teams-for-facility pick-list
  When the client requests picklist with the parameters for "teams-for-facility" with the user "SITE;USER  "
  | parameter name | value              |
  | facilityID     | 500                |
  Then a successful response is returned
  And the picklist result contains
  | field    | value                              |
  | teamID   | 1128                               |
  | teamName | Physical Therapy - 3rd floor - PAN |


@F972_Request_Picklist_6 @US13491 @future @JBPM
Scenario: Fetch teams-for-user pick-list
  When the client requests picklist with the parameters for "teams-for-user" with the user "SITE;USER  "
  | parameter name | value          |
  | staffIEN       | 9037           |
  Then a successful response is returned
  And the picklist result contains
  | field    | value                         |
  | teamID   | 1129                          |
  | teamName | Primary Care -2nd Floor - KDK |


@F972_Request_Picklist_7 @US13491 @future
Scenario: Fetch teams-for-user-patient-related pick-list
  When the client requests picklist with the parameters for "teams-for-user-patient-related" with the user "SITE;USER  "
  | parameter name | value                          |
  | staffIEN       | 9037                           |
  | patientID      | 666965487                      |
  Then a successful response is returned
  And the picklist result contains
  | field    | value                         |
  | teamID   | 1129                          |
  | teamName | Primary Care -2nd Floor - KDK |


@F972_Request_Picklist_8 @US13491 @future
Scenario: Fetch teams-for-facility-patient-related pick-list
  When the client requests picklist with the parameters for "teams-for-facility-patient-related" with the user "SITE;USER  "
  | parameter name | value                              |
  | facilityID     | 500                                |
  | patientID      | 666223456                          |
  Then a successful response is returned
  And the picklist result contains
  | field    | value                         |
  | teamID   | 1131                          |
  | teamName | Primary Care -2nd Floor - PAN |











