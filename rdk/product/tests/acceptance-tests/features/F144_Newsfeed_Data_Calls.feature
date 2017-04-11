@data_verification_timeline @F144
Feature: F144 - eHMP viewer GUI - Timeline

@F144_newsfeed_applet @US1946
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  Given a patient with pid "9E7A;100599" has been synced through the RDK API
  When the client requests the timeline for the patient "9E7A;100599" with parameters
   | label  | value |
   | filter | or(between(dateTime,"19350407","20150810235959"),or(between(administeredDateTime,"19350407","20150810235959"),between(observed,"19350407","20150810235959"))) |
  Then a successful response is returned
  And the client recieves 4 data points of type "visit"
  
# This test replaces the DoD appointment test in ehmp-ui
@F144_Newsfeed @F144_timelineA @US2845
Scenario: Verify Timeline will display DoD appointments
Given a patient with pid "9E7A;227" has been synced through the RDK API
When the client requests the TIMELINE for the patient "9E7A;227" with starting at "19350407"
Then a successful response is returned
And the VPR results contain
      | field           | value           |
      | facilityCode    | DOD             |
      | typeName        | ROUT            |
      | typeDisplayName | ROUT            |
      | dateTime        | 20121018080000  |
      | kind            | DoD Appointment |
And the VPR results contain
      | field           | value           |
      | facilityCode    | DOD             |
      | typeName        | SPEC            |
      | typeDisplayName | SPEC            |
      | dateTime        | 20121017143000  |
      | kind            | DoD Appointment |

# This test replaces the Newsfeed Display test in ehmp-ui
@F144_Newsfeed @US1946
Scenario: Verify Timeline will display all Consult and Admission and Laboratory for a given patient
Given a patient with pid "9E7A;100599" has been synced through the RDK API
When the client requests the TIMELINE for the patient "9E7A;100599" with starting at "19350407"
Then a successful response is returned
And the VPR results contain
      | field           | value                     |
      | facilityName    | FT. LOGAN                 |
      | typeName        | 20 MINUTE VISIT           |
      | typeDisplayName | 20 Minute Visit           |
      | dateTime        | 20061102152843            |
      | kind            | Visit                     |
      | stopCodeName    | GENERAL INTERNAL MEDICINE |
And the VPR results contain
      | field           | value                     |
      | facilityName    | ABILENE (CAA)             |
      | locationName    | CARDIOLOGY                |
      | name            | PULMONARY FUNCTION INTERPRET|
      | dateTime        | 20050204105121            |
      | kind            | Procedure                 |
And the VPR results contain
      | field           | value                     |
      | facilityName    | FT. LOGAN                 |
      | typeName        | CARDIOLOGY VISIT          |
      | typeDisplayName | Cardiology Visit          |
      | dateTime        | 20050204105121            |
      | kind            | Visit                     |

# This test replaces the Newsfeed Display test in ehmp-ui
@F144_Newsfeed @US2457 @US2845
Scenario: Verify Timeline will display all Consult and Admission and Laboratory for a given patient
Given a patient with pid "9E7A;164" has been synced through the RDK API
When the client requests the TIMELINE for the patient "9E7A;164" with starting at "19350407"
Then a successful response is returned
And the VPR results contain
      | field           | value                    |
      | facilityName    | CAMP MASTER              |
      | typeName        | CARDIOLOGY Cons          |
      | dateTime        | 19950929                 |
      | kind            | Consult                  |
And the VPR results contain
      | field           | value                    |
      | facilityName    | TROY                     |
      | typeName        | HOSPITALIZATION          |
      | typeDisplayName | Hospitalization          |
      | dateTime        | 19950125155741           |
      | kind            | Admission                |
And the VPR results contain
      | field                 | value                    |
      | facilityName          | CAMP MASTER              |
      | typeName              | HOSPITALIZATION          |
      | typeDisplayName       | Hospitalization          |
      | dateTime              | 199305201000             |
      | kind                  | Admission                |
      | movements.movementType| DISCHARGE                |
      | stay.dischargeDateTime| 199305201300             |
And the VPR results contain
      | field           | value                    |
      | facilityName    | CAMP MASTER              |
      | typeName        | CHOLESTEROL              |
      | displayName     | CHOL                     |
      | specimen        | SERUM                    |
      | lastUpdateTime  | 19960104112900           |
      | kind            | Laboratory               |

@F144_Newsfeed_Custom_Date_Range @US2594
Scenario: Verify Newsfeed will display all data between specific date range for a given patient
Given a patient with pid "9E7A;164" has been synced through the RDK API
When the client requests the TIMELINE for the patient "9E7A;164" with GDF set to custom date range between "19951201" and "19951230235959"
Then a successful response is returned
And the VPR results contain
      | field           | value                     |
      | facilityName    | CAMP MASTER               |
      | typeName        | EVENT (HISTORICAL)        |
      | typeDisplayName | Event (Historical)        |
      | dateTime        | 199512261155              |
      | kind            | Visit                     |
And the VPR results contain
      | field           | value                     |
      | facilityName    | CAMP MASTER               |
      | typeName        | EVENT (HISTORICAL)        |
      | typeDisplayName | Event (Historical)        |
      | dateTime        | 199512261129              |
      | kind            | Visit                     |


