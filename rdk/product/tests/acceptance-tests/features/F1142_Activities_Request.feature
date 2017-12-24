@F1142_activities_requests @F1142_activities_requests_patient @F1142_activities_requests_staff @JBPM @f1142 @future
Feature: Activities

@F1142_activities_requests_patient @F1142_activities_requests_patient_1 @f1142
Scenario: Patient view, request applet requests "Related to me" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned


@F1142_activities_requests_patient @F1142_activities_requests_patient_2 @f1142
Scenario: Patient view, request applet requests "Intended for me or my team(s)" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_3 @f1142
Scenario: Patient view, request applet requests "Created by me" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_4 @f1142
Scenario: Patient view, request applet requests "All Requests" and display only "open"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_5 @f1142
Scenario: Patient view, request applet requests "All Requests" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_6 @f1142
Scenario: Patient view, request applet requests "Created by me" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_7  @f1142 
Scenario: Patient view, request applet requests "Intended for me or my team(s)" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_8  @f1142
Scenario: Patient view, request applet requests "Activities related to me" and display only "closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_9  @f1142
Scenario: Patient view, request applet requests "All Requests" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_10  @f1142
Scenario: Patient view, request applet requests "Created by me" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_11  @f1142
Scenario: Patient view, request applet requests "Intended for me or my team(s)" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_12  @f1142
Scenario: Patient view, request applet requests "Related to me" and display only "open and closed"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
  Then a successful response is returned






@F1142_activities_requests_patient @F1142_activities_requests_patient_13 @f1142
Scenario: Patient view, request applet requests "Related to me" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned


@F1142_activities_requests_patient @F1142_activities_requests_patient_14 @f1142
Scenario: Patient view, request applet requests "Intended for me or my team(s)" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_15 @f1142
Scenario: Patient view, request applet requests "Created by me" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_16 @f1142
Scenario: Patient view, request applet requests "All Requests" and display only "open" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_17 @f1142
Scenario: Patient view, request applet requests "All Requests" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_18 @f1142
Scenario: Patient view, request applet requests "Created by me" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_19  @f1142 
Scenario: Patient view, request applet requests "Intended for me or my team(s)" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_20  @f1142
Scenario: Patient view, request applet requests "Activities related to me" and display only "closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_21  @f1142
Scenario: Patient view, request applet requests "All Requests" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_21  @f1142
Scenario: Patient view, request applet requests "Created by me" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_22  @f1142
Scenario: Patient view, request applet requests "Intended for me or my team(s)" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_patient @F1142_activities_requests_patient_23  @f1142
Scenario: Patient view, request applet requests "Related to me" and display only "open and closed" and flagged  "true"
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|SITE;3|
    | domain|Request|
    | showOnlyFlagged|true|
  Then a successful response is returned

@F1142_activities_requests_staff @F1142_activities_requests_staff_24  @f1142
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
      | domain|Request|
  Then a successful response is returned
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
      | domain|Request|
  Then a successful response is returned
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
