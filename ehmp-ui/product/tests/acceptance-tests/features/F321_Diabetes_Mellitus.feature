@F321 @US6173 @TC302 @regression @US7259 @test_no_logout @future @US146753
Feature: Condition-based Analysis Workspaces - Immutable Diabetes Workspace

# Filter tests based off of steps in eHMP_Regression Test Procedures for IOC Release 1.2.1_v1.0_08192015dia

Background:
#   Given user is testing functionality

# @US6173 
# Scenario: User performs pre steps
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	And Default Screen is active

@US6173_navigation @TC302_7
Scenario: User can navigate to Diabetes Mellitus CBW 
	When user selects Diabetes Mellitus from Coversheet dropdown
	Then the Diabetes Mellitus CBW is displayed

@US6173 @TC302_8
Scenario: Diabetes Mellitus CBW  displays expected applets
	When the user navigates to the Diabetes Mellitus CBW
	And the applets are displayed on the Diabetes Mellitus CBW
      | applet                 |
      | PROBLEMS               |
      | STACKED GRAPHS         |
      | APPOINTMENTS & VISITS  |
      | CLINICAL REMINDERS     |
      | MEDICATIONS REVIEW     |
      | TIMELINE               |
      | ORDERS                 |
      | DOCUMENTS              |
      | VISTA HEALTH SUMMARIES |

@US6173 @TC302_13 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Documents
      When the user navigates to the Diabetes Mellitus CBW
      Then the Documents applet reports filtered "Filtered Diabetes"
		
@US6173 @TC302_13 @DE3444
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Documents
	When the user navigates to the Diabetes Mellitus CBW
	# Then the Documents applet reports filtered "Filtered Diabetes"
	And the filters applied to Documents are
      | applied filters |
      | Agent           |
      | Orange          |
      | Cardiology      |
      | Diabetic        |
      | Diabetology     |
      | Diagnostic      |
      | ED              |
      | Emergency       |
      | Endocrinology   |
      | Geriatric       |
      | Hyperlipidemia  |
      | Internal        |
      | Medicine        |
      | Laboratory      |
      | Medication      |
      | Nephrology      |
      | Nurse           |
      | Nutrition       |
      | Ophthalmology   |
      | Optometry       |
      | PCP             |
      | Physician       |
      | Podiatry        |
      | Primary         |
      | Care            |
      | Procedure       |
      | Progress        |
      | Radiology       |
      | Smoke           |
      | Social          |
      | Work            |
      | Wound           |
	

@US6173 @TC302_14 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Appt/Visit
      When the user navigates to the Diabetes Mellitus CBW
      Then the Appointment & Visit applet reports filtered "Filtered Diabetes"

@US6173 @TC302_14 @DE3444
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Appt/Visit
	When the user navigates to the Diabetes Mellitus CBW
	# Then the Appointment & Visit applet reports filtered "Filtered Diabetes"
	And the filters applied to Appointment & Visit are
      | applied filters |
      | Eye             |
      | Cardiology      |
      | ED              |
      | Emergency       |
      | Endocrinology   |
      | Internal        |
      | Medicine        |
      | Nephrology      |
      | Neurology       |
      | Nutrition       |
      | Ophthalmology   |
      | Optometry       |
      | Podiatry        |
      | Primary         |
      | Care            |
      | Wound           |


@US6173 @TC302_15 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Timeline
      When the user navigates to the Diabetes Mellitus CBW
      Then the Timeline applet reports filtered "Filtered Diabetes"

@US6173 @TC302_15 @DE3444
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Timeline
      When the user navigates to the Diabetes Mellitus CBW
      # Then the Timeline applet reports filtered "Filtered Diabetes"
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

@US6173 @TC302_16 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Meds
      When the user navigates to the Diabetes Mellitus CBW
      Then the Meds Review applet reports filtered "Filtered Diabetes"

@US6173 @TC302_16 @DE3444
Scenario: Verify the Diabetes Mellitus CBW has the correct Filters applied for Meds
      When the user navigates to the Diabetes Mellitus CBW
      # Then the Meds Review applet reports filtered "Filtered Diabetes"
      And the filters applied to Meds Review are
      | applied filters |
      | ACARBOSE        |
      | ALBIGLUTIDE     |
      | ALOGLIPTIN      |
      | CANAGLIFLOZIN   |
      | DAPAGLIFOZIN    |
      | DETEMIR         |
      | DULAGLUTIDE     |
      | EMPAGLIFLOZIN   |
      | EXENATIDE       |
      | GLARGINE        |
      | GLIMEPIRIDE     |
      | GLIPIZIDE       |
      | GLULISINE       |
      | GLYBURIDE       |
      | INSULIN         |
      | LINAGLIPTIN     |
      | LIRAGLUTIDE     |
      | METFORMIN       |
      | MIGLITOL        |
      | NATEGLINIDE     |
      | NPH             |
      | PIOGLITAZONE    |
      | PRAMLINTIDE     |
      | REGULAR         |
      | REPAGLINIDE     |
      | ROSIGLITAZONE   |
      | SAXAGLIPTIN     |
      | SIMVASTATIN     |
      | SITAGLIPTIN     |
      | TROGLITAZONE    |

# @US6173
# Scenario: User reports test results
#     Given user is done testing functionality
#     Then user reports results


	
	