@F321 @US6176 @TC302 @regression @US7259 @future @US146753
Feature: Condition-based Analysis Workspaces - Immutable Hypertension Workspace

# Filter tests based off of steps in eHMP_Regression Test Procedures for IOC Release 1.2.1_v1.0_08192015dia

Background:
#   Given user is testing functionality

# @US6176
# Scenario: User performs pre steps
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	And Default Screen is active

@US6176_navigation @US6176_7
Scenario: User can navigate to Hypertension CBW 
	When user selects Hypertension from Coversheet dropdown
	Then the Hypertension CBW is displayed

@US6176 @US6176_8
Scenario: Hypertension CBW  displays expected applets
	When the user navigates to the Hypertension CBW
	And the applets are displayed on the Hypertension CBW
      | applet                 |
      | PROBLEMS               |
      | NUMERIC LAB RESULTS    |
      | VITALS                 |
      | TIMELINE               |
      | MEDICATIONS REVIEW     |
      | CLINICAL REMINDERS     |
      | APPOINTMENTS & VISITS  |
      | DOCUMENTS              |

@US6176 @US6176_9 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Hypertension CBW has the correct Filters applied for Lab Results
      When the user navigates to the Hypertension CBW
      Then the Lab Results applet reports filtered "Filtered Hypertension"

@US6176 @US6176_9 @DE3444
Scenario: Verify the Hypertension CBW has the correct Filters applied for Lab Results
	When the user navigates to the Hypertension CBW
	# Then the Lab Results applet reports filtered "Filtered Hypertension"
	And the filters applied to Lab Results contains
	| applied filters |
	|	LDL |
	And the filters applied to Lab Results are
      | applied filters |
      | BMP             |
      | Glucose         |
      | Urea Nitrogen   |
      | Sodium          |
      | Potassium       |
      | Chloride        |
      | CO2             |
      | Creatinine      |
      | Calcium         |
      | CBC             |
      | WBC             |
      | RBC             |
      | HGB             |
      | HCT             |
      | MCV             |
      | MCH             |
      | MCHC            |
      | RDW             |
      | MPV             |
      | Platelet        |
      | Count           |
      | DIFF            |
      | Segs            |
      | Bands           |
      | Lymphs          |
      | Atypical        |
      | Lymphocytes     |
      | Monos           |
      | Eosino          |
      | Baso            |
      | Teardrop        |
      | Normocytic      |
      | Microcytosis    |
      | Macrocytosis    |
      | Anisocytosis    |
      | Poukilocytosis  |
      | Ovalocytes      |
      | Acanthocytes    |
      | Normochromic    |
      | Polychromasia   |
      | Hypochromia     |
      | Basophilic      |
      | Stripping       |
      | Toxic           |
      | Granulation     |
      | Absolute        |
      | Granulocyte     |
      | Count           |
      | Total           |
      | Protein         |
      | Albumin         |
      | Bilirubin       |
      | ALT             |
      | ALK             |
      | Phosphorus      |
      | Hemoglobin      |
      | AIC             |
      | Chol            |
      | LFT             |
      | Cholesterol     |
      | HDL             |
      | Triglyceride    |
      | O2HB%(SAT)      |


@US6176 @US6176_10 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Hypertension CBW has the correct Filters applied for Documents
      When the user navigates to the Hypertension CBW
      Then the Documents applet reports filtered "Filtered Hypertension"

@US6176 @US6176_10 @DE3444
Scenario: Verify the Hypertension CBW has the correct Filters applied for Documents
	When the user navigates to the Hypertension CBW
	# Then the Documents applet reports filtered "Filtered Hypertension"
	And the filters applied to Documents are
      | applied filters   |
      | Attending         |
      | Cardiology        |
      | Diabetic          |
      | Diabetology       |
      | Diagnostic        |
      | Dialysis          |
      | ECG               |
      | ED                |
      | Electrophysiology |
      | Emergency         |
      | Eye               |
      | Geriatric         |
      | Home              |
      | Based             |
      | Health            |
      | History           |
      | Physical          |
      | Internal          |
      | Medicine          |
      | Interventional    |
      | Long              |
      | Term              |
      | Care              |
      | Nephrology        |
      | Nuclear           |
      | Nurse             |
      | Nutrition         |
      | Patient           |
      | Aligned           |
      | Team              |
      | PCP               |
      | Pharmacy          |
      | Physician         |
      | Primary           |
      | Procedure         |
      | Progress          |
      | Radiology         |
      | Sleep             |
      | Smoke             |
      | Surgery           |
      | Vascular          |

@US6176 @US6176_11 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Hypertension CBW has the correct Filters applied for Appt/Visit
      When the user navigates to the Hypertension CBW
      Then the Appointment & Visit applet reports filtered "Filtered Hypertension"

@US6176 @US6176_11 @DE3444
Scenario: Verify the Hypertension CBW has the correct Filters applied for Appt/Visit
	When the user navigates to the Hypertension CBW
	# Then the Appointment & Visit applet reports filtered "Filtered Hypertension"
	And the filters applied to Appointment & Visit are
      | applied filters |
      |	Cardiology |
|	ED |
|	Emergency | 
|	Eye |
|	Mental |
|	Health |
|	Nephrology |
|	Nutrition |
|	Optometry |
|	PCP |
|	Primary |
|	Care |
|	Procedure |
|	Radiology |
|	Social  |
|	Vascular |
|	Work |


@US6176 @US6176_12 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Hypertension CBW has the correct Filters applied for Timeline
      When the user navigates to the Hypertension CBW
      Then the Timeline applet reports filtered "Filtered Hypertension"

@US6176 @US6176_12 @DE3444
Scenario: Verify the Hypertension CBW has the correct Filters applied for Timeline
      When the user navigates to the Hypertension CBW
      # Then the Timeline applet reports filtered "Filtered Hypertension"
      And the filters applied to Timeline are
      | applied filters |
      | Admission |
      | Appointment |
      | Consult |
      | Discharge |
      | Immunization |
      | Procedure |
      | Surgery |
      | Visit |


 @US6176 @US6176_13 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Hypertension CBW has the correct Filters applied for Meds
      When the user navigates to the Hypertension CBW
      Then the Meds Review applet reports filtered "Filtered Hypertension"

 @US6176 @US6176_13 @DE3444
Scenario: Verify the Hypertension CBW has the correct Filters applied for Meds
      When the user navigates to the Hypertension CBW
      # Then the Meds Review applet reports filtered "Filtered Hypertension"
      And the filters applied to Meds Review are
      | applied filters |
      | ACEBUTOLOL            |
      | ALISKIREN             |
      | CAPTOPRIL             |
      | AMILORIDE             |
      | AMLODIPINE            |
      | ATENOLOL              |
      | ATORVASTIN            |
      | AZILSARTAN            |
      | BENAZEPRIL            |
      | BENDROFLUMETHTHIAZIDE |
      | BETAXOLOL             |
      | BUMETANIDE            |
      | CANDESARTAN           |
      | CARVEDILOL            |
      | CHLORTHALIDONE        |
      | CLONIDINE             |
      | DILTIAZEM             |
      | DOXAZOSIN             |
      | ENALAPRIL             |
      | EPLERENONE            |
      | EPROSARTAN            |
      | ETHACRYNIC ACID       |
      | FELODIPINE            |
      | FENOLDOPAM            |
      | FOSINOPRIL            |
      | FUROSEMIDE GUANABENZ  |
      | GUANADREL             |
      | GUANETHIDINE          |
      | GUANFACINE            |
      | HCTZ                  |
      | HYDRALAZINE           |
      | HYDROCHLORIDE         |
      | HYDROCHLOROTHIAZIDE   |
      | INDAPAMIDE            |
      | IRBESARTAN            |
      | ISRADIPINE            |
      | LISINOPRIL            |
      | LOSARTAN              |
      | PENBUTOLOL            |
      | PERINDOPRIL           |
      | PINDOLOL              |
      | POLYTHIAZIDE          |
      | PRAZOSIN              |
      | PROPRANOLOL           |
      | QUINAPRIL             |
      | RAMIPRIL              |
      | RESERPINE             |
      | SPIRONOLACTONE        |
      | TELMISARTAN           |
      | TERAZOSIN             |
      | THIAZIDE              |
      | TRANDOLAPRIL          |
      | TRIAMTERENE           |
      | VALSARTAN             |
      | VERAPAMIL             |

# @US6176
# Scenario: User reports test results
#     Given user is done testing functionality
#     Then user reports results