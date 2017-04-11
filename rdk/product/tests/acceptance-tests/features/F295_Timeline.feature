@timeline @US2845 @vxsync @patient

Feature: F295 - Encounters Applet 

@f295_1_timeline @VPR @US2845 @9E7A;100022

Scenario: Timeline: Add additional data types Appointment and Lab results
Given a patient with pid "9E7A;100022" has been synced through the RDK API
When the client requests timeline for the patient "9E7A;100022" in RDK format
Then a successful response is returned
And the client receives 101 result(s)
Then the VPR results contain

      | field                               | value                         |
      | uid                                 | urn:va:visit:9E7A:100022:H3419|
      | current                             | false                         |
      | facilityCode                        | 500                           |
      | facilityName                        | CAMP MASTER                   |
      | patientClassName                    | Inpatient                     |
      | dateTime                            | 20020130114524                |
      | service                             | MEDICINE                      |
      | locationUid                         | urn:va:location:9E7A:11		|
      | locationName                        | BCMA                      	|
      | shortLocationName                   | BCMA                         	|
      | locationDisplayName                 | Bcma                      	|
      | movements.dateTime                  | 20140115095259                |
      | movements.localId                   | 4602                          |
      | movements.movementType              | DISCHARGE                     |
      | movements.summary                   | CONTAINS EncounterMovement    |
      | kind                                | Admission                     |
      | pid                                 | 9E7A;100022                   |
      | localId                             | H3419                         |
      | typeName                            | HOSPITALIZATION               |
      | typeDisplayName                     | Hospitalization               |
      | patientClassCode                    | urn:va:patient-class:IMP      |
      | categoryCode                        | urn:va:encounter-category:AD  |
      | categoryName                        | Admission                     |
      | specialty                           | GENERAL MEDICINE              |
      | providers.role                      | A                             |
      | providers.providerUid               | urn:va:user:9E7A:11815        |
      | providers.providerName              | RADTECH,THIRTYNINE           	|
      | providers.providerDisplayName       | Radtech,Thirtynine           	|
      | providers.summary                   | EncounterProvider{uid=''} 	|
      | stay.arrivalDateTime                | 20020130114524                |
      | stay.dischargeDateTime              | 20140115095259                |
      | reasonName                          | ILL	                		|
     

@f295_2_timeline @VPR @US2845 @9E7A164

Scenario: Timeline: Add additional data types Appointment and Lab results
Given a patient with pid "9E7A;100022" has been synced through the RDK API
When the client requests timeline for the patient "9E7A;100022" in RDK format
Then a successful response is returned
And the client receives 101 result(s)
Then the VPR results contain
      | field            | value                                                                    |
      | uid              | urn:va:lab:9E7A:100022:CH;6849395.8546;386                               |
      | facilityCode     | 500                                                                      |
      | facilityName     | CAMP MASTER                                                              |
      | groupName        | HE 0603 1                                                               	|
      | activityDateTime | 20150603145400                                                             |
      | groupUid         | urn:va:accession:9E7A:100022:CH;6849395.8546                             |
      | categoryCode     | urn:va:lab-category:CH                                                   |
      | categoryName     | Laboratory                                                               |
      | observed         | 20150603145400                                                             |
      | resulted         | 20150603145400                                                             |
      | specimen         | BLOOD                                                                    |
      | comment          | CONTAINS Ordering Provider: Thirty Provider Report Released Date/Time:   |
      | typeCode         | urn:lnc:718-7                                                        	|
      | displayName      | HGB                                                                      |
      | result           | 6.0                                                                      |
      | units            | g/dL                                                                    	|
      | low              | 14                                                                       |
      | high             | 18                                                                       |
      | kind             | Laboratory                                                               |
      | resultNumber     | 6                                                                       	|
      | abnormal         | true                                                                    	|
      | micro            | false                                                                    |
      | qualifiedName    | HGB (BLOOD)                                                             	|
      | summary          | HGB (BLOOD) 6.0<em>L</em> g/dL	                                        |
      | pid              | 9E7A;100022                                                              |
      | localId          | CH;6849395.8546;386                                                      |
      | typeName         | HGB                                                                      |
      | statusCode       | urn:va:lab-status:completed                                              |
      | statusName       | completed                                                                |
      | displayOrder     | 20.2                                                                     |
      | typeId           | 3                                                                      	|
      | sample           | CONTAINS BLOOD                                                           |
      | lnccodes         | urn:lnc:718-7                                                         	|

	
	
	
