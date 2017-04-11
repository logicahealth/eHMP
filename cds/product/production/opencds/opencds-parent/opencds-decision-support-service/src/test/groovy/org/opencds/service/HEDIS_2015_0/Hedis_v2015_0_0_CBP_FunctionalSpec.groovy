package org.opencds.service.HEDIS_2015_0;

import java.util.Map;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil

import spock.lang.Specification
import spock.lang.Unroll

public class Hedis_v2015_0_0_CBP_FunctionalSpec extends Specification 
{
	private static Map concepts = [C3421:'Denom', C3422: 'Num', C3423: 'Denom Excl',  
               C1945 : 'Hypertension, Essential',
               C2078 : 'Ovaries, Polycystic',
               C2530 : 'Blood Pressure Control LT 140 - 90 mm Hg',
               C2545 : 'Heart Failure, Congestive',
               C2561 : 'Blood Pressure, Diastolic, 80-89 mm Hg',
               C2562 : 'Blood Pressure, Diastolic, LT 80 mm Hg',
               C2565 : 'Blood Pressure, Systolic, LT 140 mm Hg',
               C2579 : 'Diabetes by Claims Data',
               C2607 : 'Diabetes by Pharmacy Data',
               C2617 : 'QM HEDIS-CBP Controlling High Blood Pressure',
               C2703 : 'Blood Pressure Poor Control',
               C2899 : 'HEDIS-Pregnancy Diagnosis',
               C3020 : 'HEDIS-Nonacute Inpatient',
               C3265 : 'Named Dates Inserted',
               C3429 : 'Age',
               C3458 : 'Outpatient Enc with Diabetes Dx',
               C3459 : 'Nonacute Enc with Diabetes Dx',
               C3460 : 'Observation Enc with Diabetes Dx',
               C3461 : 'ED Enc with Diabetes Dx',
               C3462 : 'Acute Inpatient Enc with Diabetes Dx',
               C3463 : 'Outpatient Enc with CDC Table A Med',
               C3464 : 'ED Enc with CDC Table A Med',
               C3465 : 'Diabetes Exclusions Dx',
               C3580 : 'HEDIS-ESRD Proc',
               C3581 : 'HEDIS-ESRD Dx',
               C3582 : 'HEDIS-Kidney Transplant Proc',
               C3583 : 'HEDIS-Kidney Transplant Dx',
               C3584 : 'HEDIS-ESRD Dialysis POS Obs',
               C529 : 'Rejected for Missing or Bad Data',
               C539 : 'Numerator Criteria Met',
               C54 : 'Denominator Criteria Met',
               C544 : 'Denominator Exclusions Met',
               C545 : 'Denominator Inclusions Met',
               C569 : 'Missing Data for Date of Birth'
			   ]
	
	private static final String EMPTY0001 = "src/test/resources/samples/hedis-all/SampleALL0001.xml" 	//bad data, missing DOB
	private static final Map ASSERTIONS_EMPTY0001 = [C529:'', C569 : '']
    private static final Map MEASURES_EMPTY0001 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0001 = "src/test/resources/samples/hedis-cbp/CDC0001.xml" 			//Denom not met: too old, acute inpatient encounter : CPT=99223 from 0-2 years ago w/o EncDx diabetes ICD9CM: 250 and 85 years old, female (denomMet)
	private static final Map ASSERTIONS_CDC0001 = [C3265 : '']
    private static final Map MEASURES_CDC0001 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0002 = "src/test/resources/samples/hedis-cbp/CDC0002.xml" 			//Denom not met: too young, acute inpatient encounter :ubrev from 0-2 years ago w/o EncDx diabetes ICD9CM: 250 and 17 years old, female (denomMet)
	private static final Map ASSERTIONS_CDC0002 = [C3265 : '']
    private static final Map MEASURES_CDC0002 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0003 = "src/test/resources/samples/hedis-cbp/CDC0003.xml" 			//Denom check: right age, ED visit : CPT=99223 from 0-2 years ago EncDx diabetes ICD9CM: 250 and 22 years old, male (denomMet)
	private static final Map ASSERTIONS_CDC0003 = [demographicsMet :'']/*,'Denom_EdEncDiabetesDx' : '2010-12-02 10:10:10'*/
    private static final Map MEASURES_CDC0003 = [C2617: [num: 0, denom: 1]]

    private static final String CDC0004 = "src/test/resources/samples/hedis-cbp/CDC0004.xml" 			// Denom check: right age, outpatient visit : from 6-12 months ago Hypertension ICD9 401.0  and 22 years old, female (denomMet)
	private static final Map ASSERTIONS_CDC0004 = [demographicsMet :'']/*,'Denom_EdEncDiabetesDx' : '2011-11-02 10:10:10'*/
    private static final Map MEASURES_CDC0004 = [C2617: [num: 0, denom: 1]]
	
    private static final String CDC0005 = "src/test/resources/samples/hedis-cbp/CDC0005.xml" 			// Denom not Met
	private static final Map ASSERTIONS_CDC0005 = [demographicsMet :'']
    private static final Map MEASURES_CDC0005 = [C2617: [num: 0, denom: 0]]

	private static final String CDC0006 = "src/test/resources/samples/hedis-cbp/CDC0006.xml" 			// Denom not Met
	private static final Map ASSERTIONS_CDC0006 = [demographicsMet :'']
    private static final Map MEASURES_CDC0006 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0007 = "src/test/resources/samples/hedis-cbp/CDC0007.xml" 			// Denom check: CPT Observation and Outpatient encounters in 2 different years in time frame EncDx diabetes  and 22 years old, female (denomMet)
	private static final Map ASSERTIONS_CDC0007 = [demographicsMet :'']/*,NonAcuteEncounters:'2'*/
    private static final Map MEASURES_CDC0007 = [C2617: [num: 0, denom: 0]]

    private static final String CDC0008 = "src/test/resources/samples/hedis-cbp/CDC0008.xml" 			// Denom check: CPT nonacute inpt and HCPCS Outpatient encounters in same year in time frame EncDx diabetes  and 22 years old, female (denomMet)
	private static final Map ASSERTIONS_CDC0008 = [demographicsMet :'']/*,NonAcuteEncounters:'2'*/
    private static final Map MEASURES_CDC0008 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0009 = "src/test/resources/samples/hedis-cbp/CDC0009.xml" 			// Denom check: ubrev nonacute inpt and ubrev Outpatient encounters in same year in time frame EncDx diabetes  and 22 years old, female (denomMet)
	private static final Map ASSERTIONS_CDC0009 = [demographicsMet :'']/*,NonAcuteEncounters:'2'*/
    private static final Map MEASURES_CDC0009 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0010 = "src/test/resources/samples/hedis-cbp/CDC0010.xml" 			// Denom not Met
	private static final Map ASSERTIONS_CDC0010 = [demographicsMet :'']
    private static final Map MEASURES_CDC0010 = [C2617: [num: 0, denom: 0]]

	private static final String CDC0011 = "src/test/resources/samples/hedis-cbp/CDC0011.xml" 			// Denom not Met
	private static final Map ASSERTIONS_CDC0011 = [demographicsMet :'']
    private static final Map MEASURES_CDC0011 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0012 = "src/test/resources/samples/hedis-cbp/CDC0012.xml" 			// denom check: too young <18 years on dec 31, 2011- born jan 1, 1994 - (denomNotMet)
	private static final Map ASSERTIONS_CDC0012 = ["O.01":'']
    private static final Map MEASURES_CDC0012 = [C2617: [num: 0, denom: 0]]
	
	private static final String CDC0013 = "src/test/resources/samples/hedis-cbp/CDC0013.xml" 			// denom check: too old  not <86 years on dec 31, 2011- born dec 31, 1925 (denomNotMet)
	private static final Map ASSERTIONS_CDC0013 = ["O.01":'']
    private static final Map MEASURES_CDC0013 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0014 = "src/test/resources/samples/hedis-cbp/CDC0014.xml" 			// Denominator check:  pharmacy -expect Denominator met
	private static final Map ASSERTIONS_CDC0014 = [demographicsMet:'']
    private static final Map MEASURES_CDC0014 = [C2617: [num: 0, denom: 1]]
	
    private static final String CDC0015 = "src/test/resources/samples/hedis-cbp/CDC0015.xml" 			// Denominator check:  pharmacy too long ago	-expect Denominator not met
	private static final Map ASSERTIONS_CDC0015 = [demographicsMet:'']
    private static final Map MEASURES_CDC0015 = [C2617: [num: 0, denom: 0]]

	private static final String CDC0016 = "src/test/resources/samples/hedis-cbp/CDC0016.xml" 			// one non-acute visit  denom NOT met
	private static final Map ASSERTIONS_CDC0016 = [demographicsMet:'']
    private static final Map MEASURES_CDC0016 = [C2617: [num: 0, denom: 0]]
	
	private static final String CDC0017 = "src/test/resources/samples/hedis-cbp/CDC0017.xml" 			// Denom not Met
	private static final Map ASSERTIONS_CDC0017 = [demographicsMet:'']
    private static final Map MEASURES_CDC0017 = [C2617: [num: 0, denom: 0]]
	
    private static final String CDC0018 = "src/test/resources/samples/hedis-cbp/CDC0018.xml" 			// Denominator check:  pharmacy during an emergency visit -expect Denominator met born 12-31-1951
	private static final Map ASSERTIONS_CDC0018 = [demographicsMet:'']
    private static final Map MEASURES_CDC0018 = [C2617: [num: 0, denom: 1]]

//////////////////////////////////////////////////////////////	
	private static final String CDC0019 = "src/test/resources/samples/hedis-cbp/CDC0019.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0019 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0019 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0020 = "src/test/resources/samples/hedis-cbp/CDC0020.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0020 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0020 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0021 = "src/test/resources/samples/hedis-cbp/CDC0021.xml" 			// BP numerator check: base record, numMet
	private static final Map ASSERTIONS_CDC0021 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0021 = [C2617: [num: 1, denom: 1]]
	
	private static final String CDC0022 = "src/test/resources/samples/hedis-cbp/CDC0022.xml" 			// BP numerator check: base record, numMet
	private static final Map ASSERTIONS_CDC0022 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0022 = [C2617: [num: 1, denom: 1]]
	
	private static final String CDC0023 = "src/test/resources/samples/hedis-cbp/CDC0023.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0023 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0023 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0024 = "src/test/resources/samples/hedis-cbp/CDC0024.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0024 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0024 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0025 = "src/test/resources/samples/hedis-cbp/CDC0025.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0025 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0025 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0026 = "src/test/resources/samples/hedis-cbp/CDC0026.xml" 			// BP numerator check: base record, numMet
	private static final Map ASSERTIONS_CDC0026 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0026 = [C2617: [num: 1, denom: 1]]
	
	private static final String CDC0027 = "src/test/resources/samples/hedis-cbp/CDC0027.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0027 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0027 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0028 = "src/test/resources/samples/hedis-cbp/CDC0028.xml" 			// BP numerator check: base record, numMet
	private static final Map ASSERTIONS_CDC0028 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0028 = [C2617: [num: 1, denom: 1]]
	
	private static final String CDC0029 = "src/test/resources/samples/hedis-cbp/CDC0029.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0029 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0029 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0030 = "src/test/resources/samples/hedis-cbp/CDC0030.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0030 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0030 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0031 = "src/test/resources/samples/hedis-cbp/CDC0031.xml" 			// BP numerator check: base record, numMet
	private static final Map ASSERTIONS_CDC0031 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0031 = [C2617: [num: 1, denom: 1]]
	
	private static final String CDC0032 = "src/test/resources/samples/hedis-cbp/CDC0032.xml" 			// BP numerator check: base record, numMet
	private static final Map ASSERTIONS_CDC0032 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0032 = [C2617: [num: 1, denom: 1]]
	
	private static final String CDC0033 = "src/test/resources/samples/hedis-cbp/CDC0033.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0033 = [demographicsMet:'']/*,NonAcuteEncounters:'2'*/
	private static final Map MEASURES_CDC0033 = [C2617: [num: 0, denom: 1]]
	
	private static final String CDC0034 = "src/test/resources/samples/hedis-cbp/CDC0034.xml" 			// BP numerator check: base record
	private static final Map ASSERTIONS_CDC0034 = [demographicsMet:'']
	private static final Map MEASURES_CDC0034 = [C2617: [num: 0, denom: 1]]

/*
Concepts used:
INPUT
"	1 -> year(s)"
"	5 -> day(s)"
"	C239 -> Emergency Department"
"	C2511 -> HEDIS 2014"
"	C2556 -> Provider Eye Care Professional"
"	C2557 -> Performer"
"	C2559 -> Blood Pressure"
"	C2560 -> Blood Pressure"
"	C2579 -> Diabetes by Claims Data"
"	C2606 -> Patient Age GE 18 and LT 76 Years"
"	C2607 -> Diabetes by Pharmacy Data"
"	C2828 -> Healthcare Facility or Place of Service (POS)"
"	C2848 -> HEDIS-CDC Table L ACE Inhibitors/ARBs"
"	C2849 -> HEDIS-CDC Table A Prescriptions to Identify Members With Diabetes"
"	C2964 -> HEDIS-Outpatient"
"	C2968 -> HEDIS-ED"
"	C2971 -> HEDIS-Acute Inpatient"
"	C2972 -> HEDIS-ESRD"
"	C2983 -> HEDIS-HbA1c Level Greater Than 9.0"
"	C2984 -> HEDIS-HbA1c Level Less Than 7.0"
"	C2985 -> HEDIS-HbA1c Tests"
"	C2997 -> HEDIS-Kidney Transplant"
"	C3000 -> HEDIS-LDL-C Level Less Than 100"
"	C3001 -> HEDIS-LDL-C Tests"
"	C3018 -> HEDIS-Nephropathy Screening Tests"
"	C3019 -> HEDIS-Nephropathy Treatment"
"	C3020 -> HEDIS-Nonacute Inpatient"
"	C3022 -> HEDIS-Observation"
"	C3033 -> HEDIS-Positive Urine Macroalbumin Tests"
"	C3050 -> HEDIS-Systolic Greater Than or Equal To 140"
"	C3051 -> HEDIS-Systolic Less Than 140"
"	C3090 -> HEDIS-CKD Stage 4"
"	C3100 -> HEDIS-Diabetes"
"	C3101 -> HEDIS-Diabetic Retinal Screening"
"	C3102 -> HEDIS-Diabetic Retinal Screening Negative"
"	C3103 -> HEDIS-Diabetic Retinal Screening With Eye Care Professional"
"	C3105 -> HEDIS-Diastolic 80-89"
"	C3106 -> HEDIS-Diastolic Greater Than or Equal To 90"
"	C3107 -> HEDIS-Diastolic Less Than 80"
"	C3152 -> HEDIS-Urine Macroalbumin Tests"
"	C3262 -> Provider Nephrology"
"	C3265 -> Named Dates Inserted"
"	C3293 -> HbA1c No Result Available Among Procedures"
"	C3294 -> HbA1c No Result Available Among Observations"
"	C36 -> OpenCDS"
"	C405 -> Part of"
"	C44 -> Outpatient"
"	C54 -> Denominator Criteria Met"
"	C544 -> Denominator Exclusions Met"
"	C545 -> Denominator Inclusions Met"
OUTPUT
"	1 -> year(s)"
"	5 -> day(s)"
"	C1678 -> Cholesterol"
"	C2519 -> Denominator Inclusions by Claims Data"
"	C2520 -> Denominator Inclusions by Pharmacy Data"
"	C2522 -> HbA1c Poor Control (None or GT 9.0 Pct)"
"	C2523 -> HbA1c Control LT 8.0 Pct"
"	C2528 -> Medical Attention for Nephropathy"
"	C2529 -> Blood Pressure Control LT 140 - 80 mm Hg"
"	C2530 -> Blood Pressure Control LT 140 - 90 mm Hg"
"	C2555 -> Eye Exam"
"	C2558 -> Eye Exam"
"	C2579 -> Diabetes by Claims Data"
"	C2580 -> QM HEDIS-CDC Comprehensive Diabetes Care"
"	C2606 -> Patient Age GE 18 and LT 76 Years"
"	C2607 -> Diabetes by Pharmacy Data"
"	C2617 -> QM HEDIS-CBP Controlling High Blood Pressure
"	C2735 -> HbA1c Testing in Past Year"
"	C2736 -> LDL-C Control LT 100 mg per dL"
"	C3201 -> QM HEDIS-CDC (BP LT 140 / 80)"
"	C3202 -> QM HEDIS-CDC (BP LT 140 / 90)"
"	C3203 -> QM HEDIS-CDC (HbA1c testing)"
"	C3204 -> QM HEDIS-CDC (HbA1c poor control GT 9%)"
"	C3205 -> QM HEDIS-CDC (HbA1c control LT 8%)"
"	C3206 -> QM HEDIS-CDC (HbA1c control LT 7%)"
"	C3207 -> QM HEDIS-CDC (Eye Exam)"
"	C3208 -> QM HEDIS-CDC (LDL-C screening)"
"	C3209 -> QM HEDIS-CDC (LDL-C control LT 100 mg/dL)"
"	C3210 -> QM HEDIS-CDC (Nephropathy)"
"	C3265 -> Named Dates Inserted"
"	C3266 -> Eye Exam"
"	C3267 -> Eye Exam"
"	C3288 -> HbA1c GT 9.0 Pct"
"	C3289 -> HbA1c Testing by Procedure"
"	C3290 -> HbA1c Testing by Observation"
"	C3291 -> HbA1c No Result Available"
"	C3293 -> HbA1c No Result Available Among Procedures"
"	C3294 -> HbA1c No Result Available Among Observations"
"	C3378 -> LDL-C Screening"
"	C529 -> Rejected for Missing or Bad Data"
"	C539 -> Numerator Criteria Met"
"	C54 -> Denominator Criteria Met"
"	C545 -> Denominator Inclusions Met"
"	C569 -> Missing Data for Date of Birth"


*/
	
	@Unroll
	def "test HEDIS CBP v2015.0.0"() 
	{
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'HEDIS_CBP', version: '2015.0.0'],
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
		CDC0001 | ASSERTIONS_CDC0001| MEASURES_CDC0001
		CDC0002 | ASSERTIONS_CDC0002| MEASURES_CDC0002
		CDC0003 | ASSERTIONS_CDC0003| MEASURES_CDC0003
		CDC0004 | ASSERTIONS_CDC0004| MEASURES_CDC0004
		CDC0005 | ASSERTIONS_CDC0005| MEASURES_CDC0005
		CDC0006 | ASSERTIONS_CDC0006| MEASURES_CDC0006
		CDC0007 | ASSERTIONS_CDC0007| MEASURES_CDC0007
		CDC0008 | ASSERTIONS_CDC0008| MEASURES_CDC0008
		CDC0009 | ASSERTIONS_CDC0009| MEASURES_CDC0009
		CDC0010 | ASSERTIONS_CDC0010| MEASURES_CDC0010
		CDC0011 | ASSERTIONS_CDC0011| MEASURES_CDC0011
		CDC0012 | ASSERTIONS_CDC0012| MEASURES_CDC0012
		CDC0013 | ASSERTIONS_CDC0013| MEASURES_CDC0013
		CDC0014 | ASSERTIONS_CDC0014| MEASURES_CDC0014
		CDC0015 | ASSERTIONS_CDC0015| MEASURES_CDC0015
		CDC0016 | ASSERTIONS_CDC0016| MEASURES_CDC0016
		CDC0017 | ASSERTIONS_CDC0017| MEASURES_CDC0017
		CDC0018 | ASSERTIONS_CDC0018| MEASURES_CDC0018
		CDC0019 | ASSERTIONS_CDC0019| MEASURES_CDC0019
		CDC0020 | ASSERTIONS_CDC0020| MEASURES_CDC0020
		CDC0021 | ASSERTIONS_CDC0021| MEASURES_CDC0021
		CDC0022 | ASSERTIONS_CDC0022| MEASURES_CDC0022
		CDC0023 | ASSERTIONS_CDC0023| MEASURES_CDC0023
		CDC0024 | ASSERTIONS_CDC0024| MEASURES_CDC0024
		CDC0025 | ASSERTIONS_CDC0025| MEASURES_CDC0025
		CDC0026 | ASSERTIONS_CDC0026| MEASURES_CDC0026
		CDC0027 | ASSERTIONS_CDC0027| MEASURES_CDC0027
		CDC0028 | ASSERTIONS_CDC0028| MEASURES_CDC0028
		CDC0029 | ASSERTIONS_CDC0029| MEASURES_CDC0029
		CDC0030 | ASSERTIONS_CDC0030| MEASURES_CDC0030
		CDC0031 | ASSERTIONS_CDC0031| MEASURES_CDC0031
		CDC0032 | ASSERTIONS_CDC0032| MEASURES_CDC0032
		CDC0033 | ASSERTIONS_CDC0033| MEASURES_CDC0033
		CDC0034 | ASSERTIONS_CDC0034| MEASURES_CDC0034

	}
}
