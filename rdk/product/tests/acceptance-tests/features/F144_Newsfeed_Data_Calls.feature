@data_verification_timeline @F144
Feature: F144 - eHMP viewer GUI - Timeline

@F144_newsfeed_applet @US1946
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  Given a patient with pid "9E7A;100022" has been synced through the RDK API
  When the client requests the timeline for the patient "9E7A;100022" with parameters
   | label  | value |
   | filter | or(between(dateTime,"19350407","20150810235959"),or(between(administeredDateTime,"19350407","20150810235959"),between(observed,"19350407","20150810235959"))) |
  Then a successful response is returned
  And the client recieves 11 data points of type "visit"
  
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
Given a patient with pid "9E7A;100022" has been synced through the RDK API
When the client requests the TIMELINE for the patient "9E7A;100022" with starting at "19350407"
Then a successful response is returned
And the VPR results contain
      | field           | value                     |
      | facilityName    | CAMP MASTER               |
      | typeName        | DAILY HOSPITALIZATION DATA|
      | typeDisplayName | Daily Hospitalization Data|
      | dateTime        | 20140127180800            |
      | kind            | Visit                     |
      | stopCodeUid	| urn:va:stop-code:176	    |
And the VPR results contain
      | field           | value                     |
      | facilityName    | New Jersey HCS            |
      | facilityCode	| 561						|
      | name            | LAPARASCOPY				|
      | dateTime        | 199811190800           	|
      | kind            | Procedure                 |
And the VPR results contain
      | field           | value                     |
      | facilityName    | New Jersey HCS            |
      | typeName        | COMPENSATION & PENSION    |
      | typeDisplayName | Compensation & Pension    |
      | dateTime        | 199406161415           	|
      | kind            | Visit                     |

# This test replaces the Newsfeed Display test in ehmp-ui
@F144_Newsfeed @US2457 @US2845
Scenario: Verify Timeline will display all Consult and Admission and Laboratory for a given patient
Given a patient with pid "9E7A;100022" has been synced through the RDK API
When the client requests the TIMELINE for the patient "9E7A;100022" with starting at "20020101"
Then a successful response is returned
And the VPR results contain
      | field           | value                    		|
      | facilityName    | CAMP MASTER              		|
      | typeName        | SOCIAL WORK ADMISSION Cons    |
      | dateTime        | 20150220150604           		|
      | kind            | Consult                  		|
And the VPR results contain
      | field           | value                    |
      | facilityName    | CAMP BEE                 |
      | typeName        | HOSPITALIZATION          |
      | typeDisplayName | Hospitalization          |
      | dateTime        | 20140115123828           |
      | kind            | Admission                |
And the VPR results contain
      | field                 | value                    |
      | facilityName          | CAMP MASTER              |
      | typeName              | HOSPITALIZATION          |
      | typeDisplayName       | Hospitalization          |
      | dateTime              | 20020130114524           |
      | kind                  | Admission                |
      | movements.movementType| DISCHARGE                |
      | stay.dischargeDateTime| 20140115095259           |
And the VPR results contain
      | field           | value                    |
      | facilityName    | CAMP MASTER              |
      | typeName        | HGB              		   |
      | displayName     | HGB                      |
      | specimen        | BLOOD                    |
      | lastUpdateTime  | 20150603145400           |
      | kind            | Laboratory               |

@F144_Newsfeed_Custom_Date_Range @US2594
Scenario: Verify Newsfeed will display all data between specific date range for a given patient
Given a patient with pid "9E7A;100022" has been synced through the RDK API
When the client requests the TIMELINE for the patient "9E7A;100022" with GDF set to custom date range between "20150101" and "20151230235959"
Then a successful response is returned
And the VPR results contain
      | field           | value                     	|
      | facilityName    | CAMP MASTER               	|
      | typeName        | SOCIAL WORK ADMISSION Cons    |
      | orderName		| SOCIAL WORK ADMISSION			|
      | dateTime        | 20150220150604              	|
      | kind            | Consult	                    |
And the VPR results contain
      | field           | value                     |
      | facilityName    | CAMP MASTER               |
      | typeName        | HGB        				|	
      | activityDateTime| 20150603145400              |
      | specimen		| BLOOD						|
      | kind            | Laboratory                |


