package org.opencds.service.HEDIS_2014_1;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil

import spock.lang.Specification
import spock.lang.Unroll

public class Hedis_v2014_1_0_AWC_FunctionalSpec extends Specification 
{
	private static final String EMPTY0001 = "src/test/resources/samples/hedis-all/SampleALL0001.xml" 
	/* -1 : Denom check: Missing DOB value	*/
	/* -1 : Num check: Missing DOB value  */
	private static final Map ASSERTIONS_EMPTY0001 = [reject:'']
    private static final Map MEASURES_EMPTY0001 = [C2626: [num: -1, denom: -1]]
	
    private static final String AWC0001 = "src/test/resources/samples/hedis-awc/SampleAWC0001.xml" 
	/* 1 : Denom check: 12–21 years (old in: 1990-01-02 01:01:01)	*/
	/* 1 : Num check: Proc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 124, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0001 = [C2679: '', C2680: '']
    private static final Map MEASURES_AWC0001  = [C2626: [num: 1, denom: 1]]

	
    private static final String AWC0002 = "src/test/resources/samples/hedis-awc/SampleAWC0002.xml" 
	/* 1 : Denom check: 12–21 years (young in: 1999-12-31 23:59:59)	*/
	/* 1 : Num check: Enc, HEDIS-Well-Care (HCPCS: G0438),  OB/GYN  ("OBSTETRICS AND GYNECOLOGY": 508, late in: 2011-12-31 23:59:59)*/
	private static final Map ASSERTIONS_AWC0002 = [C2679: '', C2680: '']
	private static final Map MEASURES_AWC0002  = [C2626: [num: 1, denom: 1]]
	
	
    private static final String AWC0003 = "src/test/resources/samples/hedis-awc/SampleAWC0003.xml" 
	/* 1 : Denom check: 12–21 years (young in: 1999-12-31 23:59:59)	*/
	/* 0 : Num check: Enc, HEDIS-Well-Care (HCPCS: 00000),  OB/GYN  ("OBSTETRICS AND GYNECOLOGY": 508, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0003 = [C2679: '']
	private static final Map MEASURES_AWC0003  = [C2626: [num: 0, denom: 1]]

		
    private static final String AWC0004 = "src/test/resources/samples/hedis-awc/SampleAWC0004.xml" 
	/* 1 : Denom check: 12–21 years (young in: 1999-12-31 23:59:59)	*/
	/* 0 : Num check: Enc, HEDIS-Well-Care (HCPCS: G0438),  OB/GYN  ("OBSTETRICS AND GYNECOLOGY": 508, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0004 = [C2679: '']
	private static final Map MEASURES_AWC0004  = [C2626: [num: 1, denom: 1]]
	
		
	private static final String AWC0005 = "src/test/resources/samples/hedis-awc/SampleAWC0005.xml" 	
	/* 1 : Denom check: 12–21 years (old in: 1990-01-02 01:01:01)	*/
	/* 1 : Num check: Proc, HEDIS-Well-Care (ICD9CM: V20.2"),  PCP ("GENERAL PRACTICE": 124, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0005 = [C2679: '', C2680: '']
	private static final Map MEASURES_AWC0005  = [C2626: [num: 1, denom: 1]]
	
	
	private static final String AWC0006 = "src/test/resources/samples/hedis-awc/SampleAWC0006.xml" 
    /* 0 : Denom check: 12–21 years (old out: 1989-12-31 23:59:59)	*/
	/* 0 : Num check: Proc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 124, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0006 = ["O.01": '']
    private static final Map MEASURES_AWC0006  = [C2626: [num: 0, denom: 0]]
	
		
	private static final String AWC0007 = "src/test/resources/samples/hedis-awc/SampleAWC0007.xml" 
	/* 0 : Denom check: 12–21 years (young out: 2000-01-01 01:01:01)	*/
	/* 0 : Num check: Proc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 124, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0007 = ["O.01": '']
    private static final Map MEASURES_AWC0007  = [C2626: [num: 0, denom: 0]]
	
	
	private static final String AWC0008 = "src/test/resources/samples/hedis-awc/SampleAWC0008.xml" 
	/* 0 : Denom check: 12–21 years (old in: 1990-01-01 01:01:01)	*/
	/* 0 : Num check: Enc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 124, early out: 2010-12-31 23:59:59)*/
	private static final Map ASSERTIONS_AWC0008 = [C2679: '']
	private static final Map MEASURES_AWC0008  = [C2626: [num: 0, denom: 1]]

		
	private static final String AWC0009 = "src/test/resources/samples/hedis-awc/SampleAWC0009.xml" 
	/* 0 : Denom check: 12–21 years (old in: 1990-01-01 01:01:01)	*/
	/* 0 : Num check: Proc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 124, early out: 2010-12-31 23:59:59)*/
	private static final Map ASSERTIONS_AWC0009 = [C2679: '']
	private static final Map MEASURES_AWC0009 = [C2626: [num: 0, denom: 1]]
	
		
	private static final String AWC0010 = "src/test/resources/samples/hedis-awc/SampleAWC0010.xml"
	/* 0 : Denom check: 12–21 years (old in: 1990-01-01 01:01:01)	*/
	/* 0 : Num check: Enc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 124, late out: 2012-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0010 = [C2679: '']
	private static final Map MEASURES_AWC0010 = [C2626: [num: 0, denom: 1]]
	
	
	private static final String AWC0011 = "src/test/resources/samples/hedis-awc/SampleAWC0011.xml"
	/* 0 : Denom check: 12–21 years (old in: 1990-01-01 01:01:01)	*/
	/* 0 : Num check: Proc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 124, late out: 2012-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0011 = [C2679: '']
	private static final Map MEASURES_AWC0011 = [C2626: [num: 0, denom: 1]]
	
	
	
	private static final String AWC0012 = "src/test/resources/samples/hedis-awc/SampleAWC0012.xml"
	/* 0 : Denom check: 12–21 years (old in: 1990-01-01 01:01:01)	*/
	/* 0 : Num check: Proc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 00000, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0012 = [C2679: '']
	private static final Map MEASURES_AWC0012  = [C2626: [num: 0, denom: 1]]
	
	
	
	private static final String AWC0013 = "src/test/resources/samples/hedis-awc/SampleAWC0013.xml"
	/* 0 : Denom check: 12–21 years (old in: 1990-01-01 01:01:01)	*/
	/* 0 : Num check: Enc, HEDIS-Well-Care (CPT: 99381),  PCP ("GENERAL PRACTICE": 00000, early in: 2011-01-01 01:01:01)*/
	private static final Map ASSERTIONS_AWC0013 = [C2679: '']
	private static final Map MEASURES_AWC0013  = [C2626: [num: 0, denom: 1]]

/*
Concepts used:
INPUT
"	1 -> year(s)"
"	5 -> day(s)"
"	C2511 -> HEDIS 2014"
"	C2557 -> Performer"
"	C2679 -> Patient Age GE 12 and LT 22 Years"
"	C2704 -> Provider Primary Care (PCP)"
"	C2705 -> Provider Obstetrics and Gynecology  (OB/GYN)"
"	C3062 -> HEDIS-Well-Care"
"	C36 -> OpenCDS"
"	C544 -> Denominator Exclusions Met"
"	C545 -> Denominator Inclusions Met"
OUTPUT
"	C2626 -> QM HEDIS-AWC Adolescent Well-Care Visits"
"	C2679 -> Patient Age GE 12 and LT 22 Years"
"	C2680 -> Comprehensive Well-Care Visit"
"	C529 -> Rejected for Missing or Bad Data"
"	C539 -> Numerator Criteria Met"
"	C54 -> Denominator Criteria Met"
"	C545 -> Denominator Inclusions Met"
"	C569 -> Missing Data for Date of Birth"
*/
	
	@Unroll
	def "test HEDIS AWC v2014.1.0"() 
	{
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'HEDIS_AWC', version: '2014.1.0'],
			specifiedTime: '2012-01-01'
		]
		def responsePayload = OpencdsClient.sendEvaluateAtSpecifiedTimeMessage(params, input)
		println responsePayload

		then:
		def data = new XmlSlurper().parseText(responsePayload)
		def results = VMRUtil.getResults(data, '\\|')
//		assertions.size() == results.assertions.size()
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
//        measures.size() == results.measures.size()
        measures.each {entry ->
            assert results.measures.containsKey(entry.key)
            assert results.measures.get(entry.key).num == entry.value.num
            assert results.measures.get(entry.key).denom == entry.value.denom			
        }
//		results.measures.each {entry ->
//			System.err.println "${entry.key} -> ${entry.value.num} ${entry.value.denom}"
//		}
//		results.assertions.each {entry ->
//			System.err.println "${entry.key} -> ${entry.value}"
//		}

		where:
		vmr | assertions | measures
		EMPTY0001 | ASSERTIONS_EMPTY0001| MEASURES_EMPTY0001 
		AWC0001 | ASSERTIONS_AWC0001| MEASURES_AWC0001
		AWC0002 | ASSERTIONS_AWC0002| MEASURES_AWC0002
		AWC0003 | ASSERTIONS_AWC0003| MEASURES_AWC0003
		AWC0004 | ASSERTIONS_AWC0004| MEASURES_AWC0004
		AWC0005 | ASSERTIONS_AWC0005| MEASURES_AWC0005
		AWC0006 | ASSERTIONS_AWC0006| MEASURES_AWC0006
		AWC0007 | ASSERTIONS_AWC0007| MEASURES_AWC0007
		AWC0008 | ASSERTIONS_AWC0008| MEASURES_AWC0008
		AWC0009 | ASSERTIONS_AWC0009| MEASURES_AWC0009
		AWC0010 | ASSERTIONS_AWC0010| MEASURES_AWC0010
		AWC0011 | ASSERTIONS_AWC0011| MEASURES_AWC0011
		AWC0012 | ASSERTIONS_AWC0012| MEASURES_AWC0012
		AWC0013 | ASSERTIONS_AWC0013| MEASURES_AWC0013

	}
}
