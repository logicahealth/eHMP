@F972_Create_Request_Activity @F972 @US13511 @future
Feature: F972 - Create Request Activity
# POC: Team Mars

@F972_Request_Activity_1 @US13511 @US13514
Scenario: Save and Delete Request Activity Draft Assigned to Me
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "routine" ,                           |
    |     "earliest": "system_start_date(0)" ,             |
    |     "latest": "system_end_date(3)",                  |
    |     "requestDetails": "Just a routine request",      |
    |     "me": true                                       |
    |   }                                                  |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field               | value                  |
    | displayName         | activity               |
    | ehmpState           | draft                  |
    | data.urgency        | routine                |
    | data.me             | IS_SET                 |
    | data.earliest       | system_start_date(0)   |
    | data.latest         | system_end_date(3)     |
    | data.requestDetails | Just a routine request |
  When the "activity" Clinical "request" in "draft" state is deleted for patient "SITE;3"
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field               | value                  |
    | displayName         | activity               |
    | ehmpState           | deleted                |
    | data.urgency        | routine                |
    | data.me             | IS_SET                 |
    | data.earliest       | system_start_date(0)   |
    | data.latest         | system_end_date(3)     |
    | data.requestDetails | Just a routine request |


# ----------------------------------------------------------------------------
@F972_Request_Activity_2 @US13511 @US13514
Scenario: Save and Delete Request Activity Draft Assigned to Person
  Given a "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                                              |
    |   "data": {                                                         |
    |     "urgency": "emergent" ,                                         |
    |     "earliest": "system_start_date(1)" ,                            |
    |     "latest": "system_end_date(3)",                                 |
    |     "requestDetails": "A request PROVIDER,THIRTY at ABILENE (CAA)", |
    |     "person": {                                                     |
    |       "assignedFacility": "998",                                    |
    |       "assignedPerson" : "urn:va:user:SITE:1057"                    |
    |     }                                                               |
    |   }                                                                 |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field                           | value                                      |
    | displayName                     | activity                                   |
    | data.urgency                    | emergent                                   |
    | data.earliest                   | system_start_date(1)                       |
    | data.latest                     | system_end_date(3)                         |
    | data.requestDetails             | A request PROVIDER,THIRTY at ABILENE (CAA) |
    | data.person.assignedFacility    | 998                                        |
    | data.person.assignedPerson      | urn:va:user:SITE:1057                      |
  When the "activity" Clinical "request" in "draft" state is deleted for patient "SITE;3" with:
    | field               | value                  |
    | urgency             | not-valid              |
    | earliest            | zzzzz                  |
    | latest              | xxxxx                  |
    | requestDetails      | 123456789A123456789B123456789C123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field               | value                  |
    | ehmpState           | deleted                |
    | data.urgency        | not-valid              |
    | data.earliest       | zzzzz                  |
    | data.latest         | xxxxx                  |
    | data.requestDetails | 123456789A123456789B123456789C123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o |


@F972_Request_Activity_3 @US13511 @US13514
Scenario: Save and Delete Request Activity Draft Assigned to My Teams
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                                               |
    |   "data": {                                                          |
    |     "urgency": "emergent" ,                                          |
    |     "earliest": "system_start_date(1)" ,                             |
    |     "latest": "system_end_date(3)",                                  |
    |     "requestDetails": "This is request details",                     |
    |     "myTeams": {                                                     |
    |       "assignedTeam": {                                              |
    |         "id": "451",                                                 |
    |         "name": "edmPrimaryCare"                                     |
    |       },                                                             |
    |       "assignedRoles": [                                             |
    |         { "id": "90", "name": "REHABILITATION THERAPIST"          }, |
    |         { "id": "53", "name": "POLYTRAUMA CASE MANAGER"           }, |
    |         { "id": "96", "name": "RESPIRATORY THERAPIST"             }, |
    |         { "id": "19", "name": "CLERK"                             }, |
    |         { "id": "20", "name": "MEDICAL STUDENT"                   }, |
    |         { "id": "24", "name": "NURSE PRACTITIONER"                }, |
    |         { "id": "76", "name": "RECREATION THERAPIST"              }, |
    |         { "id": "50", "name": "TRAINEE"                           }, |
    |         { "id": "28", "name": "OCCUPATIONAL THERAPIST"            }, |
    |         { "id": "30", "name": "TCM TRANSITION PATIENT ADVOCATE"   }  |
    |       ]                                                              |
    |     }                                                                |
    |   }                                                                  |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field                           | value                           |
    | displayName                     | activity                        |
    | data.urgency                    | emergent                        |
    | data.earliest                   | system_start_date(1)            |
    | data.latest                     | system_end_date(3)              |
    | data.requestDetails             | This is request details         |
    | data.myTeams.assignedTeam.id    | 451                             |
    | data.myTeams.assignedTeam.name  | edmPrimaryCare                  |
    | data.myTeams.assignedRoles.id   | 90                              |
    | data.myTeams.assignedRoles.name | REHABILITATION THERAPIST        |
    | data.myTeams.assignedRoles.id   | 53                              |
    | data.myTeams.assignedRoles.name | POLYTRAUMA CASE MANAGER         |
    | data.myTeams.assignedRoles.id   | 96                              |
    | data.myTeams.assignedRoles.name | RESPIRATORY THERAPIST           |
    | data.myTeams.assignedRoles.id   | 19                              |
    | data.myTeams.assignedRoles.name | CLERK                           |
    | data.myTeams.assignedRoles.id   | 20                              |
    | data.myTeams.assignedRoles.name | MEDICAL STUDENT                 |
    | data.myTeams.assignedRoles.id   | 24                              |
    | data.myTeams.assignedRoles.name | NURSE PRACTITIONER              |
    | data.myTeams.assignedRoles.id   | 76                              |
    | data.myTeams.assignedRoles.name | RECREATION THERAPIST            |
    | data.myTeams.assignedRoles.id   | 50                              |
    | data.myTeams.assignedRoles.name | TRAINEE                         |
    | data.myTeams.assignedRoles.id   | 28                              |
    | data.myTeams.assignedRoles.name | OCCUPATIONAL THERAPIST          |
    | data.myTeams.assignedRoles.id   | 30                              |
    | data.myTeams.assignedRoles.name | TCM TRANSITION PATIENT ADVOCATE |
  When the "activity" Clinical "request" in "draft" state is deleted for patient "SITE;3"
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field                           | value                           |
    | ehmpState                       | deleted                         |
    | displayName                     | activity                        |
    | data.urgency                    | emergent                        |
    | data.earliest                   | system_start_date(1)            |
    | data.latest                     | system_end_date(3)              |
    | data.requestDetails             | This is request details         |
    | data.myTeams.assignedTeam.id    | 451                             |
    | data.myTeams.assignedTeam.name  | edmPrimaryCare                  |
    | data.myTeams.assignedRoles.id   | 90                              |
    | data.myTeams.assignedRoles.name | REHABILITATION THERAPIST        |
    | data.myTeams.assignedRoles.id   | 53                              |
    | data.myTeams.assignedRoles.name | POLYTRAUMA CASE MANAGER         |
    | data.myTeams.assignedRoles.id   | 96                              |
    | data.myTeams.assignedRoles.name | RESPIRATORY THERAPIST           |
    | data.myTeams.assignedRoles.id   | 19                              |
    | data.myTeams.assignedRoles.name | CLERK                           |
    | data.myTeams.assignedRoles.id   | 20                              |
    | data.myTeams.assignedRoles.name | MEDICAL STUDENT                 |
    | data.myTeams.assignedRoles.id   | 24                              |
    | data.myTeams.assignedRoles.name | NURSE PRACTITIONER              |
    | data.myTeams.assignedRoles.id   | 76                              |
    | data.myTeams.assignedRoles.name | RECREATION THERAPIST            |
    | data.myTeams.assignedRoles.id   | 50                              |
    | data.myTeams.assignedRoles.name | TRAINEE                         |
    | data.myTeams.assignedRoles.id   | 28                              |
    | data.myTeams.assignedRoles.name | OCCUPATIONAL THERAPIST          |
    | data.myTeams.assignedRoles.id   | 30                              |
    | data.myTeams.assignedRoles.name | TCM TRANSITION PATIENT ADVOCATE |


@F972_Request_Activity_4 @US13511 @US13514
Scenario: Save and Delete Request Activity Draft Assigned to Any Team
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                                               |
    |   "data": {                                                          |
    |     "urgency": "emergent" ,                                          |
    |     "earliest": "system_start_date(1)" ,                             |
    |     "latest": "system_end_date(3)",                                  |
    |     "requestDetails": "This is request details",                     |
    |     "anyTeam": {                                                     |
    |       "assignedFacility": "500",                                     |
    |       "assignedTeam": {                                              |
    |         "id": "809",                                                 |
    |         "name": "MH WPB Delray BHIP B"                               |
    |       },                                                             |
    |       "assignedRoles": [                                             |
    |         { "id": "90", "name": "REHABILITATION THERAPIST"          }, |
    |         { "id": "53", "name": "POLYTRAUMA CASE MANAGER"           }, |
    |         { "id": "30", "name": "TCM TRANSITION PATIENT ADVOCATE"   }  |
    |       ]                                                              |
    |     }                                                                |
    |   }                                                                  |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field                           | value                           |
    | displayName                     | activity                        |
    | data.urgency                    | emergent                        |
    | data.earliest                   | system_start_date(1)            |
    | data.latest                     | system_end_date(3)              |
    | data.requestDetails             | This is request details         |
    | data.anyTeam.assignedTeam.id    | 809                             |
    | data.anyTeam.assignedTeam.name  | MH WPB Delray BHIP B            |
    | data.anyTeam.assignedRoles.id   | 90                              |
    | data.anyTeam.assignedRoles.name | REHABILITATION THERAPIST        |
    | data.anyTeam.assignedRoles.id   | 53                              |
    | data.anyTeam.assignedRoles.name | POLYTRAUMA CASE MANAGER         |
    | data.anyTeam.assignedRoles.id   | 30                              |
    | data.anyTeam.assignedRoles.name | TCM TRANSITION PATIENT ADVOCATE |
  When the "activity" Clinical "request" in "draft" state is deleted for patient "SITE;3"
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field                           | value                           |
    | ehmpState                       | deleted                         |
    | displayName                     | activity                        |
    | data.urgency                    | emergent                        |
    | data.earliest                   | system_start_date(1)            |
    | data.latest                     | system_end_date(3)              |
    | data.requestDetails             | This is request details         |
    | data.anyTeam.assignedTeam.id    | 809                             |
    | data.anyTeam.assignedTeam.name  | MH WPB Delray BHIP B            |
    | data.anyTeam.assignedRoles.id   | 90                              |
    | data.anyTeam.assignedRoles.name | REHABILITATION THERAPIST        |
    | data.anyTeam.assignedRoles.id   | 53                              |
    | data.anyTeam.assignedRoles.name | POLYTRAUMA CASE MANAGER         |
    | data.anyTeam.assignedRoles.id   | 30                              |
    | data.anyTeam.assignedRoles.name | TCM TRANSITION PATIENT ADVOCATE |


# ## ------------------------------------------------------------------------------

@F972_Request_Activity_5 @US13514
Scenario: Try to Save Request Activity Draft - Empty Title
  Given an "" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "routine" ,                           |
    |     "earliest": "system_start_date(1)" ,             |
    |     "latest": "system_end_date(3)",                  |
    |     "requestDetails": "Just a routine request",      |
    |     "me": true                                       |
    |   }                                                  |
  Then a internal server error response is returned

@F972_Request_Activity_6 @US13514
Scenario: Try to Save Request Activity Draft - Missing Title
  Given an "NIL" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "routine" ,                           |
    |     "earliest": "system_start_date(1)" ,             |
    |     "latest": "system_end_date(3)",                  |
    |     "requestDetails": "Just a routine request",      |
    |     "me": true                                       |
    |   }                                                  |
  Then a internal server error response is returned

@F972_Request_Activity_7 @US13514
Scenario: Try to Save Request Activity Draft Assigned to Me - Me not empty
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with:
    | field          | value                       |
    | urgency        | routine                     |
    | earliest       | system_start_date(-1)       |
    | latest         | system_end_date(3)          |
    | requestDetails | Just a routine request      |
    | me.assignedFacility | 536                    |
    | me.assignedPerson   | urn:va:user:2939:1000  |
  Then a internal server error response is returned

@F972_Request_Activity_8 @US13514
Scenario: Try to Save Request Activity Draft Assigned to Me with Title greater than 140 chars
  Given a "CHAR*141" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "routine" ,                           |
    |     "earliest": "system_start_date(1)" ,             |
    |     "latest": "system_end_date(3)",                  |
    |     "requestDetails": "Just a routine request",      |
    |     "me": true                                       |
    |   }                                                  |
  Then a internal server error response is returned

@F972_Request_Activity_9 @US13514
Scenario: Try to Save Request Activity Draft Assigned to Me with Request Detail greater than 200 chars
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "routine" ,                           |
    |     "earliest": "system_start_date(1)" ,             |
    |     "latest": "system_end_date(3)",                  |
    |     "requestDetails": "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o123456789a123456789b123456789c123456789d123456789xZ",      |
    |     "me": true                                       |
    |   }                                                  |
  Then a internal server error response is returned

@F972_Request_Activity_10 @US13514
Scenario: Save Request Activity Draft with No Information
  Given a "X" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
     |   data                                               |
     |   "data": { }                                        |
  Then a internal server error response is returned

@F972_Request_Activity_11 @US13514
Scenario: Save Request Activity Draft with Minimum Information
  Given a "X" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "" ,                                  |
    |     "earliest": "" ,                                 |
    |     "latest": "",                                    |
    |     "requestDetails": "",                            |
    |     "me": true                                       |
    |   }                                                  |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field               | value   |
    | data.urgency        |         |
    | data.earliest       |         |
    | data.latest         |         |
    | data.requestDetails |         |
    | data.me             | IS_SET  |


@F972_Request_Activity_12 @US13514
Scenario: Save Request Activity Draft with Maximum Information
  Given a "CHAR*140" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
     |   data                                               |
     |   "data": {                                          |
     |     "urgency": "routine" ,                           |
     |     "earliest": "system_start_date(1)" ,             |
     |     "latest": "system_end_date(3)",                  |
     |     "requestDetails": "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o123456789a123456789b123456789c123456789d123456789x",     |
     |     "anyTeam": {                                     |
     |       "assignedFacility": "500",                     |
     |       "assignedTeam": {                              |
     |         "id": "809",                                 |
     |         "name": "MH WPB Delray BHIP B"               |
     |       },                                             |
     |       "assignedRoles": [{                            |
     |         "id": "90",                                  |
     |         "name": "REHABILITATION THERAPIST"           |
     |       }, {                                           |
     |         "id": "53",                                  |
     |         "name": "POLYTRAUMA CASE MANAGER"            |
     |       }, {                                           |
     |         "id": "96",                                  |
     |         "name": "RESPIRATORY THERAPIST"              |
     |       }, {                                           |
     |         "id": "19",                                  |
     |         "name": "CLERK"                              |
     |       }, {                                           |
     |         "id": "20",                                  |
     |         "name": "MEDICAL STUDENT"                    |
     |       }, {                                           |
     |         "id": "24",                                  |
     |         "name": "NURSE PRACTITIONER"                 |
     |       }, {                                           |
     |         "id": "76",                                  |
     |         "name": "RECREATION THERAPIST"               |
     |       }, {                                           |
     |         "id": "50",                                  |
     |         "name": "TRAINEE"                            |
     |       }, {                                           |
     |         "id": "28",                                  |
     |         "name": "OCCUPATIONAL THERAPIST"             |
     |       }, {                                           |
     |         "id": "30",                                  |
     |         "name": "TCM TRANSITION PATIENT ADVOCATE"    |
     |       }]                                             |
     |     }                                                |
     |   }                                                  |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field               | value                              |
    | displayName         | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxZ |
    | data.urgency        | routine                            |
    | data.earliest       | system_start_date(1)               |
    | data.latest         | system_end_date(3)                 |
    | data.requestDetails | 123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o123456789a123456789b123456789c123456789d123456789x |
    | data.anyTeam.assignedFacility   | 500                                |
    | data.anyTeam.assignedTeam.id    | 809                                |
    | data.anyTeam.assignedTeam.name  | MH WPB Delray BHIP B               |
    | data.anyTeam.assignedRoles.id   | 90                                 |
    | data.anyTeam.assignedRoles.name | REHABILITATION THERAPIST           |
    | data.anyTeam.assignedRoles.id   | 53                                 |
    | data.anyTeam.assignedRoles.name | POLYTRAUMA CASE MANAGER            |
    | data.anyTeam.assignedRoles.id   | 96                                 |
    | data.anyTeam.assignedRoles.name | RESPIRATORY THERAPIST              |
    | data.anyTeam.assignedRoles.id   | 19                                 |
    | data.anyTeam.assignedRoles.name | CLERK                              |
    | data.anyTeam.assignedRoles.id   | 20                                 |
    | data.anyTeam.assignedRoles.name | MEDICAL STUDENT                    |
    | data.anyTeam.assignedRoles.id   | 24                                 |
    | data.anyTeam.assignedRoles.name | NURSE PRACTITIONER                 |
    | data.anyTeam.assignedRoles.id   | 76                                 |
    | data.anyTeam.assignedRoles.name | RECREATION THERAPIST               |
    | data.anyTeam.assignedRoles.id   | 50                                 |
    | data.anyTeam.assignedRoles.name | TRAINEE                            |
    | data.anyTeam.assignedRoles.id   | 28                                 |
    | data.anyTeam.assignedRoles.name | OCCUPATIONAL THERAPIST             |
    | data.anyTeam.assignedRoles.id   | 30                                 |
    | data.anyTeam.assignedRoles.name | TCM TRANSITION PATIENT ADVOCATE    |

@F972_Request_Activity_13 @US13514
Scenario: Try to Save Request Activity Draft Assigned to My Team with missing data - myTeams: {}
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                                               |
    |   "data": {                                                          |
    |     "urgency": "emergent" ,                                          |
    |     "earliest": "system_start_date(1)" ,                             |
    |     "latest": "system_end_date(3)",                                  |
    |     "requestDetails": "This is request details",                     |
    |     "myTeams": {                                                     |
    |       "assignedTeam": {                                              |
    |         "id": "451",                                                 |
    |         "name": "edmPrimaryCare"                                     |
    |       }                                                              |
    |     }                                                                |
    |   }                                                                  |
  Then a internal server error response is returned

@F972_Request_Activity_14 @US13514
Scenario: Try to Save Request Activity Draft Assigned to Any Team with non-existing team
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "routine" ,                           |
    |     "earliest": "system_start_date(1)" ,             |
    |     "latest": "system_end_date(3)",                  |
    |     "requestDetails": "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o123456789a123456789b123456789c123456789d123456789x",     |
    |     "anyTeam": {                                     |
    |       "assignedFacility": "500",                     |
    |       "assignedTeam": {                              |
    |         "id": "PORTPORTPORT",                        |
    |         "name": "NON-EXISTING TEAM ID"               |
    |       },                                             |
    |       "assignedRoles": [{                            |
    |         "id": "90",                                  |
    |         "name": "REHABILITATION THERAPIST"           |
    |       }]                                             |
    |     }                                                |
    |   }                                                  |
  Then a internal server error response is returned


@F972_Request_Activity_15 @US13514
Scenario: Try to Save Request Activity Draft Assigned to person with extra fields
  Given a "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                                              |
    |   "data": {                                                         |
    |     "urgency": "emergent" ,                                         |
    |     "earliest": "system_start_date(1)" ,                            |
    |     "latest": "system_end_date(3)",                                 |
    |     "requestDetails": "A request PROVIDER,THIRTY at ABILENE (CAA)", |
    |     "person": {                                                     |
    |       "assignedFacility": "998",                                    |
    |       "assignedPerson" : "urn:va:user:SITE:1057",                   |
    |       "assignedTeam" : "NOT A GOOD TEAM NAME"                       |
    |     }                                                               |
    |   }                                                                 |
  Then a internal server error response is returned

@F972_Request_Activity_16 @US13514
Scenario: Try to Save Request Activity Draft Assigned to My Team with team id and name not matching
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
    |   data                                                               |
    |   "data": {                                                          |
    |     "urgency": "emergent" ,                                          |
    |     "earliest": "system_start_date(1)" ,                             |
    |     "latest": "system_end_date(3)",                                  |
    |     "requestDetails": "team id 451 is really 'edmPrimary Care, and Vee*LAS is id 1114'", |
    |     "myTeams": {                                                     |
    |       "assignedTeam": {                                              |
    |         "id": "451",                                                 |
    |         "name": "Vee*LAS*"                                           |
    |       },                                                             |
    |       "assignedRoles": [ ]                                           |
    |     }                                                                |
    |   }                                                                  |
  Then a internal server error response is returned

@F972_Request_Activity_17 @US13514
Scenario: Save Request Activity Draft with Dates that are past due
  Given an "activity" Clinical "request" in "draft" state is added for patient "SITE;3" with:
    | field                   | value                                                |
    | urgency                 | urgent                                               |
    | earliest                | system_start_date(-5)                                |
    | latest                  | system_end_date(-10)                                 |
    | requestDetails          | Provider is RESIDENT,NEW; Facility is New Jersey HCS |
    | person.assignedFacility | 536                                                  |
    | person.assignedPerson   | urn:va:user:2939:1000                                |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field                        | value                                                |
    | data.urgency                 | urgent                                               |
    | data.earliest                | system_start_date(-5)                                |
    | data.latest                  | system_end_date(-10)                                 |
    | data.requestDetails          | Provider is RESIDENT,NEW; Facility is New Jersey HCS |
    | data.person.assignedFacility | 536                                                  |
    | data.person.assignedPerson   | urn:va:user:2939:1000                                |

@F972_Request_Activity_18 @US13514
Scenario: Change Request Activity Draft assigned to Any Team to Me to Any Person
  Given a "CHAR*140" Clinical "request" in "draft" state is added for patient "SITE;3" with data:
     |   data                                               |
     |   "data": {                                          |
     |     "urgency": "routine" ,                           |
     |     "earliest": "system_start_date(1)" ,             |
     |     "latest": "system_end_date(3)",                  |
     |     "requestDetails": "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o123456789a123456789b123456789c123456789d123456789x",     |
     |     "anyTeam": {                                     |
     |       "assignedFacility": "500",                     |
     |       "assignedTeam": {                              |
     |         "id": "809",                                 |
     |         "name": "MH WPB Delray BHIP B"               |
     |       },                                             |
     |       "assignedRoles": [{                            |
     |         "id": "90",                                  |
     |         "name": "REHABILITATION THERAPIST"           |
     |       }, {                                           |
     |         "id": "53",                                  |
     |         "name": "POLYTRAUMA CASE MANAGER"            |
     |       }, {                                           |
     |         "id": "96",                                  |
     |         "name": "RESPIRATORY THERAPIST"              |
     |       }, {                                           |
     |         "id": "19",                                  |
     |         "name": "CLERK"                              |
     |       }, {                                           |
     |         "id": "20",                                  |
     |         "name": "MEDICAL STUDENT"                    |
     |       }, {                                           |
     |         "id": "24",                                  |
     |         "name": "NURSE PRACTITIONER"                 |
     |       }, {                                           |
     |         "id": "76",                                  |
     |         "name": "RECREATION THERAPIST"               |
     |       }, {                                           |
     |         "id": "50",                                  |
     |         "name": "TRAINEE"                            |
     |       }, {                                           |
     |         "id": "28",                                  |
     |         "name": "OCCUPATIONAL THERAPIST"             |
     |       }, {                                           |
     |         "id": "30",                                  |
     |         "name": "TCM TRANSITION PATIENT ADVOCATE"    |
     |       }]                                             |
     |     }                                                |
     |   }                                                  |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field               | value                              |
    | displayName         | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxZ |
    | data.urgency        | routine                            |
    | data.earliest       | system_start_date(1)               |
    | data.latest         | system_end_date(3)                 |
    | data.requestDetails | 123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k123456789l123456789m123456789n123456789o123456789a123456789b123456789c123456789d123456789x |
    | data.anyTeam.assignedFacility   | 500                                |
    | data.anyTeam.assignedTeam.id    | 809                                |
    | data.anyTeam.assignedTeam.name  | MH WPB Delray BHIP B               |
    | data.anyTeam.assignedRoles.id   | 90                                 |
    | data.anyTeam.assignedRoles.name | REHABILITATION THERAPIST           |
    | data.anyTeam.assignedRoles.id   | 53                                 |
    | data.anyTeam.assignedRoles.name | POLYTRAUMA CASE MANAGER            |
    | data.anyTeam.assignedRoles.id   | 96                                 |
    | data.anyTeam.assignedRoles.name | RESPIRATORY THERAPIST              |
    | data.anyTeam.assignedRoles.id   | 19                                 |
    | data.anyTeam.assignedRoles.name | CLERK                              |
    | data.anyTeam.assignedRoles.id   | 20                                 |
    | data.anyTeam.assignedRoles.name | MEDICAL STUDENT                    |
    | data.anyTeam.assignedRoles.id   | 24                                 |
    | data.anyTeam.assignedRoles.name | NURSE PRACTITIONER                 |
    | data.anyTeam.assignedRoles.id   | 76                                 |
    | data.anyTeam.assignedRoles.name | RECREATION THERAPIST               |
    | data.anyTeam.assignedRoles.id   | 50                                 |
    | data.anyTeam.assignedRoles.name | TRAINEE                            |
    | data.anyTeam.assignedRoles.id   | 28                                 |
    | data.anyTeam.assignedRoles.name | OCCUPATIONAL THERAPIST             |
    | data.anyTeam.assignedRoles.id   | 30                                 |
    | data.anyTeam.assignedRoles.name | TCM TRANSITION PATIENT ADVOCATE    |
  When an "activity" Clinical "request" in "draft" state is updated for patient "SITE;3" with data:
    |   data                                               |
    |   "data": {                                          |
    |     "urgency": "routine" ,                           |
    |     "earliest": "system_start_date(1)" ,             |
    |     "latest": "system_end_date(3)",                  |
    |     "requestDetails": "Just a routine request",      |
    |     "me": true                                       |
    |   }                                                  |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field               | value                              |
    | data.urgency        | routine                            |
    | data.earliest       | system_start_date(1)               |
    | data.latest         | system_end_date(3)                 |
    | data.requestDetails | Just a routine request             |
    | data.me             | IS_SET                             |
  When an "activity" Clinical "request" in "draft" state is updated for patient "SITE;3" with data:
    |   data                                                              |
    |   "data": {                                                         |
    |     "urgency": "emergent" ,                                         |
    |     "earliest": "system_start_date(1)" ,                            |
    |     "latest": "system_start_date(3)",                               |
    |     "requestDetails": "A request PROVIDER,THIRTY at ABILENE (CAA)", |
    |     "person": {                                                     |
    |       "assignedFacility": "998",                                    |
    |       "assignedPerson" : "urn:va:user:SITE:1057"                    |
    |     }                                                               |
    |   }                                                                 |
  Then a successful response is returned
  When the client retrieves the activity for patient "SITE;3"
  Then a successful response is returned
  And the activity request contains
    | field                           | value                                      |
    | displayName                     | activity                                   |
    | data.urgency                    | emergent                                   |
    | data.earliest                   | system_start_date(1)                       |
    | data.latest                     | system_start_date(3)                       |
    | data.requestDetails             | A request PROVIDER,THIRTY at ABILENE (CAA) |
    | data.person.assignedFacility    | 998                                        |
    | data.person.assignedPerson      | urn:va:user:SITE:1057                      |
