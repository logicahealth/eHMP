package org.opencds.service.HEDIS_2015_0;

import java.util.Map;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil

import spock.lang.Specification
import spock.lang.Unroll

public class Hedis_v2015_0_0_AMR_FunctionalSpec extends Specification 
{
	private static Map concepts = [C3421:'Denom', C3422: 'Num', C3423: 'Denom Excl',
	C1938 : 'Emphysema',
	C2615 : 'QM HEDIS-AMR Asthma Medication Ratio',
	C2770 : 'Patient Age GE 5 and LT 12 Years',
	C2771 : 'Patient Age GE 12 and LT 19 Years',
	C2772 : 'Patient Age GE 19 and LT 51 Years',
	C2773 : 'Patient Age GE 51 and LT 65 Years',
	C2787 : 'HEDIS-Other Emphysema',
	C2788 : 'Bronchitis, Obstructive Chronic',
	C2789 : 'Chronic Respiratory Conditions due to Fumes or Vapors',
	C2790 : 'Cystic Fibrosis',
	C284 : 'Respiratory Failure, Acute',
	C3265 : 'Named Dates Inserted',
	C3268 : 'Patient Age GE 5 and LT 65 Years',
	C3269 : 'Asthma Criterion Met, One Year Ago',
	C3270 : 'Asthma Criterion Met, Two Years Ago',
	C3271 : 'Asthma Criterion Met, Four Medications, Two Years Ago',
	C3272 : 'Asthma Criterion Met, Four Medications, One Year Ago',
	C3280 : 'HEDIS-AMR Table A Asthma Controller Medications',
	C3281 : 'HEDIS-AMR Table A Asthma Reliever Medications',
	C3374 : 'QM HEDIS-AMR Asthma Medication Ratio (Age 05-11)',
	C3375 : 'QM HEDIS-AMR Asthma Medication Ratio (Age 12-18)',
	C3376 : 'QM HEDIS-AMR Asthma Medication Ratio (Age 19-50)',
	C3377 : 'QM HEDIS-AMR Asthma Medication Ratio (Age 51-64)',
	C3385 : 'QM HEDIS-AMM Antidepressant Med Mgt',
	C3429 : 'Age',
	C3492 : 'HEDIS-Asthma, ED, Enc, 2 Years Ago',
	C3493 : 'HEDIS-Asthma, ED, Enc, 1 Year Ago',
	C3494 : 'HEDIS-Asthma, Acute Inpatient, Enc, 2 Years Ago',
	C3495 : 'HEDIS-Asthma, Acute Inpatient, Enc, 1 Year Ago',
	C3496 : 'HEDIS-Asthma, Outpatient, Enc, 1 Year Ago',
	C3497 : 'HEDIS-Asthma, Outpatient, Enc, 2 Years Ago',
	C3498 : 'HEDIS-Asthma, Observation, Enc, 2 Years Ago',
	C3499 : 'HEDIS-Asthma, Observation, Enc, 1 Year Ago',
	C3500 : 'HEDIS-Asthma, 2 Years Ago',
	C3501 : 'HEDIS-Asthma, 1 Year Ago',
	C3502 : 'HEDIS-ASM Table C Subset - Non-Leukotriene Modifiers, 2 Years Ago',
	C3507 : 'HEDIS-AMR Table A Asthma Controller Medications, Units',
	C3510 : 'HEDIS-AMR Table A Asthma Reliever Medications, Units',
	C3529 : 'HEDIS-ASM Table C Asthma Medications, Units, 2 Years Ago',
	C3530 : 'HEDIS-ASM Table C Asthma Medications, Units, 1 Year Ago',
	C3531 : 'HEDIS-ASM Table C Asthma Medications, 2 Years Ago',
	C3532 : 'HEDIS-ASM Table C Asthma Medications, 1 Year Ago',
	C42 : 'Chronic Obstructive Pulmonary Disease (COPD)',
	C529 : 'Rejected for Missing or Bad Data',
	C539 : 'Numerator Criteria Met',
	C54 : 'Denominator Criteria Met',
	C544 : 'Denominator Exclusions Met',
	C545 : 'Denominator Inclusions Met',
	C569 : 'Missing Data for Date of Birth'
]
		// need to add tests for exceptions
	
	//missing DOB
	private static final String EMPTY0001 = "src/test/resources/samples/hedis-all/SampleALL0001.xml" 
	private static final Map ASSERTIONS_EMPTY0001 = [reject:'']
    private static final Map MEASURES_EMPTY0001 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//numMetAge 19-50, asthma by ED visit two years ago, by ED visit one year ago, 2 controller, 1 reliever
    private static final String VMR001 = "src/test/resources/samples/hedis-amr/SampleAMR0001.xml" 
	private static final Map ASRT001 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C539:'',C54:'', C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
    private static final Map MEAS001 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]

	//numMet Age 19-50, 4 controllers, 3 reliever
    private static final String VMR002 = "src/test/resources/samples/hedis-amr/SampleAMR0002.xml" 
	private static final Map ASRT002 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]4', 'C3385: C3422: C3510' : '[int]3']
	private static final Map MEAS002 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]
	
	//denom not met, Age 19-50
    private static final String VMR003 = "src/test/resources/samples/hedis-amr/SampleAMR0003.xml" 
	private static final Map ASRT003 = [C2772:'',C3265:'',C3268:'',C3269:'']
	private static final Map MEAS003 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]

	//numMet Age 19-50, 5 controllers, 4 reliever
    private static final String VMR004 = "src/test/resources/samples/hedis-amr/SampleAMR0004.xml" 
	private static final Map ASRT004 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C3272:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]5', 'C3385: C3422: C3510' : '[int]4']
	private static final Map MEAS004 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]
	
	//numMet Age 19-50, 5 controllers, 0 reliever
	private static final String VMR005 = "src/test/resources/samples/hedis-amr/SampleAMR0005.xml" 
	private static final Map ASRT005 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C3271:'',C3272:'', 'C3385: C3422: C3507' : '[int]5', 'C3385: C3422: C3510' : '[int]0']
	private static final Map MEAS005 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]

	//denom not met, Age 19-50, 5 controllers, 1 reliever
	private static final String VMR006 = "src/test/resources/samples/hedis-amr/SampleAMR0006.xml" 
	private static final Map ASRT006 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C3271:'',C3272:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]5', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS006 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]
	
	//numMet Age 19-50, 6 controllers, 1 reliever
	private static final String VMR007 = "src/test/resources/samples/hedis-amr/SampleAMR0007.xml" 
	private static final Map ASRT007 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C3271:'',C3272:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]6', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS007 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]

	//numMet Age 19-50
	private static final String VMR008 = "src/test/resources/samples/hedis-amr/SampleAMR0008.xml" 
	private static final Map ASRT008 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C3271:'',C3272:'',C539:'',C54:'',C545:'']
	private static final Map MEAS008 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]
	
	//denom not met
	private static final String VMR009 = "src/test/resources/samples/hedis-amr/SampleAMR0009.xml" 
	private static final Map ASRT009 = ['A.01':'']
	private static final Map MEAS009 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]

	//numMet Age 19-50, 7 controllers, 1 reliever
	private static final String VMR010 = "src/test/resources/samples/hedis-amr/SampleAMR0010.xml" 
	private static final Map ASRT010 = [C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C3271:'',C3272:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]7', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS010 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0],  C3376: [num: 1, denom: 1], C3377: [num: 0, denom: 0]]
	
	//denom not met, Age 19-50
	private static final String VMR011 = "src/test/resources/samples/hedis-amr/SampleAMR0011.xml" 
	private static final Map ASRT011 = [C1938:'',C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C544:'',C545:'']
	private static final Map MEAS011 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//denom not met, Age 19-50
	private static final String VMR012 = "src/test/resources/samples/hedis-amr/SampleAMR0012.xml" 
	private static final Map ASRT012 = [C1938:'',C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C544:'',C545:'']
	private static final Map MEAS012 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//denom not met, Age 19-50
	private static final String VMR013 = "src/test/resources/samples/hedis-amr/SampleAMR0013.xml" 
	private static final Map ASRT013 = [C2789:'',C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C544:'',C545:'']
	private static final Map MEAS013 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//denom not met, Age 19-50
	private static final String VMR014 = "src/test/resources/samples/hedis-amr/SampleAMR0014.xml" 
	private static final Map ASRT014 = [C42:'',C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C544:'',C545:'']
	private static final Map MEAS014 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//denom not met, Age 19-50
	private static final String VMR015 = "src/test/resources/samples/hedis-amr/SampleAMR0015.xml" 
	private static final Map ASRT015 = [C2788:'',C2772:'',C3265:'',C3268:'',C3269:'',C3270:'',C544:'',C545:'']
	private static final Map MEAS015 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//numMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 2 controller, 1 reliever
	private static final String VMR016 = "src/test/resources/samples/hedis-amr/SampleAMR0016.xml" 
	private static final Map ASRT016 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS016 = [C2615: [num: 1, denom: 1], C3374: [num: 1, denom: 1], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//numMet Age 12-18, asthma by ED visit two years ago, by ED visit one year ago, 2 controller, 1 reliever
	private static final String VMR017 = "src/test/resources/samples/hedis-amr/SampleAMR0017.xml" 
	private static final Map ASRT017 = [C2771:'',C3265:'',C3268:'',C3269:'',C3270:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS017 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 1, denom: 1], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]

	//numMet Age 51-64, asthma by ED visit two years ago, by ED visit one year ago, 2 controller, 1 reliever
	private static final String VMR018 = "src/test/resources/samples/hedis-amr/SampleAMR0018.xml" 
	private static final Map ASRT018 = [C2773:'',C3265:'',C3268:'',C3269:'',C3270:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS018 = [C2615: [num: 1, denom: 1], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 1, denom: 1]]

	//numMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever
	private static final String VMR019 = "src/test/resources/samples/hedis-amr/SampleAMR0019.xml"
	private static final Map ASRT019 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C539:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS019 = [C2615: [num: 1, denom: 1], C3374: [num: 1, denom: 1], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	private static final String VMR020 = "src/test/resources/samples/hedis-amr/SampleAMR0020.xml"
	private static final Map ASRT020 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]2']
	private static final Map MEAS020 = [C2615: [num: 0, denom: 1], C3374: [num: 0, denom: 1], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 3 controller same date = 25 days supply same medid, 2 reliever diff dates
	private static final String VMR021 = "src/test/resources/samples/hedis-amr/SampleAMR0021.xml"
	private static final Map ASRT021 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]2']
	private static final Map MEAS021 = [C2615: [num: 0, denom: 1], C3374: [num: 0, denom: 1], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//numMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 3 controller same date = 60 days supply same medid, 2 reliever diff dates
	private static final String VMR022 = "src/test/resources/samples/hedis-amr/SampleAMR0022.xml"
	private static final Map ASRT022 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]2']
	private static final Map MEAS022 = [C2615: [num: 1, denom: 1], C3374: [num: 1, denom: 1], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
	
	//numMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 3 controller same date = 25 days supply with 2 medid, 2 reliever diff dates
	private static final String VMR023 = "src/test/resources/samples/hedis-amr/SampleAMR0023.xml"
	private static final Map ASRT023 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]2']
	private static final Map MEAS023 = [C2615: [num: 1, denom: 1], C3374: [num: 1, denom: 1], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
		
	//numMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 3 controller same date = 25 days supply same medid, 2 reliever same date same medId
	private static final String VMR024 = "src/test/resources/samples/hedis-amr/SampleAMR0024.xml"
	private static final Map ASRT024 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS024 = [C2615: [num: 1, denom: 1], C3374: [num: 1, denom: 1], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for emphysema
	private static final String VMR025 = "src/test/resources/samples/hedis-amr/SampleAMR0025.xml"
	private static final Map ASRT025 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS025 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for "Other" emphysema
	private static final String VMR026 = "src/test/resources/samples/hedis-amr/SampleAMR0026.xml"
	private static final Map ASRT026 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS026 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for obstructive chronic bronchitis
	private static final String VMR027 = "src/test/resources/samples/hedis-amr/SampleAMR0027.xml"
	private static final Map ASRT027 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS027 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for COPD due to fumes or vapors
	private static final String VMR028 = "src/test/resources/samples/hedis-amr/SampleAMR0028.xml"
	private static final Map ASRT028 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS028 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for COPD
	private static final String VMR029 = "src/test/resources/samples/hedis-amr/SampleAMR0029.xml"
	private static final Map ASRT029 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS029 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for no asthma medication
	private static final String VMR030 = "src/test/resources/samples/hedis-amr/SampleAMR0030.xml"
	private static final Map ASRT030 = [C2770:'',C3265:'',C3268:'',C3270:'']
	private static final Map MEAS030 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for acute respiratory failure
	private static final String VMR031 = "src/test/resources/samples/hedis-amr/SampleAMR0031.xml"
	private static final Map ASRT031 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS031 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for cystic fibrosis
	private static final String VMR032 = "src/test/resources/samples/hedis-amr/SampleAMR0032.xml"
	private static final Map ASRT032 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'', 'C3385: C3422: C3507' : '[int]1', 'C3385: C3422: C3510' : '[int]1']
	private static final Map MEAS032 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
			
	//	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	//	private static final String VMR03 = "src/test/resources/samples/hedis-amr/SampleAMR003.xml"
	//	private static final Map ASRT03 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	//	private static final Map MEAS03 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
				
	//	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	//	private static final String VMR03 = "src/test/resources/samples/hedis-amr/SampleAMR003.xml"
	//	private static final Map ASRT03 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	//	private static final Map MEAS03 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
				
	//	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	//	private static final String VMR03 = "src/test/resources/samples/hedis-amr/SampleAMR003.xml"
	//	private static final Map ASRT03 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	//	private static final Map MEAS03 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
				
	//	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	//	private static final String VMR03 = "src/test/resources/samples/hedis-amr/SampleAMR003.xml"
	//	private static final Map ASRT03 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	//	private static final Map MEAS03 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
				
	//	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	//	private static final String VMR03 = "src/test/resources/samples/hedis-amr/SampleAMR003.xml"
	//	private static final Map ASRT03 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	//	private static final Map MEAS03 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
				
	//	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	//	private static final String VMR03 = "src/test/resources/samples/hedis-amr/SampleAMR003.xml"
	//	private static final Map ASRT03 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	//	private static final Map MEAS03 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
				
	//	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 2 reliever
	//	private static final String VMR03 = "src/test/resources/samples/hedis-amr/SampleAMR003.xml"
	//	private static final Map ASRT03 = [C2770:'',C3265:'',C3268:'',C3269:'',C3270:'',C54:'',C545:'', 'C3385: C3422: C3507' : '[int]2', 'C3385: C3422: C3510' : '[int]1']
	//	private static final Map MEAS03 = [C2615: [num: 0, denom: 0], C3374: [num: 0, denom: 0], C3375: [num: 0, denom: 0], C3376: [num: 0, denom: 0], C3377: [num: 0, denom: 0]]
				

/*
Concepts used:
INPUT
"	1 -> year(s)"
"	5 -> day(s)"
"	C1938 -> Emphysema"
"	C2361 -> Injection"
"	C2511 -> HEDIS 2014"
"	C2787 -> HEDIS-Other Emphysema"
"	C2788 -> Bronchitis"
"	C2789 -> Chronic Respiratory Conditions due to Fumes or Vapors"
"	C2790 -> Cystic Fibrosis"
"	C284 -> Respiratory Failure"
"	C2844 -> HEDIS-AMR Table A Asthma Controller and Reliever Medications"
"	C2845 -> HEDIS-ASM Table C Asthma Medications"
"	C2964 -> HEDIS-Outpatient"
"	C2968 -> HEDIS-ED"
"	C2971 -> HEDIS-Acute Inpatient"
"	C3022 -> HEDIS-Observation"
"	C3067 -> HEDIS-Acute Respiratory Failure"
"	C3071 -> HEDIS-Asthma"
"	C3089 -> HEDIS-Chronic Respiratory Conditions Due To Fumes/Vapors"
"	C3094 -> HEDIS-COPD"
"	C3095 -> HEDIS-Cystic Fibrosis"
"	C3111 -> HEDIS-Emphysema"
"	C3139 -> HEDIS-Obstructive Chronic Bronchitis"
"	C3256 -> HEDIS-ASM Table C Subset - Non-Leukotriene Modifiers"
"	C3265 -> Named Dates Inserted"
"	C3268 -> Patient Age GE 5 and LT 65 Years"
"	C3269 -> Asthma Criterion Met"
"	C3270 -> Asthma Criterion Met"
"	C3271 -> Asthma Criterion Met"
"	C3272 -> Asthma Criterion Met"
"	C3280 -> HEDIS-AMR Table A Asthma Controller Medications"
"	C3281 -> HEDIS-AMR Table A Asthma Reliever Medications"
"	C36 -> OpenCDS"
"	C405 -> Part of"
"	C416 -> Primary"
"	C42 -> Chronic Obstructive Pulmonary Disease (COPD)"
"	C54 -> Denominator Criteria Met"
"	C544 -> Denominator Exclusions Met"
"	C545 -> Denominator Inclusions Met"
"	C597 -> Oral"
"	C598 -> Inhalation"
OUTPUT
"	1 -> year(s)"
"	C1938 -> Emphysema"
"	C2615 -> QM HEDIS-AMR Asthma Medication Ratio"
"	C2770 -> Patient Age GE 5 and LT 12 Years"
"	C2771 -> Patient Age GE 12 and LT 19 Years"
"	C2772 -> Patient Age GE 19 and LT 51 Years"
"	C2773 -> Patient Age GE 51 and LT 65 Years"
"	C2788 -> Bronchitis"
"	C2789 -> Chronic Respiratory Conditions due to Fumes or Vapors"
"	C2790 -> Cystic Fibrosis"
"	C284 -> Respiratory Failure"
"	C2844 -> HEDIS-AMR Table A Asthma Controller and Reliever Medications"
"	C3265 -> Named Dates Inserted"
"	C3268 -> Patient Age GE 5 and LT 65 Years"
"	C3269 -> Asthma Criterion Met"
"	C3270 -> Asthma Criterion Met"
"	C3271 -> Asthma Criterion Met"
"	C3272 -> Asthma Criterion Met"
"	C3374 -> QM HEDIS-AMR Asthma Medication Ratio (Age 05-11)"
"	C3375 -> QM HEDIS-AMR Asthma Medication Ratio (Age 12-18)"
"	C3376 -> QM HEDIS-AMR Asthma Medication Ratio (Age 19-50)"
"	C3377 -> QM HEDIS-AMR Asthma Medication Ratio (Age 51-64)"
"	C42 -> Chronic Obstructive Pulmonary Disease (COPD)"
"	C529 -> Rejected for Missing or Bad Data"
"	C539 -> Numerator Criteria Met"
"	C54 -> Denominator Criteria Met"
"	C544 -> Denominator Exclusions Met"
"	C545 -> Denominator Inclusions Met"
"	C569 -> Missing Data for Date of Birth"

*/
	
	@Unroll
	def "test HEDIS AMR v2015.0.0"() 
	{
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'HEDIS_AMR', version: '2015.0.0'],
			specifiedTime: '2012-01-01'
		]
		def responsePayload = OpencdsClient.sendEvaluateAtSpecifiedTimeMessage(params, input)
		println ' '
		println 'vMR: ' + vmr
		
		println 'Response Payload: ' + responsePayload

		then:
		def data = new XmlSlurper().parseText(responsePayload)
		def results = VMRUtil.getResults(data, '\\|')

		results.assertions.each {entry ->
			String[] list = entry.key?.split(': ')
			String name = ''
			if (list.size() == 3) {
				name = concepts.get(list[1]) + ': ' + concepts.get(list[2]) 
				System.err.println "${entry.key}  |    $name     ->     ${entry.value}"
			}
			else {System.err.println "${entry.key}  ->  ${entry.value}"}
		}
		if (!assertions) {
			assert assertions == results.assertions
		} else {
		assertions.each {entry ->
			assert results.assertions.containsKey(entry.key);
			if (entry?.value) {
				assert results.assertions.get(entry.key) == entry.value
			}
		}
		}
		
        measuresList.each {entry ->
        assert results.measuresList.get(entry.key).num == entry.value.num
        assert results.measuresList.get(entry.key).denom == entry.value.denom				
        }
		println ' '
		results.measuresList.each {entry ->
			System.err.println 'Focus: '+ concepts.get(entry.key) +" (${entry.key}) ->  ${entry.value.denom} ${entry.value.num}"
		}
	
			where:
			vmr | assertions | measuresList
			
		EMPTY0001 | ASSERTIONS_EMPTY0001| MEASURES_EMPTY0001 
		VMR001 | ASRT001 | MEAS001
		VMR002 | ASRT002 | MEAS002
		VMR003 | ASRT003 | MEAS003
		VMR004 | ASRT004 | MEAS004
		VMR005 | ASRT005 | MEAS005
		VMR006 | ASRT006 | MEAS006
		VMR007 | ASRT007 | MEAS007
		VMR008 | ASRT008 | MEAS008
		VMR009 | ASRT009 | MEAS009
		VMR010 | ASRT010 | MEAS010
		VMR011 | ASRT011 | MEAS011
		VMR012 | ASRT012 | MEAS012
		VMR013 | ASRT013 | MEAS013
		VMR014 | ASRT014 | MEAS014
		VMR015 | ASRT015 | MEAS015
		VMR016 | ASRT016 | MEAS016
		VMR017 | ASRT017 | MEAS017
		VMR018 | ASRT018 | MEAS018
		VMR019 | ASRT019 | MEAS019
		VMR020 | ASRT020 | MEAS020
		VMR021 | ASRT021 | MEAS021
		VMR022 | ASRT022 | MEAS022
		VMR023 | ASRT023 | MEAS023
		VMR024 | ASRT024 | MEAS024
		VMR025 | ASRT025 | MEAS025
		VMR026 | ASRT026 | MEAS026
		VMR027 | ASRT027 | MEAS027
		VMR028 | ASRT028 | MEAS028
		VMR029 | ASRT029 | MEAS029
		VMR030 | ASRT030 | MEAS030
		VMR031 | ASRT031 | MEAS031
		VMR032 | ASRT032 | MEAS032
//		VMR033 | ASRT033 | MEAS033
//		VMR034 | ASRT034 | MEAS034
//		VMR035 | ASRT035 | MEAS035
//		VMR036 | ASRT036 | MEAS036
//		VMR037 | ASRT037 | MEAS037
//		VMR038 | ASRT038 | MEAS038
//		VMR039 | ASRT039 | MEAS039
	}
}
