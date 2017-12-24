@PrefetchPatients @F1232

Feature: F1232 - Retrieve list of prefetch patients

@F1232_Get_All_eHMP_Patients
Scenario: View listing of All eHMP Prefetch Patients
Given there are prefetch patients
When the client requests to view list of prefetch patients with strategy search criteria of "eHMP"
Then a successful response is returned
And the results contains the prefetch patient
    | patientIdentifier             | isEhmpPatient |
    | 3^PI^502^USVHA^P              | true          |

@F1232_Get_All_Patients
Scenario: View listing of All Prefetch Patients
Given there are prefetch patients
When the client requests to view list of prefetch patients with strategy search criteria of "all"
Then a successful response is returned
And the results contains the prefetch patient
    | patientIdentifier             | isEhmpPatient |
    | 3^PI^502^USVHA^P              | true          |
    | 8^PI^501^USVHA^P              | false         |

@F1232_Get_Appointments_For_Specific_Facility_Clinic
Scenario: View listing of All Appointments Prefetch Patients For Specific Facility Station Number and Clinic
Given there are prefetch patients
When the client requests to view list of prefetch patients with search criteria of "appointment", "501", "AUDIOLOGY"
Then a successful response is returned
And the results contains the prefetch patient
    | patientIdentifier             | isEhmpPatient |
    | 8^PI^501^USVHA^P              | false         |
