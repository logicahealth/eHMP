@F866 @JBPM @future
Feature: F866 - Staff Activity Applet

@createdByMe @intendedForMeAndMyTeams
Scenario:  Staff View, verify createdByMe and intendedForMeAndMyTeams activity requests
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER    " has started an activity assigned to a person with parameters
      | parameter        | value            |
      | patient_facility | SITE             |
      | patient_id       | 100728           |
      | assignedToFac    | SITE             |
      | assignedToUser   | 10000000270      |
      | full_assignedTo  | SITE;10000000270 |
      | authorFac        | SITE             |
      | authorId         | 10000000016      |
      | authorName       | TDNURSE,ONE      |
      | urgency          | 4                |

  When the user "PW         " requests open activities for the staff context
      | extra parameter         | value |
      | intendedForMeAndMyTeams | true  |

  Then the activities instances list contains
      | parameter            | value                    |
      | NAME                 | Request                  |
      | PID                  | SITE;100728              |
      | CREATEDBYID          | SITE;10000000016         |
      | URGENCY              | 4                        |
      | TASKSTATE            | Active: Pending Response |
      | ASSIGNEDTOFACILITYID | 500                      |
      | CREATEDATID          | 500                      |
      | ASSIGNEDTOID         | SITE;10000000270         |
      | MODE                 | Open                     |
      | DOMAIN               | Request                  |
      | CREATEDBYNAME        | TDNURSE,ONE              |
      | INTENDEDFOR          | USER,PANORAMA            |
      | PATIENTNAME          | TWENTY,INPATIENT         |

  When the user "SITE;USER    " requests open activities for the staff context
      | extra parameter         | value |
      | createdByMe             | true  |

  Then the activities instances list contains
      | parameter            | value                    |
      | NAME                 | Request                  |
      | PID                  | SITE;100728              |
      | CREATEDBYID          | SITE;10000000016         |
      | URGENCY              | 4                        |
      | TASKSTATE            | Active: Pending Response |
      | ASSIGNEDTOFACILITYID | 500                      |
      | CREATEDATID          | 500                      |
      | ASSIGNEDTOID         | SITE;10000000270         |
      | MODE                 | Open                     |
      | DOMAIN               | Request                  |
      | CREATEDBYNAME        | TDNURSE,ONE              |
      | INTENDEDFOR          | USER,PANORAMA            |
      | PATIENTNAME          | TWENTY,INPATIENT         |

@createdByMe_unsignedconsult @intendedForMeAndMyTeams_unsignedconsult
Scenario:  Staff View, verify createdByMe and intendedForMeAndMyTeams UNSIGNED consult - Physical Therapy
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER  " has started a consult with parameters
      | parameters                   | value                                      |
      | icn                          | SITE;100728                                |
      | assignedTo                   | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:SITE:10000000272               |
      | executionUserName            | LAST,FIRST                               |
      | formAction                   | accepted                                   |
      | orderingProvider displayName | LAST,FIRST                               |
      | orderingProvider uid         | urn:va:user:SITE:10000000272               |
      | destination facility code    | 500                                        |
      | destination facility name    | PANORAMA                                   |
  And a successful response is returned
  And the successful response contains a processInstanceId 

  When the user "PW         " requests open activities for the staff context
      | extra parameter         | value |
      | intendedForMeAndMyTeams | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | SITE;100728                                |
      | CREATEDBYID          | SITE;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Unreleased:Pending Signature               |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | LAST,FIRST                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |

  When the user "SITE;USER  " requests open activities for the staff context
      | extra parameter         | value |
      | createdByMe             | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | SITE;100728                                |
      | CREATEDBYID          | SITE;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Unreleased:Pending Signature               |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | LAST,FIRST                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |

@createdByMe_signedconsult @intendedForMeAndMyTeams_signedconsult
Scenario:  Staff View, verify createdByMe and intendedForMeAndMyTeams SIGNED consult - Physical Therapy
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user SITE;USER   has created and signed a consult for patient "SITE;100728"

  When the user "PW         " requests open activities for the staff context
      | extra parameter         | value |
      | intendedForMeAndMyTeams | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | SITE;100728                                |
      | CREATEDBYID          | SITE;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Pending                                    |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | LAST,FIRST                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |

  When the user "SITE;USER  " requests open activities for the staff context
      | extra parameter         | value |
      | createdByMe             | true  |

  Then the activities instances list contains
      | parameter            | value                                      |
      | NAME                 | Consult                                    |
      | PID                  | SITE;100728                                |
      | CREATEDBYID          | SITE;10000000272                           |
      | URGENCY              | 9                                          |
      | TASKSTATE            | Pending                                    |
      | ASSIGNEDTOID         | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | CREATEDATID          | 500                                        |
      | ASSIGNEDTOFACILITYID | 500                                        |
      | MODE                 | Open                                       |
      | DOMAIN               | consult                                    |
      | CREATEDBYNAME        | LAST,FIRST                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |