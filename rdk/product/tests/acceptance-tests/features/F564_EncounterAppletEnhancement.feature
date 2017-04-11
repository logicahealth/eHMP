@timeline @US5650 @vxsync @patient @F564

Feature: F564 - Encounters Applet Enhancements

@F295__timeline_Admitting_Discharge_Diagnosis @F564-1 @F564-2 @VPR @US5650 @9E7A8

Scenario: Timeline: Add additional data types Admitting and Discharge diagnosis for adminsion deatail view
Given a patient with pid "9E7A;8" has been synced through the RDK API
When the client requests timeline for the patient "9E7A;8" in RDK format
Then a successful response is returned
And the VPR results contain
      | field                        | value                           |
      | uid                          | urn:va:visit:9E7A:8:H493        |
      | dischargeDiagnoses.admissionUid      | urn:va:visit:9E7A:8:H493        |
      | dischargeDiagnoses.arrivalDateTime   | 19910904094159                  |
      | dischargeDiagnoses.dischargeDateTime | 19920128160000                    |
      | dischargeDiagnoses.facilityCode      | 515.6                           |
      | dischargeDiagnoses.facilityName      | TROY                            |
      | dischargeDiagnoses.icdCode           | urn:icd:305.02                  |
      | dischargeDiagnoses.icdName           | ALCOHOL ABUSE-EPISODIC          |
      | dischargeDiagnoses.lastUpdateTime    | 19920128160000                  |
      | dischargeDiagnoses.localId           | 130;70;DXLS                     |
      | dischargeDiagnoses.pid               | 9E7A;8                          |
      | dischargeDiagnoses.principalDx       | true                            |
      | dischargeDiagnoses.stampTime         | 19920128160000                  |
      | dischargeDiagnoses.uid               | urn:va:ptf:9E7A:8:130;70;DXLS   |

