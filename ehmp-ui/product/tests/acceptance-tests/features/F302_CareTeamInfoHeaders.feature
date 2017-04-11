@F302 @CareTeamInfoHeaders @regression

Feature: F302 - Enhance Patient Header - Include Non-Local Care Team by Site

# POC: Team Saturn

@F302-1.1_CareTeamInpatientHeaders_b @US4454 @US5599 @DE4009
Scenario: Care Team Information headers for Inpatient
    When user searches for and selects "twentythree,inpatient"
    And Cover Sheet is active
#    And the "patient identifying traits" is displayed with information
#    | field     | value         |
#    | patient name  | Twentythree,Inpatient   |
    # Inpatient data
    Then the patientInformationProvider displays label "Primary Care Provider:"
    And the Care Team "Primary Care Provider:" group displays data

    And the patientInformationProvider displays label "Inpatient Attending:"
    And the Care Team "Inpatient Attending:" group displays data

    And the patientInformationProvider displays label "Provider:"
    And the Care Team "Provider:" group displays data

    And the patientInformationProvider displays label "Mental Health:"
    And the Care Team "Mental Health:" group displays data

@F302-2.1_CareTeamOutpatientHeaders @US4454 @US5599
Scenario: Care Team Information headers for Outpatient
    When user searches for and selects "TWENTYTHREE,PATIENT"
    And Cover Sheet is active
#    And the "patient identifying traits" is displayed with information
#    | field         | value               |
#    | patient name  | Twentythree,Patient |
    #Outpatient data
    Then the patientInformationProvider displays label "Primary Care Provider:"
    And the Care Team "Primary Care Provider:" group displays data

    And the patientInformationProvider doesn't display label "Inpatient Attending:"
    And the patientInformationProvider doesn't display label "Provider:"

    And the patientInformationProvider displays label "Mental Health:"
    And the Care Team "Mental Health:" group displays data
