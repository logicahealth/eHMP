@F321 @US6172 @TC301 @regression @US7259 @test_no_logout @future @US146753
Feature: Condition-based Analysis Workspaces - Immutable Depression Workspace

Background:
#   Given user is testing functionality

# @US6172
# Scenario: User performs pre steps
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	And Default Screen is active

@US6172_navigation @TC301_7
Scenario: User can navigate to Depression CBW
	When user selects Depression from Coversheet dropdown
	Then the Depression CBW is displayed

@US6172 @TC301_7
Scenario: Depression CBW displays expected applets
	When the user navigates to the Depression CBW
	And the applets are displayed on the Depression CWB
      | applet                |
      | PROBLEMS              |
      | DOCUMENTS             |
      | ORDERS                |
      | APPOINTMENTS & VISITS |
      | TIMELINE              |
      | MEDICATIONS REVIEW    |
      | NUMERIC LAB RESULTS   |
      | CLINICAL REMINDERS    |

@US6172 @TC301_9 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Depression CBW has the correct Filters applied for Documents
      When the user navigates to the Depression CBW
      Then the Documents applet reports filtered "Filtered Depression"

@US6172 @TC301_9 @DE3444
Scenario: Verify the Depression CBW has the correct Filters applied for Documents
	When the user navigates to the Depression CBW
	# Then the Documents applet reports filtered "Filtered Depression"
	And the filters applied to Documents are
      | applied filters  |
      | ECG              |
      | Mental           |
      | Health           |
      | MHICM            |
      | Neuropsychiatric |
      | Neuropsychology  |
      | PHQ-9            |
      | Physical         |
      | Medicine         |
      | Rehabilitation   |
      | Primary          |
      | Care             |
      | PCP              |
      | Progress         |
      | Social           |
      | Work             |

@US6172 @TC301_10 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Depression CBW has the correct Filters applied for Lab Results
      When the user navigates to the Depression CBW
      Then the Lab Results applet reports filtered "Filtered Depression"

@US6172 @TC301_10 @DE3444
Scenario: Verify the Depression CBW has the correct Filters applied for Lab Results
	When the user navigates to the Depression CBW
	# Then the Lab Results applet reports filtered "Filtered Depression"
	And the filters applied to Lab Results are
      | applied filters |
      | BMP             |
      | Glucose         |
      | Urea            |
      | Nitrogen        |
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


  