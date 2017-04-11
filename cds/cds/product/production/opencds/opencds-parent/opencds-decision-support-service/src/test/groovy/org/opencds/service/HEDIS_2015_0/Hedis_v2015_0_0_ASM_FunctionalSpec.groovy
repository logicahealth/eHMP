package org.opencds.service.HEDIS_2015_0;

import java.util.Map;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil

import spock.lang.Specification
import spock.lang.Unroll

public class Hedis_v2015_0_0_ASM_FunctionalSpec extends Specification 
{
	// the tests and the specs below need to be enhanced to test exceptions
	
//missing DOB
	private static final String VMR000 = "src/test/resources/samples/hedis-all/SampleALL0001.xml" 
	private static final Map ASRT000 = ['C2613:C3424:C529:':'']
    private static final Map MEAS000 = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]

// Oral Medications
	
//Num Met 5 year old, asthma by ED visit two years ago, by ED visit one year ago, appropriate medication prescribed
    private static final String VMR001 = "src/test/resources/samples/hedis-asm/SampleASM0001.xml" 
	private static final Map ASRT001 = ['C2613: C3421: C3429':'[int]5#Year(s)']
    private static final Map MEAS001  = [C2613: [num: 1, denom: 1], C3360: [num: 1, denom: 1], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]

//Num Met 12 year old, asthma by Acute Inpatient (CPT: 99223) visit two years ago, by Acute Inpatient (CPT: 99223) visit one year ago, appropriate medication prescribed
    private static final String VMR002 = "src/test/resources/samples/hedis-asm/SampleASM0002.xml" 
	private static final Map ASRT002 = ['C2613: C3421: C3429':'[int]12#Year(s)']
	private static final Map MEAS002  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 1, denom: 1], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
	
//Num Met 41 year old, asthma by AsthmaFourOutpatientEncs (Outpatient (CPT: 99201))TwoDispEvents (ASM-C^leukotriene modifiers)
    private static final String VMR003 = "src/test/resources/samples/hedis-asm/SampleASM0003.xml"  
	private static final Map ASRT003 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]2']
	private static final Map MEAS003  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]

//Num Met 51 year old, asthma by AsthmaFourOutpatientEncs (Outpatient (CPT: 99201))TwoDispEvents (ASM-C^leukotriene modifiers) SecondYear one year ago, by acute inpatient visit two years ago, appropriate medication prescribed
    private static final String VMR004 = "src/test/resources/samples/hedis-asm/SampleASM0004.xml" 	
	private static final Map ASRT004 = ['C2613: C3421: C3429':'[int]51#Year(s)', 'C2613: C3421: C3530' : '[int]2']
	private static final Map MEAS004  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 1, denom: 1]]

//Num Met 41 year old, asthma by AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (only leucotrienes)
	private static final String VMR005 = "src/test/resources/samples/hedis-asm/SampleASM0005.xml" 
	private static final Map ASRT005 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]5']
	private static final Map MEAS005  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]

//Num Met 41 year old, asthma by AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (not only leucotrienes)
	private static final String VMR006 = "src/test/resources/samples/hedis-asm/SampleASM0006.xml" 
	private static final Map ASRT006 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]5']
	private static final Map MEAS006  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]
	
//Num Met 41 year old, AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (only leucotrienes + diagnosis of asthma)
	private static final String VMR007 = "src/test/resources/samples/hedis-asm/SampleASM0007.xml" 
	private static final Map ASRT007 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]5']
	private static final Map MEAS007  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]

//Num Met 41 year old, AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (only leucotrienes + diagnosis of asthma)
	private static final String VMR008 = "src/test/resources/samples/hedis-asm/SampleASM0008.xml" 
	private static final Map ASRT008 =['C2613: C3421: C3429':'[int]41#Year(s)',  'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]4']
	private static final Map MEAS008  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]

//Denom Not Met, 66 year old
	private static final String VMR009 = "src/test/resources/samples/hedis-asm/SampleASM0009.xml" 
	private static final Map ASRT009 = ['C2613: C3421: C3429':'[int]66#Year(s)']
	private static final Map MEAS009 = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]

//Num Met 41 year old, AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (only leucotrienes + diagnosis of asthma)
	private static final String VMR010 = "src/test/resources/samples/hedis-asm/SampleASM0010.xml" 
	private static final Map ASRT010 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]6']
	private static final Map MEAS010  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]
	
//Num NOT Met 41 year old, asthma by ED visit two years ago, by ED visit one year ago, inappropriate medication prescribed
    private static final String VMR011 = "src/test/resources/samples/hedis-asm/SampleASM0011.xml" 
	private static final Map ASRT011 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3530' : '[int]1']
    private static final Map MEAS011  = [C2613: [num: 0, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 1], C3363: [num: 0, denom: 0]]

//Num NOT Met 41 year old, asthma by Acute Inpatient (CPT: 99223) visit two years ago, by Acute Inpatient (CPT: 99223) visit one year ago, inappropriate medication prescribed
    private static final String VMR012 = "src/test/resources/samples/hedis-asm/SampleASM0012.xml" 
	private static final Map ASRT012 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3530' : '[int]1']
	private static final Map MEAS012  = [C2613: [num: 0, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 1], C3363: [num: 0, denom: 0]]
	
//Num Denom NOT Met 41 year old, asthma by AsthmaFourOutpatientEncs (Outpatient (CPT: 99201))OneDispEvents (ASM-C^leukotriene modifiers)
    private static final String VMR013 = "src/test/resources/samples/hedis-asm/SampleASM0013.xml" 
	private static final Map ASRT013 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]1']
	private static final Map MEAS013  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]

//Num NOT Met 41 year old, asthma by AsthmaFourOutpatientEncs (Outpatient (CPT: 99201))OneDispEvents (ASM-C^leukotriene modifiers) SecondYear one year ago, by acute inpatient visit two years ago, appropriate medication prescribed
//3 rx/meds of 10 days each on 1 date, each with distinct MedId, + 1 on 2nd date = 4 med events
    private static final String VMR014 = "src/test/resources/samples/hedis-asm/SampleASM0014.xml" 	
	private static final Map ASRT014 = ['C2613: C3421: C3429':'[int]39#Year(s)', 'C2613: C3421: C3530' : '[int]4']
	private static final Map MEAS014  = [C2613: [num: 0, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 1], C3363: [num: 0, denom: 0]]

//Num Denom NOT Met 41 year old, asthma by AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (only leucotrienes)
//3 rx/meds of 20 days diff dates, each with same MedId = 3 med events 1st year
	private static final String VMR015 = "src/test/resources/samples/hedis-asm/SampleASM0015.xml" 
	private static final Map ASRT015 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]3']
	private static final Map MEAS015  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]

//Num Denom NOT Met 41 year old, asthma by AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (not only leucotrienes)
//4 rx/meds on 3 diff dates, 2 same date same MedId only 10 days supply = 3 med events 1st year
	private static final String VMR016 = "src/test/resources/samples/hedis-asm/SampleASM0016.xml" 
	private static final Map ASRT016 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]4',  'C2613: C3421: C3530' : '[int]3']
	private static final Map MEAS016  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
	
//Num Denom NOT Met 41 year old, AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (only leucotrienes + diagnosis of asthma), 
//4 rx/meds on 3 diff dates, 2 same date same MedId only 10 days supply = 3 med events 1st year
	private static final String VMR017 = "src/test/resources/samples/hedis-asm/SampleASM0017.xml" 	
	private static final Map ASRT017 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]3', 'C2613: C3421: C3530' : '[int]5']
	private static final Map MEAS017  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]

//Num Met 41 year old, AsthmaFourDispEventsFirstYear, AsthmaFourDispEvents2ndYear (only leucotrienes + diagnosis of asthma), 
//3 rx/meds on 2 diff dates, 2 same date same MedId w 45 days supply = 4 med events 1st year
	private static final String VMR018 = "src/test/resources/samples/hedis-asm/SampleASM0018.xml" 
	private static final Map ASRT018 =['C2613: C3421: C3429':'[int]41#Year(s)',  'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]4']
	private static final Map MEAS018  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]

//Denom Not Met, 4 years old
	private static final String VMR019 = "src/test/resources/samples/hedis-asm/SampleASM0019.xml" 
	private static final Map ASRT019 = ['C2613: C3421: C3429':'[int]4#Year(s)']
	private static final Map MEAS019 = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]

//Num NOT Met,No enc, 41 year old, asthma by AsthmaFourDispEventsFirstYear, AsthmaFourDispEventsFirstYear (not only leucotrienes)  
	private static final String VMR020 = "src/test/resources/samples/hedis-asm/SampleASM0020.xml" 	
	private static final Map ASRT020 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3529' : '[int]4', 'C2613: C3421: C3530' : '[int]6']
	private static final Map MEAS020  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]
	
//Num Met 41 year old, asthma by AsthmaFourOutpatientEncs (Outpatient)OneDispEvents (ASM-C^leukotriene modifiers) SecondYear one year ago, by acute inpatient visit two years ago, inappropriate medication prescribed, 
//3 rx/meds of 20 days on 1 date, + 20 on 2nd date = 3 events
	private static final String VMR021 = "src/test/resources/samples/hedis-asm/SampleASM0021.xml" 	
	private static final Map ASRT021 = ['C2613: C3421: C3429':'[int]41#Year(s)', 'C2613: C3421: C3530' : '[int]3']
	private static final Map MEAS021  = [C2613: [num: 1, denom: 1], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 1, denom: 1], C3363: [num: 0, denom: 0]]

//inhalation
	
//Num Met 5 year old, asthma by ED visit two years ago, by ED visit one year ago, appropriate medication prescribed,
//3 rx/meds of 20 days on 1 date, + 20 on 2nd date = 3 events
	private static final String VMR022 = "src/test/resources/samples/hedis-asm/SampleASM0022.xml"
	private static final Map ASRT022 = ['C2613: C3421: C3429':'[int]5#Year(s)']
	private static final Map MEAS022  = [C2613: [num: 1, denom: 1], C3360: [num: 1, denom: 1], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
		
	
////Num Met 5 year old, asthma by ED visit two years ago, by ED visit one year ago, appropriate medication prescribed,
////3 rx/meds of 20 days on 1 date, + 20 on 2nd date = 3 events
//	private static final String VMR023 = "src/test/resources/samples/hedis-asm/SampleASM0022.xml"
//	private static final Map ASRT023 = ['C2613: C3421: C3429':'[int]5#Year(s)']
//	private static final Map MEAS023  = [C2613: [num: 1, denom: 1], C3360: [num: 1, denom: 1], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
			
	//numMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 3 controller same date = 25 days supply with 2 medid, 2 reliever diff dates
	private static final String VMR023 = "src/test/resources/samples/hedis-asm/SampleAMR0023.xml"
	private static final Map ASRT023 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS023  = [C2613: [num: 0, denom: 1], C3360: [num: 0, denom: 1], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
		
	//numMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 3 controller same date = 25 days supply same medid, 2 reliever same date same medId
	private static final String VMR024 = "src/test/resources/samples/hedis-asm/SampleAMR0024.xml"
	private static final Map ASRT024 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS024  = [C2613: [num: 0, denom: 1], C3360: [num: 0, denom: 1], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for emphysema
	private static final String VMR025 = "src/test/resources/samples/hedis-asm/SampleAMR0025.xml"
	private static final Map ASRT025 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS025  = [C2613: [num: 0, denom: 1], C3360: [num: 0, denom: 1], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for "Other" emphysema
	private static final String VMR026 = "src/test/resources/samples/hedis-asm/SampleAMR0026.xml"
	private static final Map ASRT026 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS026  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for obstructive chronic bronchitis
	private static final String VMR027 = "src/test/resources/samples/hedis-asm/SampleAMR0027.xml"
	private static final Map ASRT027 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS027  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for COPD due to fumes or vapors
	private static final String VMR028 = "src/test/resources/samples/hedis-asm/SampleAMR0028.xml"
	private static final Map ASRT028 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS028  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for COPD
	private static final String VMR029 = "src/test/resources/samples/hedis-asm/SampleAMR0029.xml"
	private static final Map ASRT029 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS029  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for no asthma medication
	private static final String VMR030 = "src/test/resources/samples/hedis-asm/SampleAMR0030.xml"
	private static final Map ASRT030 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS030  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
			
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for acute respiratory failure
	private static final String VMR031 = "src/test/resources/samples/hedis-asm/SampleAMR0031.xml"
	private static final Map ASRT031 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS031  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
		
	//numNotMet Age 05-11, asthma by ED visit two years ago, by ED visit one year ago, 1 controller, 1 reliever, exclusion for cystic fibrosis
	private static final String VMR032 = "src/test/resources/samples/hedis-asm/SampleAMR0032.xml"
	private static final Map ASRT032 = ['C2613: C3421: C3429':'[int]7#Year(s)']
	private static final Map MEAS032  = [C2613: [num: 0, denom: 0], C3360: [num: 0, denom: 0], C3361: [num: 0, denom: 0], C3362: [num: 0, denom: 0], C3363: [num: 0, denom: 0]]
			

/*
Concepts used:
INPUT
"	1 -> year(s)"
"	5 -> day(s)"
"	C1938 -> Emphysema"
"	C2361 -> Injection"
"	C2511 -> HEDIS 2014"
"	C2770 -> Patient Age GE 5 and LT 12 Years"
"	C2771 -> Patient Age GE 12 and LT 19 Years"
"	C2772 -> Patient Age GE 19 and LT 51 Years"
"	C2773 -> Patient Age GE 51 and LT 65 Years"
"	C2787 -> HEDIS-Other Emphysema"
"	C2788 -> Bronchitis"
"	C2789 -> Chronic Respiratory Conditions due to Fumes or Vapors"
"	C2790 -> Cystic Fibrosis"
"	C284 -> Respiratory Failure"
"	C2845 -> HEDIS-ASM Table C Asthma Medications"
"	C2846 -> HEDIS-ASM Table D Asthma Controller Medications"
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
"	C2613 -> QM HEDIS-ASM Asthma Pharmacotherapy"
"	C2770 -> Patient Age GE 5 and LT 12 Years"
"	C2771 -> Patient Age GE 12 and LT 19 Years"
"	C2772 -> Patient Age GE 19 and LT 51 Years"
"	C2773 -> Patient Age GE 51 and LT 65 Years"
"	C2788 -> Bronchitis"
"	C2789 -> Chronic Respiratory Conditions due to Fumes or Vapors"
"	C2790 -> Cystic Fibrosis"
"	C284 -> Respiratory Failure"
"	C3265 -> Named Dates Inserted"
"	C3268 -> Patient Age GE 5 and LT 65 Years"
"	C3269 -> Asthma Criterion Met"
"	C3270 -> Asthma Criterion Met"
"	C3271 -> Asthma Criterion Met"
"	C3272 -> Asthma Criterion Met"
"	C3280 -> HEDIS-AMR Table A Asthma Controller Medications"
"	C3360 -> QM HEDIS-ASM Asthma Pharmacotherapy (Age 05-11)"
"	C3361 -> QM HEDIS-ASM Asthma Pharmacotherapy (Age 12-18)"
"	C3362 -> QM HEDIS-ASM Asthma Pharmacotherapy (Age 19-50)"
"	C3363 -> QM HEDIS-ASM Asthma Pharmacotherapy (Age 51-64)"
"	C3492 -> "
"	C3493 -> "
"	C3529 -> HEDIS-ASM Table C Asthma Medications, Units, 2 Years Ago
"	C3530 -> HEDIS-ASM Table C Asthma Medications, Units, 1 Year Ago
"	C42 -> Chronic Obstructive Pulmonary Disease (COPD)"
"	C529 -> Rejected for Missing or Bad Data"
"	C539 -> Numerator Criteria Met"
"	C54 -> Denominator Criteria Met"
"	C544 -> Denominator Exclusions Met"
"	C545 -> Denominator Inclusions Met"
"	C569 -> Missing Data for Date of Birth"

*/
	
	@Unroll
	def "test HEDIS ASM v2015.0.0"() 
	{
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'HEDIS_ASM', version: '2015.0.0'],
			specifiedTime: '2012-02-01'
		]
		def responsePayload = OpencdsClient.sendEvaluateAtSpecifiedTimeMessage(params, input)
//		println responsePayload

		then:
		def data = new XmlSlurper().parseText(responsePayload)
		def results = VMRUtil.getResults(data, '\\|')

		results.assertions.each {entry ->
//			System.err.println "${entry.key} -> ${entry.value}"
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

		where:
		vmr | assertions | measuresList
				
		VMR000 | ASRT000 | MEAS000 
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
