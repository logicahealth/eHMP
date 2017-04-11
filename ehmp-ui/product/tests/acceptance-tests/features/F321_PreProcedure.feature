@F321 @US6178 @TC306  @US7259 @future @US146753
Feature: Condition-based Analysis Workspaces - Immutable Pre-procedure Workspace

# Filter tests based off of steps in eHMP_Regression Test Procedures for IOC Release 1.2.1_v1.0_08192015dia

Background:
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	And Default Screen is active

@US6178_navigation @TC306_7
Scenario: User can navigate to Pre-procedure CBW 
	When user selects Pre-procedure from Coversheet dropdown
	Then the Pre-procedure CBW is displayed

@US6178 @TC306_8
Scenario: Pre-procedure CBW  displays expected applets
	When the user navigates to the Pre-procedure CBW
	And the applets are displayed on the Pre-procedure CBW
      | applet                 |
      | PROBLEMS             |
      | VITALS                 |
      | ORDERS                 |
      | APPOINTMENTS & VISITS  |
      | TIMELINE               |
      | NUMERIC LAB RESULTS    |
      | DOCUMENTS              |
      | ALLERGIES              |
      | MEDICATIONS REVIEW     |
      
@US6178 @TC306_9 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Pre-procedure CBW has the correct Filters Label applied for Lab Results
      When the user navigates to the Pre-procedure CBW
      Then the Lab Results applet reports filtered "Filtered Preprocedure"

@US6178 @TC306_9 @DE3444
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Lab Results
	When the user navigates to the Pre-procedure CBW
	# Then the Lab Results applet reports filtered "Filtered Preprocedure"
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
# | Basco |    
	  |	Baso |     
	  |	Teardrop |     
	  |	Normocytic |     
#|	Microytosis |    
	  | Microcytosis | 
	  |	Macrocytosis |     
#|	Anisoytosis |    
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
      | Hemoglobin      |
      | A1C             |
      | INR             |
      | International   |
      |	Normalized    |
|	Ratio   |
|	Magnesium   |
|	MG   |
|	PHOS   |
|	Phosphorus   |
|	Protime   |
|	PT   |
|	PTT   |
|	TSH   |

@US6178 @TC306_10 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Documents
      When the user navigates to the Pre-procedure CBW
      Then the Documents applet reports filtered "Filtered Preprocedure"
 
@US6178 @TC306_10 @DE3444
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Documents
	When the user navigates to the Pre-procedure CBW
	# Then the Documents applet reports filtered "Filtered Preprocedure"
	And the filters applied to Documents are
      | applied filters  |
      | Anesthesiology   |
      | Cardiology       |
      | Endocrinology    |
      | ENT              |
      | Gastroenterology |
      | Nephrology       |
      | Neurological     |
      | Neurosurgery     |
      | Orthopedic       |
      | Otolaryngology   |
      | PCP              |
      | Plastic          |
      | Primary          |
      | Care             |
      | Pulmonary        |
      | Radiology        |
      | Surgery          |
      | Urology          |
      | Vascular         |

@US6178 @TC306_11 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Appointments/Visits
      When the user navigates to the Pre-procedure CBW
      Then the Appointment & Visit applet reports filtered "Filtered Preprocedure"

@US6178 @TC306_11 @DE3444
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Appointments/Visits
	When the user navigates to the Pre-procedure CBW
	# Then the Appointment & Visit applet reports filtered "Filtered Preprocedure"
	And the filters applied to Appointment & Visit are
      | applied filters  |
      | Anesthesiology   |
      | Cardiology       |
      | Dental           |
      | Endocrinology    |
      | Eyes             |
      | Nose             |
      | Throat           |
      | Gastroenterology |
      | General          |
      | Surgery          |
      | Nephrology       |
      | Neurosurgery     |
      | Orthopedic       |
      | PCP              |
      | Plastic          |
      | Primary          |
      | Care             |
      | Pulmonary        |
      | Renal            |
      | Thoracic         |
      | Urology          |
      | Vascular         |

@US6178 @TC306_12 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Timeline
      When the user navigates to the Pre-procedure CBW
      Then the Timeline applet reports filtered "Filtered Preprocedure"

@US6178 @TC306_12 @DE3444 @US13456
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Timeline
	When the user navigates to the Pre-procedure CBW
	#Then the Timeline applet reports filtered "Filtered Preprocedure"
    And the filters applied to Timeline are
      | applied filters |
      | Admission       |
      | Appointment     |
      | Consult         |
      | Discharge       |
      | Immunization    |
      | Procedure       |
      | Surgery         |
      | Visit           |


@US6178 @TC306_13 @DE2371 @DE3079 @DE3444 @future @US13456
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Meds
   When the user navigates to the Pre-procedure CBW
   Then the Meds Review applet reports filtered "Filtered Preprocedure"

@US6178 @TC306_13 @DE2371 @DE3444
Scenario: Verify the Pre-procedure CBW has the correct Filters applied for Meds
   When the user navigates to the Pre-procedure CBW
   # Then the Meds Review applet reports filtered "Filtered Preprocedure"
   # THE FOLLOWING FILTERS SPELLINGS WERE CORRECTED IN DE2371
   And the filters applied to Meds Review are
    | applied filters         |
    | COUMADIN                |
    | DARBEPOETIN ALFA        |
    And the filters applied to Meds Review are
       | applied filters        |
      | ACTOPLUS               |
      | ACTOS                  |
      | ADALAT                 |
      | ADVAIR                 |
      | ADVAIR                 |
      | ALBUTEROL              |
      | AMARYL                 |
      | AMIODARONE             |
      | AMLODIPINE             |
      | APIDRA                 |
      | APIXIBAN               |
      | ASA                    |
      | ASPART                 |
      | ATENOLOL               |
      | AVANDAMET              |
      | AVANDARYL              |
      | AVANDIA                |
      | BENICAR                |
      | BENZAPRIL              |
      | BENZAPRIL/AMLODIPINE   |
      | BENZAPRIL/HCL          |
      | BRILINTA               |
      | BUDESONIDE             |
      | BUDESONIDE/FORMOTEROL  |
      | BYDUREON               |
      | BYETTA                 |
      | BYSTOLIC               |
      | CALAN                  |
      | CANDESARTAN            |
      # | CANDESARTANHCT       |
      | CANDESARTAN/HCT        |
      | CAPTOPRIL              |
      | CELEBREX               |
      | CERVEDILOL             |
      | CLOPIDOGREL            |
      | COREG                  |
      | COZAAR                 |
      | CYCLOSET               |
      | CYMBALTA               |
      | DABIGITRAN             |
      | DEXAMETHASONE          |
      | DIABETA                |
      | DICLOFENAC             |
      | DIGOXIN                |
      | DILTIAZEM              |
      | DIOVAN                 |
      | DIPHENHYDRAMINE        |
      | DOBUTAMINE             |
      | DUETACT                |
      | EFFIENT                |
      | ELIQUIS                |
      | ENALAPRIL              |
      | ESMOLOL                |
      | ETODOLAC               |
      | EXUBERA                |
      | FENUGREEK              |
      | FLUTICASONE            |
      | FLUTICASONE/SALMETEROL |
      | FONDAPARINOX           |
      | FORMOTEROL             |
      | FORTAMET               |
      | GABAPENTIN             |
      | GLARGINE               |
      | GLIPIZIDE              |
      | GLUCAGON               |
      | GLUCOVANCE             |
      | GLUMETZA               |
      | GLYBURIDE              |
      | GLYNASE                |
      | HEPARIN                |
      | HUMALOG                |
      | HUMULIN                |
      | IBERSARTAN             |
      | IBUPROFEN              |
      | INDOMETHACIN           |
      | INSULIN                |
      | INVOKANA               |
      | IPTROPRIUM             |
      | IRBESARTAN             |
      | ISOPTIN                |
      | JANUMETXR              |
      | JANUVIA                |
      | JENTADUETO             |
      | KAZANO                 |
      | KOMBIGLYZEXR           |
      | LABETALOL              |
      | LANTUS                 |
      | LEVEMIR                |
      | LIDOCAINE              |
      | LISINOPRIL/HCT         |
      | LOPRESSOR              |
      | LOSARTAN               |
      | LOVENOX                |
      | LYRICA                 |
      | MEDICATIONS            |
      | MEDROL                 |
      | MELOXICAM              |
      | METAGLIP               |
      | METANX                 |
      | METFORMIN              |
      | METOPROLOL             |
      | MICRONASE              |
      | MILK THISTLE           |
      | MYCOFENOLATE           |
      | NADOLOL                |
      | NAPROXEN               |
      | NESINA                 |
      | NIFEDIPINE             |
      | NORVASC                |
      | NOVOLIN                |
      | NOVOLOG                |
      | NPH                    |
      | ONGLYZA                |
      | OSENI                  |
      | PIOGLITAZONE           |
      | PLAVIX                 |
      | PRANDIMET              |
      | PRANDIN                |
      | PRASUGREL              |
      | PRECOSE                |
      | PREDNISONE             |
      | PROCARDIA              |
      | PROPANOLOL             |
      | PROTAMINE/INSULIN      |
      | PULMICOR               |
      | RAMIPRIL               |
      | RIOMET                 |
      | RIVOROXABAN            |
      | SALMETEROL             |
      | SIMVASTATION           |
      | SIROLIMUS              |
      | SITAGLIPTIN            |
      | SOTALOL                |
      | SPIRIVA                |
      | STARLIX                |
      | SYMBICORT              |
      | SYMLIN                 |
      | TACROLIMUS             |
      | THIAZOLIDINEDIONES     |
      | TICAGRELOR             |
      | TICLID                 |
      | TICLOPIDINE            |
      | TIOTROPIUM             |
      | TOPROL                 |
      | TRADJENTA              |
      | TYLENOL                |
      | VALSARTAN              |
      | VERAPAMIL              |
      | VICTOZA                |
      | WARFARIN               |
      | XARELTO                |


