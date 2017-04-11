@F_activities @F_activities_patient @JBPM @future
Feature: Activities

@F_activities_patient @F_activities_patient_1
Scenario: Patient view, activity applet requests "Activities related to me" and display only "open"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned


@F_activities_patient @F_activities_patient_2
Scenario: Patient view, activity applet requests "Intended for me or my team(s)" and display only "open"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_3
Scenario: Patient view, activity applet requests "Created by me" and display only "open"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_4
Scenario: Patient view, activity applet requests "All Activities" and display only "open"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open activities for the patient context
    | parameter | value |
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_5 @DE6524
Scenario: Patient view, activity applet requests "All Activities" and display only "closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_6 @DE6524
Scenario: Patient view, activity applet requests "Created by me" and display only "closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_7  @DE6524 
Scenario: Patient view, activity applet requests "Intended for me or my team(s)" and display only "closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_8  @DE6524
Scenario: Patient view, activity applet requests "Activities related to me" and display only "closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_9  @DE6524
Scenario: Patient view, activity applet requests "All Activities" and display only "open and closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_10  @DE6524
Scenario: Patient view, activity applet requests "Created by me" and display only "open and closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_11  @DE6524
Scenario: Patient view, activity applet requests "Intended for me or my team(s)" and display only "open and closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned

@F_activities_patient @F_activities_patient_12  @DE6524
Scenario: Patient view, activity applet requests "Activities related to me" and display only "open and closed"
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the clicent requests open and closed activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned

@add_activity_myteam
Scenario: Client can add an activity for my teams
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity for my teams with parameters
   | parameter        | value |
   | patient_facility | 9E7A  |
   | patient_id       | 3     |
   | urgency          | 9     |
   | facility         | 500   |
   | authorFac        | 9E7A  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
   | assignedToFac    | 9E7A  |
   | full_assignedTo  | [TM:Physical Therapy - 3rd floor - KDK(1130)/TR:NURSE PRACTITIONER(24)] |
   | team code        | 1130 |
   | team name        | Physical Therapy - 3rd floor - KDK |
   | assigned roles code | 24 |
   | assigned roles name | NURSE PRACTITIONER |
  And a successful response is returned
  When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does contain the title
  When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does not contain the title
  When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does not contain the title

@add_activity_anyteam
Scenario: Client can add an activity for any teams
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity for any team with parameters
   | parameter        | value |
   | patient_facility | 9E7A  |
   | patient_id       | 3     |
   | urgency          | 9     |
   | facility         | 500   |
   | authorFac        | 9E7A  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
   | assignedToFac    | 9E7A  |
   | full_assignedTo  | [TM:Other Primary Care - PAN(1132)/TR:RESIDENT (PHYSICIAN)(48)] |
   | team code        | 1132 |
   | team name        | Other Primary Care - PAN |
   | assigned roles code | 48 |
   | assigned roles name | RESIDENT (PHYSICIAN) |
  And a successful response is returned
  When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does contain the title

@add_activity_me
Scenario:  Client can add an activity assigned to me
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity assigned to me with parameters
   | parameter        | value |
   | patient_facility | 9E7A  |
   | patient_id       | 3     |
   | assignedToFac    | 9E7A  |
   | assignedToUser   | 10000000270 |
   | full_assignedTo  | 9E7A;10000000270 |
   | authorFac        | 9E7A  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
  And a successful response is returned

@add_activity_person
Scenario:  When the client requests activities "Created by me", then client only receives activities they have created
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity assigned to a person with parameters
   | parameter        | value |
   | patient_facility | 9E7A  |
   | patient_id       | 3     |
#   | urgency          | 9     |
#   | facility         | 500   |
#   | facility name    | PANORAMA (PAN) COLVILLE, WA |
   | assignedToFac    | 9E7A  |
   | assignedToUser   | 10000000270 |
   | full_assignedTo  | 9E7A;10000000270 |
   | authorFac        | 9E7A  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
  And a successful response is returned
  When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does not contain the title
  And the activity response only contains activities started by pu1234
  When the user "9E7A;1tdnurse" requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does contain the title
  And the activity response only contains activities started by tdnurse

@add_activity_patientteam
Scenario: Client can add an activity for Patients teams
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  And the client has the current deploymentid
  And the user tdnurse has started an activity for Patient's Teams with parameters
   | parameter        | value |
   | patient_facility | 9E7A  |
   | patient_id       | 3     |
   | urgency          | 9     |
   | facility         | 500   |
   | authorFac        | 9E7A  |
   | authorId         | 10000000016 |
   | authorName       | TDNURSE,ONE  |
   | assignedToFac    | 9E7A  |
   | full_assignedTo  | [TM:KODAK Primary Care - KDK(1134)/TR:RESIDENT (PHYSICIAN)(48)] |
   | team code        | 1134 |
   | team name        | KODAK Primary Care - KDK |
   | assigned roles code | 48 |
   | assigned roles name | RESIDENT (PHYSICIAN) |
  And a successful response is returned
 When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does contain the title
  When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | createdByMe|true|
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does not contain the title
  When the user "9E7A;pu1234" requests open activities for the patient context
    | parameter | value |
    | intendedForMeAndMyTeams|true|
    | pid|9E7A;3|
  Then a successful response is returned
  Then the activity response does not contain the title