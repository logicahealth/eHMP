@f338_MedReviewApplet 
Feature: F338 - Meds Review Sparkline 2 -  Med Review applet display

@f338_MedReviewApplet_Inpatient
Scenario: Verify Med Review Inpatient Meds
# 9E7A;164 = zzzretiredonenineteen, patient
Given a patient with pid "9E7A;164" has been synced through the RDK API
When the client requests medications for the patient "9E7A;164" with parameters
	| parameter | value |
	|filter|nin(vaStatus,["CANCELLED", "UNRELEASED"])|
Then a successful response is returned
#And the response should contain 4 inpatient meds
And the VPR results contain
      | field                       | value                |
      | products.ingredientCodeName | AMPICILLIN           |
      | kind                        | Medication, Infusion |
      | products.strength           | 1 GM                 |
      | vaStatus                    | EXPIRED              |
      | calculatedStatus            | Expired              |
And the VPR results contain
      | field                       | value                |
      | products.ingredientCodeName | CEFAZOLIN            |
      | kind                        | Medication, Infusion |
      | products.strength           | 1 GM                 |
      | vaStatus                    | EXPIRED              |
      | calculatedStatus            | Expired              |
And the VPR results contain
      | field                       | value                 |
      | products.ingredientName     | DIGOXIN TAB           |
      | kind                        | Medication, Inpatient |
      | sig                         | CONTAINS Give:        |
      | vaStatus                    | EXPIRED               |
      | calculatedStatus            | Expired               |
And the VPR results contain
      | field                       | value                 |
      | products.ingredientCodeName | FUROSEMIDE            |
      | kind                        | Medication, Inpatient |
      | sig                         | CONTAINS Give:        |
      | vaStatus                    | EXPIRED               |
      | calculatedStatus            | Expired               |
And the response should contain 4 outpatient meds

@f338_MedReviewApplet_outpatient
Scenario: Verify Med Review Outpatient Meds
# 10114V651499 = fourteen, patient
Given a patient with pid "9E7A;271" has been synced through the RDK API
When the client requests medications for the patient "9E7A;271" with parameters
	| parameter | value |
	|filter|nin(vaStatus,["CANCELLED", "UNRELEASED"])|
Then a successful response is returned
#And the response should contain 6 outpatient meds - There are 6 unique meds, but 45 total
#And the response should contain 43 outpatient meds
#And the response should contain 2 non-va meds
    And the VPR results contain                                                         
      | field                       | value                  |
      | products.ingredientCodeName | METFORMIN              |
      | kind                        | Medication, Outpatient |
      | products.strength           | 500 MG                 |
      | vaStatus                    | EXPIRED                |
      | calculatedStatus            | Expired                |
    And the VPR results contain                                                        
      | field                       | value                  |
      | products.ingredientCodeName | METOPROLOL             |
      | kind                        | Medication, Outpatient |
      | products.strength           | 50 MG                  |
      | vaStatus                    | EXPIRED                |
      | calculatedStatus            | Expired                |
    And the VPR results contain                                                         
      | field                       | value                  |
      | products.ingredientCodeName | SIMVASTATIN            |
      | kind                        | Medication, Outpatient |
      | products.strength           | 40 MG                  |
      | vaStatus                    | EXPIRED                |
      | calculatedStatus            | Expired                |
    And the VPR results contain                                                         
      | field                       | value                  |
      | products.ingredientCodeName | WARFARIN               |
      | kind                        | Medication, Outpatient |
      | products.strength           | 5 MG                   |
      | vaStatus                    | DISCONTINUED           |
      | calculatedStatus            | Discontinued           |
    And the VPR results contain                                                         
      | field                       | value              |
      | products.ingredientCodeName | ASPIRIN            |
      | kind                        | Medication, Non-VA |
      | products.strength           | 81 MG              |
      | vaStatus                    | ACTIVE             |
      | calculatedStatus            | Expired            |