@F302-5.1_PatientCareTeamDetailHeadersInpatientQuicklook@F302 @CareTeamDetails @regression 

Feature: F302 - Enhance Care Team Header

# POC: Team Saturn

@F302-3.1_PatientCareTeamDetails @US5256
    Scenario: Care Team Information: Detail verification (Panorama)
    Given user is logged into eHMP-UI
    And user searches for and selects "twentythree,inpatient"
    Then Cover Sheet is active
    Then the "patient identifying traits" is displayed with information
    | field     | value         |
    | patient name  | Twentythree,Inpatient   |
    Then Cover Sheet is active
    Then user selects "Care Team Information" drop down
    And the "Care Team Details" table contains headers
    | Provider Title | Name | Analog Pager | Digital Pager | Office Phone |
    And the Care Team Details table contains a row for
    | Provider Title                  | 
    | Primary Care Provider           | 
    | Primary Care Assoc Provider     | 
    | Inpatient Attending Provider    | 
    | Inpatient Provider              | 
    | MH Treatment Team               | 
    | MH Treatment Coordinator        | 


@F302-4.1_PatientCareTeamDetails @US5256
    Scenario: Care Team Information: Detail verification (Panorama)
    Given user is logged into eHMP-UI
    And user searches for and selects "TWENTYTHREE,PATIENT"
    Then Cover Sheet is active
    Then the "patient identifying traits" is displayed with information
    | field			| value               |
    | patient name	| Twentythree,Patient |

    Then Cover Sheet is active
    Then user selects "Care Team Information" drop down
    And the "Care Team Details" table contains headers
    | Provider Title | Name | Analog Pager | Digital Pager | Office Phone |
    And the Care Team Details table contains a row for
    | Provider Title                  | 
    | Primary Care Provider           | 
    | Primary Care Assoc Provider     | 
    | MH Treatment Team               | 
    | MH Treatment Coordinator        | 

@F302-3.2_PatientCareTeamDetailsKodak @US5256 @DE1309 
    Scenario: Patient Information: Demographic verification (Kodak)
    Given user is logged into eHMP-UI as kodak user
    And Resize browser
    And user searches for and selects "TWENTYTHREE,PATIENT"
    Then Cover Sheet is active
    Then the "patient identifying traits" is displayed with information
    | field			| value 				|
    | patient name	| Twentythree,patient 	|
    Then Cover Sheet is active
    Then user selects "Care Team Information" drop down
    And the "Care Team Details" table contains headers
    | Provider Title | Name | Analog Pager | Digital Pager | Office Phone |
    And the Care Team Details table contains a row for
    | Provider Title                  | 
    | Primary Care Provider           | 
    | Primary Care Assoc Provider     | 
    | MH Treatment Team               | 
    | MH Treatment Coordinator        | 
    

@F302-3.1_PatientCareTeamDetailsKodak @US5256 @DE1309 @non_default_login
    Scenario: Patient Information: Demographic verification (Kodak)
    Given user is logged into eHMP-UI as kodak user
    And Resize browser
    And user searches for and selects "twentythree,inpatient"
    Then Cover Sheet is active
    Then the "patient identifying traits" is displayed with information
    | field			| value 				|
    | patient name	| Twentythree,Inpatient 	|
    Then Cover Sheet is active
    Then user selects "Care Team Information" drop down
    And the "Care Team Details" table contains headers
    | Provider Title | Name | Analog Pager | Digital Pager | Office Phone |
   And the Care Team Details table contains a row for
    | Provider Title                  | 
    | Primary Care Provider           | 
    | Primary Care Assoc Provider     | 
    | Inpatient Attending Provider    | 
    | Inpatient Provider   			  | 
    | MH Treatment Team               | 
    | MH Treatment Coordinator        | 

#Quicklook Tests
@F302-5.1_PatientCareTeamDetailHeadersInpatientQuicklook @US5260 @DE1205 @debug @DE2960
    Scenario: Patient Information: Quicklook Inpatient Care Team verification
    Given user is logged into eHMP-UI
    And user searches for and selects "TWENTYTHREE,INPATIENT"
    Then Cover Sheet is active
    # This step is in here just for timing, need the applets to all load before clicking the care team information drop deam
    # because if you don't wait the popover closes when the applet updates
    And the applets are displayed on the coversheet
        | applet                    |
        | CONDITIONS                |
        | NUMERIC LAB RESULTS       |
        | VITALS                    |
        | Active & Recent MEDICATIONS       |
        | ALLERGIES                 |
        | IMMUNIZATIONS             |
        | ORDERS                    |
        | APPOINTMENTS              |
        | COMMUNITY HEALTH SUMMARIES|
    Then user selects "Care Team Information" drop down
    Then user selects "Care Team Inpatient Attending Provider Quicklook" drop down
    Then a Care Team Quicklook table displays
    And the "Care Team Quicklook" table contains headers
    | Facility | Name |  Analog Pager | Digital Pager | Office Phone |
    And the Care Team Quicklook table contains rows
    | Facility |
    | KODAK    | 
    | HDR      | 
    | VLER     | 

@F302-5.3_PatientCareTeamDetailHeadersOutpatientQuicklook @US5260 @DE1205 @debug @DE2960
    Scenario: Patient Information: Quicklook Outpatient Care Team verification
    Given user is logged into eHMP-UI
    And user searches for and selects "TWENTYTHREE,PATIENT"
    Then Cover Sheet is active
    # This step is in here just for timing, need the applets to all load before clicking the care team information drop deam
    # because if you don't wait the popover closes when the applet updates
    And the applets are displayed on the coversheet
        | applet                    |
        | CONDITIONS                |
        | NUMERIC LAB RESULTS       |
        | VITALS                    |
        | Active & Recent MEDICATIONS       |
        | ALLERGIES                 |
        | IMMUNIZATIONS             |
        | ORDERS                    |
        | APPOINTMENTS              |
        | COMMUNITY HEALTH SUMMARIES|
    Then user selects "Care Team Information" drop down
    Then user selects "Care Team Primary Provider Quicklook" drop down
    Then a Care Team Quicklook table displays
    And the "Care Team Quicklook" table contains headers
    | Facility | Name |  Analog Pager | Digital Pager | Office Phone |
    And the Care Team Quicklook table contains rows
    | Facility | 
    | KODAK    | 
    | HDR      | 
    | VLER     | 
