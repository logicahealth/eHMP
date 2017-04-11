@F866 @JBPM @future
Feature: F866 - Staff Activity Applet

@createdByMe @intendedForMeAndMyTeams
Scenario:  Staff View, verify createdByMe and intendedForMeAndMyTeams activity requests
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "9E7A;1tdnurse" has started an activity assigned to a person with parameters
      | parameter        | value            |
      | patient_facility | 9E7A             |
      | patient_id       | 100728           |
      | assignedToFac    | 9E7A             |
      | assignedToUser   | 10000000270      |
      | full_assignedTo  | 9E7A;10000000270 |
      | authorFac        | 9E7A             |
      | authorId         | 10000000016      |
      | authorName       | TDNURSE,ONE      |
      | urgency          | 4                |

  When the user "9E7A;PW    " requests open activities for the staff context
      | extra parameter         | value |
      | intendedForMeAndMyTeams | true  |

  Then the activities instances list contains
      | parameter            | value                    |
      | NAME                 | Request                  |
      | PID                  | 9E7A;100728              |
      | CREATEDBYID          | 9E7A;10000000016         |
      | URGENCY              | 4                        |
      | TASKSTATE            | Active: Pending Response |
      | ASSIGNEDTOFACILITYID | 500                      |
      | CREATEDATID          | 500                      |
      | ASSIGNEDTOID         | 9E7A;10000000270         |
      | MODE                 | Open                     |
      | DOMAIN               | Request                  |
      | CREATEDBYNAME        | TDNURSE,ONE              |
      | INTENDEDFOR          | USER,PANORAMA            |
      | PATIENTNAME          | TWENTY,INPATIENT         |

  When the user "9E7A;1tdnurse" requests open activities for the staff context
      | extra parameter         | value |
      | createdByMe             | true  |

  Then the activities instances list contains
      | parameter            | value                    |
      | NAME                 | Request                  |
      | PID                  | 9E7A;100728              |
      | CREATEDBYID          | 9E7A;10000000016         |
      | URGENCY              | 4                        |
      | TASKSTATE            | Active: Pending Response |
      | ASSIGNEDTOFACILITYID | 500                      |
      | CREATEDATID          | 500                      |
      | ASSIGNEDTOID         | 9E7A;10000000270         |
      | MODE                 | Open                     |
      | DOMAIN               | Request                  |
      | CREATEDBYNAME        | TDNURSE,ONE              |
      | INTENDEDFOR          | USER,PANORAMA            |
      | PATIENTNAME          | TWENTY,INPATIENT         |

@createdByMe_unsignedconsult @intendedForMeAndMyTeams_unsignedconsult
Scenario:  Staff View, verify createdByMe and intendedForMeAndMyTeams UNSIGNED consult - Physical Therapy
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "9E7A;PW    " has started a consult with parameters
      | parameters                   | value                                      |
      | icn                          | 9E7A;100728                                |
      | assignedTo                   | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:9E7A:10000000272               |
      | executionUserName            | KHAN, VIHAAN                               |
      | formAction                   | accepted                                   |
      | orderingProvider displayName | KHAN, VIHAAN                               |
      | orderingProvider uid         | urn:va:user:9E7A:10000000272               |
      | destination facility code    | 500                                        |
      | destination facility name    | PANORAMA                                   |
  And a successful response is returned
  And the successful response contains a processInstanceId 

  When the user "9E7A;PW    " requests open activities for the staff context
      | extra parameter         | value |
      | intendedForMeAndMyTeams | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | 9E7A;100728                                |
      | CREATEDBYID          | 9E7A;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Unreleased:Pending Signature               |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | KHAN,VIHAAN                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |

  When the user "9E7A;PW    " requests open activities for the staff context
      | extra parameter         | value |
      | createdByMe             | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | 9E7A;100728                                |
      | CREATEDBYID          | 9E7A;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Unreleased:Pending Signature               |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | KHAN,VIHAAN                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |

@createdByMe_signedconsult @intendedForMeAndMyTeams_signedconsult
Scenario:  Staff View, verify createdByMe and intendedForMeAndMyTeams SIGNED consult - Physical Therapy
  Given a patient with pid "9E7A;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user 9E7A;PW     has created and signed a consult for patient "9E7A;100728"

  When the user "9E7A;PW    " requests open activities for the staff context
      | extra parameter         | value |
      | intendedForMeAndMyTeams | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | 9E7A;100728                                |
      | CREATEDBYID          | 9E7A;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Pending                                    |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | KHAN,VIHAAN                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |

  When the user "9E7A;PW    " requests open activities for the staff context
      | extra parameter         | value |
      | createdByMe             | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | 9E7A;100728                                |
      | CREATEDBYID          | 9E7A;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Pending                                    |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | KHAN,VIHAAN                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |