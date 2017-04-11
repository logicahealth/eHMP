@data_verification_documents @F144
Feature: F144 - eHMP viewer GUI - Documents

# This test replaces the Documents Display test in ehmp-ui
@F144_Documents_Display1 @US1914 @DE2307
Scenario: Verify Documents will display all Consult, Imaging, Surgery, Advance Directive and Procedure for a given patient
Given a patient with pid "9E7A;100012" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "9E7A;100012" with starting at "19350407"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field           | value                 |
      | dateTime        | 199811190800          |
      | facilityName    | New Jersey HCS        |
      | kind            | Procedure             |
      | name            | LAPARASCOPY           |
And the VPR results contain
      | field               | value                                 |
      | dateTime            | 200704050730                          |
      | facilityName        | CAMP MASTER                           |
      | kind                | Surgery                               |
      | typeName            | LEFT INGUINAL HERNIA REPAIR WITH MESH |
      | summary             | LEFT INGUINAL HERNIA REPAIR WITH MESH |
      | providerDisplayName | Provider,One                          |
And the VPR results contain
      | field               | value                     |
      | dateTime            | 20040402023152            |
      | facilityName        | CAMP MASTER               |
      | kind                | Consult                   |
      | typeName            | AUDIOLOGY OUTPATIENT Cons |
      | summary		    | AUDIOLOGY OUTPATIENT Cons |
      | providerDisplayName | Pathology,One             |
And the VPR results contain
      | field               | value                                  |
      | dateTime            | 199702261300                           |
      | facilityName        | New Jersey HCS                         |
      | kind                | Imaging                                |
      | typeName            | RADIOLOGIC EXAMINATION, ANKLE; 2 VIEWS |
      | summary             | RADIOLOGIC EXAMINATION, ANKLE; 2 VIEWS |
      | providerDisplayName | Wardclerk,Sixtythree                   |
And the VPR results contain
      | field               | value                 |
      | referenceDateTime   | 200403311609          |
      | facilityName        | CAMP MASTER           |
      | kind                | Progress Note         |
      | summary             | GENERAL MEDICINE NOTE |
      | authorDisplayName   | Labtech,Special       |
And the VPR results contain
      | field               | value                 |
      | referenceDateTime   | 20040325192854        |
      | facilityName        | ABILENE (CAA)         |
      | kind                | Discharge Summary     |
      | documentTypeName    | Discharge Summary     |
      | authorDisplayName   | Vehu,Ninetynine       |
And the VPR results contain
      | field               | value                 |
      | referenceDateTime   | 200705170933          |
      | facilityName        | CAMP MASTER           |
      | kind                | Advance Directive     |
      | documentTypeName    | Advance Directive     |
      | summary             | ADVANCE DIRECTIVE COMPLETED |
      | authorDisplayName   | Labtech,Fiftynine     |

@F144_Documents_Display2 @US1914 @DE2307
Scenario: Verify Documents will display all Crisis Notes for a given patient
Given a patient with pid "9E7A;100012" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "9E7A;231" with starting at "19941130"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field                 | value             |
      | referenceDateTime     | 20000521115817    |
      | facilityName          | ABILENE (CAA)     |
      | kind                  | Crisis Note       |
      | summary               | CRISIS NOTE       |
      | authorDisplayName     | Vehu,Twentyone    |

@F144_Documents_Display3 @US1914 @DE2307
Scenario: Verify Documents will display all Laboratory Report for a given patient
Given a patient with pid "9E7A;17" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "9E7A;17" with starting at "19950306"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field                 | value                        |
      | referenceDateTime     | 199503061452                 |
      | facilityName          | TROY                         |
      | kind                  | Laboratory Report            |
      | summary               | LR SURGICAL PATHOLOGY REPORT |
      | authorDisplayName     | Provider,Sixteen             |

@F144_Documents_Display4 @US2592 @DE2307
Scenario: Verify Documents will display all Administrative Note from DoD for a given patient
Given a patient with pid "9E7A;100840" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "9E7A;100840" with starting at "19941130"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field                 | value                |
      | referenceDateTime     | 20120410165452       |
      | facilityName          | DOD                  |
      | kind                  | Administrative Note  |
      | summary               | Administrative Note  |
      | authorDisplayName     | LANF, THREE          |

@F144_Documents_Custom_Date_Range @US2594
Scenario: Verify Documents will display all date between specific date range for a given patient
Given a patient with pid "9E7A;65" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "9E7A;65" with GDF set to custom date range between "19980101" and "20151010235959"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field                 | value                         |
      | referenceDateTime     | 199904211210                  |
      | facilityName          | CAMP MASTER                   |
      | kind                  | Progress Note                 |
      | summary               | ASI-ADDICTION SEVERITY INDEX  |
      | authorDisplayName     | Radtech,Twenty                |
And the VPR results contain
      | field                 | value                                                 |
      | referenceDateTime     | 19980427110542                                        |
      | facilityName          | CAMP MASTER                                           |
      | kind                  | Progress Note                                         |
      | summary               | RMS-OCCUPATIONAL THERAPY <OCCUPATIONAL THERAPY NOTE>  |
      | authorDisplayName     | Provider,Prf                                          |
