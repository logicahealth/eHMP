@F302-5.1_PatientCareTeamDetailHeadersInpatientQuicklook@F302 @CareTeamDetails @future @DE4560

Feature: F302 - Enhance Care Team Header
# POC: Team Saturn

@F302-3.1_PatientCareTeamDetails @US5256 @DE4009
    Scenario: Care Team Information: Detail verification (Panorama)
    # Given user is logged into eHMP-UI
    When user searches for and selects "twentythree,inpatient"
#    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
      | field     | value         |
      | patient name  | Twentythree,Inpatient   |
    And Cover Sheet is active
    And user selects Provider Information drop down
    Then the "primary_care_provider" group contain headers
      | headers |
      | Name |
      | Analog Pager   |
      | Digital Pager |
      | Office Phone |
    And the Provider Information Group contains headers
      | title                           |
      | Primary Care Provider           |
      | MH Treatment Team               |
      | MH Treatment Coordinator        |

@F302-4.1_PatientCareTeamDetails @US5256
    Scenario: Care Team Information: Detail verification (Panorama)
    # Given user is logged into eHMP-UI
    When user searches for and selects "TWENTYTHREE,PATIENT"
#    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
      | field			| value               |
      | patient name	| Twentythree,Patient |
    And Cover Sheet is active
    And user selects Provider Information drop down
    Then the "primary_care_provider" group contain headers
      | headers |
      | Name |
      | Analog Pager   |
      | Digital Pager |
      | Office Phone |
    And the Provider Information Group contains headers
      | title                           |
      | Primary Care Provider           |
      | MH Treatment Team               |
      | MH Treatment Coordinator        |

  @F302-3.2_PatientCareTeamDetailsKodak @US5256 @DE1309
    Scenario: Patient Information: Demographic verification (Kodak)
    When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    And user searches for and selects "TWENTYTHREE,PATIENT"
#    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
      | field			| value 				|
      | patient name	| Twentythree,patient 	|
    And Cover Sheet is active
    And user selects Provider Information drop down
    Then the "primary_care_provider" group contain headers
      | headers       |
      | Name          |
      | Analog Pager  |
      | Digital Pager |
      | Office Phone  |
    And the Provider Information Group contains headers
      | title                           |
      | Primary Care Provider           |
      | MH Treatment Team               |
      | MH Treatment Coordinator        |

@F302-3.1_PatientCareTeamDetailsKodak @US5256 @DE1309 @non_default_login @DE4009
    Scenario: Patient Information: Demographic verification (Kodak)
    When POB user is logged into EHMP-UI with facility as  "KODAK" accesscode as  "mx1234" verifycode as  "mx1234!!"
    And staff view screen is displayed
    And Navigate to Patient Search Screen
    And user searches for and selects "twentythree,inpatient"
#    And Cover Sheet is active
    And the "patient identifying traits" is displayed with information
      | field			| value 				|
      | patient name	| Twentythree,Inpatient 	|
    And Cover Sheet is active
    And user selects Provider Information drop down
    Then the "primary_care_provider" group contain headers
      | headers       |
      | Name          |
      | Analog Pager  |
      | Digital Pager |
      | Office Phone  |
    And the Provider Information Group contains headers
      | title                           |
      | Primary Care Provider           |
      | MH Treatment Team               |
      | MH Treatment Coordinator        |

#Quicklook Tests
@F302-5.1_PatientCareTeamDetailHeadersInpatientQuicklook @US5260 @DE1205 @DE2960 @debug @DE4009
    Scenario: Patient Information: Quicklook Inpatient Care Team verification
    When user searches for and selects "TWENTYTHREE,INPATIENT"
    And Cover Sheet is active
    # This step is in here just for timing, need the applets to all load before clicking the care team information drop deam
    # because if you don't wait the popover closes when the applet updates
    And the applets are displayed on the coversheet
      | applet                    |
      | PROBLEMS                |
      | NUMERIC LAB RESULTS       |
      | VITALS                    |
      | Active & Recent MEDICATIONS       |
      | ALLERGIES                 |
      | IMMUNIZATIONS             |
      | ORDERS                    |
      | APPOINTMENTS              |
      | COMMUNITY HEALTH SUMMARIES|
    And user selects Provider Information drop down
    Then the "primary_care_assoc_provider" group contain headers
      | headers       |
      | Name          |
      | Analog Pager  |
      | Digital Pager |
      | Office Phone  |
    And the "mh_treatment_team" group contain headers
      | headers       |
      | Name          |
      | Office Phone  |
    And the "mh_treatment_coordinator" group contain headers
      | headers       |
      | Name          |
      | Analog Pager  |
      | Digital Pager |
      | Office Phone  |

@F302-5.3_PatientCareTeamDetailHeadersOutpatientQuicklook @US5260 @DE1205 @DE2960
    Scenario: Patient Information: Quicklook Outpatient Care Team verification
    When user searches for and selects "TWENTYTHREE,PATIENT"
    And Cover Sheet is active
    # This step is in here just for timing, need the applets to all load before clicking the care team information drop deam
    # because if you don't wait the popover closes when the applet updates
    And the applets are displayed on the coversheet
      | applet                    |
      | PROBLEMS                |
      | NUMERIC LAB RESULTS       |
      | VITALS                    |
      | Active & Recent MEDICATIONS       |
      | ALLERGIES                 |
      | IMMUNIZATIONS             |
      | ORDERS                    |
      | APPOINTMENTS              |
      | COMMUNITY HEALTH SUMMARIES|
    And user selects Provider Information drop down
    Then the "primary_care_assoc_provider" group contain headers
      | headers       |
      | Name          |
      | Analog Pager  |
      | Digital Pager |
      | Office Phone  |
    And the "mh_treatment_team" group contain headers
      | headers       |
      | Name          |
      | Office Phone  |
    And the "mh_treatment_coordinator" group contain headers
      | headers       |
      | Name          |
      | Analog Pager  |
      | Digital Pager |
      | Office Phone  |
