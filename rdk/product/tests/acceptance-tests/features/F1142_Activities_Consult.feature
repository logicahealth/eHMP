@F1142_activities_consults @F1142_activities_consults_patient @F1142_activities_consults_staff @JBPM @f1142 @future
Feature: Activities

@F1142_activities_consults_patient @F1142_activities_consults_patient_1 @f1142
Scenario: Patient view, consult applet requests "Related to me" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned


@F1142_activities_consults_patient @F1142_activities_consults_patient_2 @f1142
Scenario: Patient view, consult applet requests "Intended for me or my team(s)" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_3 @f1142
Scenario: Patient view, consult applet requests "Created by me" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_4 @f1142
Scenario: Patient view, consult applet requests "All Consults" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_5 @f1142
Scenario: Patient view, consult applet requests "All Consults" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_6 @f1142
Scenario: Patient view, consult applet requests "Created by me" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_7  @f1142 
Scenario: Patient view, consult applet requests "Intended for me or my team(s)" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_8  @f1142
Scenario: Patient view, consult applet requests "Activities related to me" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_9  @f1142
Scenario: Patient view, consult applet requests "All Consults" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_10  @f1142
Scenario: Patient view, consult applet requests "Created by me" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_11  @f1142
Scenario: Patient view, consult applet requests "Intended for me or my team(s)" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_12  @f1142
Scenario: Patient view, consult applet requests "Related to me" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
  Then a successful response is returned






@F1142_activities_consults_patient @F1142_activities_consults_patient_13 @f1142
Scenario: Patient view, consult applet requests "Related to me" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned


@F1142_activities_consults_patient @F1142_activities_consults_patient_14 @f1142
Scenario: Patient view, consult applet requests "Intended for me or my team(s)" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_15 @f1142
Scenario: Patient view, consult applet requests "Created by me" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_16 @f1142
Scenario: Patient view, consult applet requests "All Consults" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_17 @f1142
Scenario: Patient view, consult applet requests "All Consults" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_18 @f1142
Scenario: Patient view, consult applet requests "Created by me" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_19  @f1142 
Scenario: Patient view, consult applet requests "Intended for me or my team(s)" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_20  @f1142
Scenario: Patient view, consult applet requests "Activities related to me" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_21  @f1142
Scenario: Patient view, consult applet requests "All Consults" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_21  @f1142
Scenario: Patient view, consult applet requests "Created by me" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_22  @f1142
Scenario: Patient view, consult applet requests "Intended for me or my team(s)" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_patient @F1142_activities_consults_patient_23  @f1142
Scenario: Patient view, consult applet requests "Related to me" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Consult|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_consults_staff @F1142_activities_consults_staff_24  @f1142
Scenario:  Staff View, verify createdByMe and intendedForMeAndMyTeams UNSIGNED consult - Physical Therapy
  Given a patient with pid "SITE;100728" has been synced through the RDK API
  And the client has the current deploymentid
  And the user "SITE;USER  " has started a consult with parameters
      | parameters                   | value                                      |
      | icn                          | SITE;100728                                |
      | assignedTo                   | [FC:PANORAMA(500)/TF:Physical Therapy(81)] |
      | executionUserId              | urn:va:user:SITE:10000000272               |
      | executionUserName            | KHAN, VIHAAN                               |
      | formAction                   | accepted                                   |
      | orderingProvider displayName | KHAN, VIHAAN                               |
      | orderingProvider uid         | urn:va:user:SITE:10000000272               |
      | destination facility code    | 500                                        |
      | destination facility name    | PANORAMA                                   |
  And a successful response is returned
  And the successful response contains a processInstanceId 

  When the user "PW         " requests open activities for the staff context
      | extra parameter         | value |
      | intendedForMeAndMyTeams | true  |
      | domain|Consult|
  Then a successful response is returned
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
      | CREATEDBYNAME        | KHAN,VIHAAN                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |

  When the user "SITE;USER  " requests open activities for the staff context
      | extra parameter         | value |
      | createdByMe             | true  |
      | domain|Consult|
  Then a successful response is returned
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
      | CREATEDBYNAME        | KHAN,VIHAAN                                |
      | INTENDEDFOR          | Physical Therapy                           |
      | PATIENTNAME          | TWENTY,INPATIENT                           |
