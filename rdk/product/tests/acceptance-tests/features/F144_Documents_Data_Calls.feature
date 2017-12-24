@data_verification_documents @F144
Feature: F144 - eHMP viewer GUI - Documents

# This test replaces the Documents Display test in ehmp-ui
@F144_Documents_Display1 @US1914 @DE2307
Scenario: Verify Documents will display all Consult, Imaging, Surgery, Advance Directive, Procedure and Crisis Note for a given patient
Given a patient with pid "SITE;229" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "SITE;229" with starting at "19350407"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field           | value                 |
      | dateTime        | 1998111PORT0          |
      | facilityName    | New Jersey HCS        |
      | kind            | Procedure             |
      | name            | LAPARASCOPY           |
And the VPR results contain
      | field               | value                                 |
      | dateTime            | 20061208073000                          |
      | facilityName        | CAMP MASTER                        |
      | kind                | Surgery                               |
      | typeName            | LEFT INGUINAL HERNIA REPAIR WITH MESH |
      | summary             | LEFT INGUINAL HERNIA REPAIR WITH MESH |
      | providerDisplayName | Provider,One                          |
And the VPR results contain
      | field               | value                     |
      | dateTime            | 19970515            		|
      | facilityName        | CAMP MASTER               |
      | kind                | Consult                   |
      | typeName            | CARDIOLOGY Cons 			|
      | summary		    	| CARDIOLOGY Cons			|
      | place				| Consultant's choice		|
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
      | referenceDateTime   | 20000404105506        |
      | facilityName        | ABILENE (CAA)         |
      | kind                | Progress Note         |
      | summary             | CARDIOLOGY ATTENDING CONSULT |
      | authorDisplayName   | Wardclerk,Sixtyeight  |
And the VPR results contain
      | field               | value                 |
      | referenceDateTime   | 20040325191633        |
      | facilityName        | ABILENE (CAA)         |
      | kind                | Discharge Summary     |
      | documentTypeName    | Discharge Summary     |
      | authorDisplayName   | Vehu,Four       		|
And the VPR results contain
      | field               | value                 |
      | referenceDateTime   | 20070516090400        |
      | facilityName        | CAMP BEE              |
      | kind                | Advance Directive     |
      | documentTypeName    | Advance Directive     |
      | summary             | ADVANCE DIRECTIVE COMPLETED |
      | authorDisplayName   | Labtech,Fiftynine     |
And the VPR results contain
      | field                 | value             |
      | referenceDateTime     | 20000521094900    |
      | facilityName          | ABILENE (CAA)     |
      | kind                  | Crisis Note       |
      | summary               | CRISIS NOTE       |
      | authorDisplayName     | Vehu,Twentyone    |

@F144_Documents_Display3 @US1914 @DE2307
Scenario: Verify Documents will display all Laboratory Report for a given patient
Given a patient with pid "SITE;100022" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "SITE;100022" with starting at "19950306"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field                 | value                        |
      | referenceDateTime     | 20000804000000               |
      | facilityName          | DOD                          |
      | kind                  | Laboratory Report            |
      | summary               | PATHOLOGY REPORT			 |
      | localTitle		      | PATHOLOGY REPORT             |

@F144_Documents_Display4 @US2592 @DE2307
Scenario: Verify Documents will display all Administrative Note from DoD for a given patient
Given a patient with pid "SITE;100840" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "SITE;100840" with starting at "19941130"
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
Scenario: Verify Documents will display all data between specific date range for a given patient
Given a patient with pid "SITE;100022" has been synced through the RDK API
When the client requests the DOCUMENTS for the patient "SITE;100022" with GDF set to custom date range between "20140101" and "20151010235959"
Then a successful response is returned
#And the VPR results for Documents contain
And the VPR results contain
      | field                 | value                         |
      | referenceDateTime     | 20140127180000                  |
      | facilityName          | CAMP MASTER                   |
      | kind                  | Progress Note                 |
      | summary               | ASI-ADDICTION SEVERITY INDEX  |
      | authorDisplayName     | Programmer,One                |
And the VPR results contain
      | field                 | value                                                 |
      | referenceDateTime     | 20140127180900                                          |
      | facilityName          | CAMP MASTER                                        	  |
      | kind                  | Progress Note                                         |
      | summary               | CONTAINS NURSING ADMISSION ASSESSMENT				  |
      | authorDisplayName     | Programmer,One                                        |
