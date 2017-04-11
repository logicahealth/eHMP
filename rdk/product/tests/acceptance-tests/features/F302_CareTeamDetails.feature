@F302
Feature: F302 - Enhance Care Team Header

# TEAM POC: SATURN

@F302-1.1_CareTeamInpatientHeaders @US4454 @US5599
Scenario: Care Team Information headers for Inpatient
# twentythree,inpatient
Given a patient with pid "9E7A;100731" has been synced through the RDK API
When the client requests demographics for the patient "9E7A;100731" with credentials
 | SITE        | ACCESSCODE    | VERIFYCODE  |
 | 9E7A        | pu1234        | pu1234!!    |
Then a successful response is returned
And the VPR results contain
|field    | value  |
| teamInfo.team.name | GREEN |
| teamInfo.team.phone| 555-555-5858 |


@US5256
Scenario: Care Team Information: Detail verification for outpatient (Panorama)
# twentythree,patient
Given a patient with pid "9E7A;722" has been synced through the RDK API
When the client requests demographics for the patient "9E7A;722" with credentials
 | SITE        | ACCESSCODE    | VERIFYCODE  |
 | 9E7A        | pu1234        | pu1234!!    |
Then a successful response is returned
#| Primary Care Provider           | Provider, Fifteen   |  (843) 555-5455   | (843) 555-5456    | (843) 555-5454   |
And the VPR results contain
      | field                                 | value            |
      | teamInfo.primaryProvider.name         | PROVIDER,FIFTEEN |
      | teamInfo.primaryProvider.analogPager  | (843)555-5455    |
      | teamInfo.primaryProvider.digitalPager | (843)555-5456    |
      | teamInfo.primaryProvider.officePhone  | (843)555-5454    |
 #| Primary Care Assoc Provider     | Pcmm-resident, One  |  (555) 555-8843   | (555) 555-8876    | (555) 555-8837   | 
 And the VPR results contain
      | field                                   | value             |
      | teamInfo.associateProvider.name         | PCMM-RESIDENT,ONE |
      | teamInfo.associateProvider.analogPager  | (555)555-8843     |
      | teamInfo.associateProvider.digitalPager | (555)555-8876     |
      | teamInfo.associateProvider.officePhone  | (555)555-8837     |
  And the VPR results contain
      | field                                   | value         |
      | teamInfo.attendingProvider.name         | unassigned  |
      | teamInfo.attendingProvider.analogPager  | IS_NOT_SET |
      | teamInfo.attendingProvider.digitalPager | IS_NOT_SET|
      | teamInfo.attendingProvider.officePhone  | IS_NOT_SET |
  And the VPR results contain
      | field                                   | value         |
      | teamInfo.inpatientProvider.name         | unassigned  |
      | teamInfo.inpatientProvider.analogPager  | IS_NOT_SET |
      | teamInfo.inpatientProvider.digitalPager | IS_NOT_SET |
      | teamInfo.inpatientProvider.officePhone  | IS_NOT_SET |
  #| MH Treatment Team               | Mh Team             |  not specified    | not specified     | (555) 555-4324   |
  And the VPR results contain
      | field                                    | value        |
      | teamInfo.mhCoordinator.mhTeam            | MH TEAM      |
      | teamInfo.mhCoordinator.mhTeamOfficePhone | 555-555-4324 |
#| MH Treatment Coordinator        | Vehu, One           |  (555) 555-5654   | (555) 555-3242    | (555) 555-5453   |
And the VPR results contain
      | field                               | value         |
      | teamInfo.mhCoordinator.name         | VEHU,ONE      |
      | teamInfo.mhCoordinator.analogPager  | (555)555-5654 |
      | teamInfo.mhCoordinator.digitalPager | (555)555-3242 |
      | teamInfo.mhCoordinator.officePhone  | (555)555-5453 |

@US5256
Scenario: Care Team Information: Detail verification for inpatient (Panorama)
# twentythree,inpatient
Given a patient with pid "9E7A;100731" has been synced through the RDK API
When the client requests demographics for the patient "9E7A;100731" with credentials
 | SITE        | ACCESSCODE    | VERIFYCODE  |
 | 9E7A        | pu1234        | pu1234!!    |
Then a successful response is returned
#| Primary Care Provider           | Provider, Fifteen   |  (843) 555-5455   | (843) 555-5456    | (843) 555-5454   |
And the VPR results contain
      | field                                 | value            |
      | teamInfo.primaryProvider.name         | PROVIDER,FIFTEEN |
      | teamInfo.primaryProvider.analogPager  | (843)555-5455    |
      | teamInfo.primaryProvider.digitalPager | (843)555-5456    |
      | teamInfo.primaryProvider.officePhone  | (843)555-5454    |
 #| Primary Care Assoc Provider     | Pcmm-resident, One  |  (555) 555-8843   | (555) 555-8876    | (555) 555-8837   | 
 And the VPR results contain
      | field                                   | value             |
      | teamInfo.associateProvider.name         | PCMM-RESIDENT,ONE |
      | teamInfo.associateProvider.analogPager  | (555)555-8843     |
      | teamInfo.associateProvider.digitalPager | (555)555-8876     |
      | teamInfo.associateProvider.officePhone  | (555)555-8837     |
  #| Inpatient Attending Provider    | Provider, One       |  (555) 555-7677   | (555) 555-7688    | (555) 555-7678   |
  And the VPR results contain
      | field                                   | value         |
      | teamInfo.attendingProvider.name         | PROVIDER,ONE  |
      | teamInfo.attendingProvider.analogPager  | (555)555-7677 |
      | teamInfo.attendingProvider.digitalPager | (555)555-7688 |
      | teamInfo.attendingProvider.officePhone  | (555)555-7678 |
  #| Inpatient Provider              | Provider, One       |  (555) 555-7677   | (555) 555-7688    | (555) 555-7678   |
  And the VPR results contain
      | field                                   | value         |
      | teamInfo.inpatientProvider.name         | PROVIDER,ONE  |
      | teamInfo.inpatientProvider.analogPager  | (555)555-7677 |
      | teamInfo.inpatientProvider.digitalPager | (555)555-7688 |
      | teamInfo.inpatientProvider.officePhone  | (555)555-7678 |
  #| MH Treatment Team               | Mh Team             |  not specified    | not specified     | (555) 555-4324   |
  And the VPR results contain
      | field                                    | value        |
      | teamInfo.mhCoordinator.mhTeam            | MH TEAM      |
      | teamInfo.mhCoordinator.mhTeamOfficePhone | 555-555-4324 |
#| MH Treatment Coordinator        | Vehu, One           |  (555) 555-5654   | (555) 555-3242    | (555) 555-5453   |
And the VPR results contain
      | field                               | value         |
      | teamInfo.mhCoordinator.name         | VEHU,ONE      |
      | teamInfo.mhCoordinator.analogPager  | (555)555-5654 |
      | teamInfo.mhCoordinator.digitalPager | (555)555-3242 |
      | teamInfo.mhCoordinator.officePhone  | (555)555-5453 |

@US5256
Scenario: Care Team Information: Detail verification for inpatient (Kodak)
# twentythree,inpatient
Given a patient with pid "9E7A;100731" has been synced through the RDK API
When the client requests demographics for the patient "9E7A;100731" with credentials
 | SITE        | ACCESSCODE    | VERIFYCODE  |
 | 9E7A        | pu1234        | pu1234!!    |
Then a successful response is returned
#| Primary Care Provider           | Provider, Seventythree  |  (555) 888-9900   | (555) 888-9977    | (555) 888-9999   |
And the VPR results contain
      | field                                 | value                  |
      | teamInfo.primaryProvider.name         |  PROVIDER,SEVENTYTHREE |
      | teamInfo.primaryProvider.analogPager  | (555)888-9900          |
      | teamInfo.primaryProvider.digitalPager | (555)888-9977          |
      | teamInfo.primaryProvider.officePhone  | (555)888-9999          |
 #| Primary Care Assoc Provider     | Unassigned        |  not specified    | not specified     | not specified    |
 And the VPR results contain
      | field                                   | value      |
      | teamInfo.associateProvider.name         | unassigned |
      | teamInfo.associateProvider.analogPager  | IS_NOT_SET |
      | teamInfo.associateProvider.digitalPager | IS_NOT_SET |
      | teamInfo.associateProvider.officePhone  | IS_NOT_SET |
  #| MH Treatment Team               | Mh Team          |  not specified    | not specified     | (555) 888-9832   |
  And the VPR results contain
      | field                                    | value        |
      | teamInfo.mhCoordinator.mhTeam            | MH TEAM      |
      | teamInfo.mhCoordinator.mhTeamOfficePhone | 555-888-9832 |
#| MH Treatment Coordinator        | Vehu, Two        |  (555) 888-7771   | (555) 888-7434    | (555) 888-7777   |
And the VPR results contain
      | field                               | value         |
      | teamInfo.mhCoordinator.name         | VEHU,TWO      |
      | teamInfo.mhCoordinator.analogPager  | (555)888-7771 |
      | teamInfo.mhCoordinator.digitalPager | (555)888-7434 |
      | teamInfo.mhCoordinator.officePhone  | (555)888-7777 |  
#| Inpatient Attending Provider    | Provider, One          |  (555) 888-0001   | (555) 888-0002    | (555) 888-0000   |
  And the VPR results contain
      | field                                   | value         |
      | teamInfo.attendingProvider.name         | PROVIDER,ONE  |
      | teamInfo.attendingProvider.analogPager  | (555)888-0001 |
      | teamInfo.attendingProvider.digitalPager | (555)888-0002 |
      | teamInfo.attendingProvider.officePhone  | (555)888-0000 |
  #| Inpatient Provider           | Provider, One           |  (555) 888-0001   | (555) 888-0002    | (555) 888-0000   |
  And the VPR results contain
      | field                                   | value         |
      | teamInfo.inpatientProvider.name         | PROVIDER,ONE  |
      | teamInfo.inpatientProvider.analogPager  | (555)888-0001 |
      | teamInfo.inpatientProvider.digitalPager | (555)888-0002 |
      | teamInfo.inpatientProvider.officePhone  | (555)888-0000 |
  
@US5256
Scenario: Care Team Information: Detail verification for outpatient (Kodak)
# twentythree,patient
Given a patient with pid "9E7A;722" has been synced through the RDK API
When the client requests demographics for the patient "9E7A;722" with credentials
 | SITE        | ACCESSCODE    | VERIFYCODE  |
 | 9E7A        | pu1234        | pu1234!!    |
Then a successful response is returned
#| Primary Care Provider           | Provider, Seventythree  |  (555) 888-9900   | (555) 888-9977    | (555) 888-9999   |
And the VPR results contain
      | field                                 | value                  |
      | teamInfo.primaryProvider.name         |  PROVIDER,SEVENTYTHREE |
      | teamInfo.primaryProvider.analogPager  | (555)888-9900          |
      | teamInfo.primaryProvider.digitalPager | (555)888-9977          |
      | teamInfo.primaryProvider.officePhone  | (555)888-9999          |
 #| Primary Care Assoc Provider     | Unassigned        |  not specified    | not specified     | not specified    |
 And the VPR results contain
      | field                                   | value      |
      | teamInfo.associateProvider.name         | unassigned |
      | teamInfo.associateProvider.analogPager  | IS_NOT_SET |
      | teamInfo.associateProvider.digitalPager | IS_NOT_SET |
      | teamInfo.associateProvider.officePhone  | IS_NOT_SET |
  #| MH Treatment Team               | Mh Team          |  not specified    | not specified     | (555) 888-9832   |
  And the VPR results contain
      | field                                    | value        |
      | teamInfo.mhCoordinator.mhTeam            | MH TEAM      |
      | teamInfo.mhCoordinator.mhTeamOfficePhone | 555-888-9832 |
#| MH Treatment Coordinator        | Vehu, Two        |  (555) 888-7771   | (555) 888-7434    | (555) 888-7777   |
And the VPR results contain
      | field                               | value         |
      | teamInfo.mhCoordinator.name         | VEHU,TWO      |
      | teamInfo.mhCoordinator.analogPager  | (555)888-7771 |
      | teamInfo.mhCoordinator.digitalPager | (555)888-7434 |
      | teamInfo.mhCoordinator.officePhone  | (555)888-7777 |  
#| Inpatient Attending Provider    | Provider, One          |  (555) 888-0001   | (555) 888-0002    | (555) 888-0000   |
  And the VPR results contain
      | field                                   | value         |
      | teamInfo.attendingProvider.name         | unassigned  |
      | teamInfo.attendingProvider.analogPager  | IS_NOT_SET |
      | teamInfo.attendingProvider.digitalPager | IS_NOT_SET |
      | teamInfo.attendingProvider.officePhone  | IS_NOT_SET |
  #| Inpatient Provider           | Provider, One           |  (555) 888-0001   | (555) 888-0002    | (555) 888-0000   |
  And the VPR results contain
      | field                                   | value      |
      | teamInfo.inpatientProvider.name         | unassigned |
      | teamInfo.inpatientProvider.analogPager  | IS_NOT_SET |
      | teamInfo.inpatientProvider.digitalPager | IS_NOT_SET |
      | teamInfo.inpatientProvider.officePhone  | IS_NOT_SET |