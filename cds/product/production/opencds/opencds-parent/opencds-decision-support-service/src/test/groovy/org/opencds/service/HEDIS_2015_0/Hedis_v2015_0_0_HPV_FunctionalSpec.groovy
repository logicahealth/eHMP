package org.opencds.service.HEDIS_2015_0;

import java.util.Map;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil

import spock.lang.Specification
import spock.lang.Unroll

public class Hedis_v2015_0_0_HPV_FunctionalSpec extends Specification 
{
	private static final String EMPTY0001 = "src/test/resources/samples/hedis-all/SampleALL0001.xml" //missing DOB
	private static final Map ASSERTIONS_EMPTY0001 = [reject:'']
    private static final Map MEASURES_EMPTY0001 = [C2595: [num: 0, denom: 0]]
	
    private static final String HPV0001 = "src/test/resources/samples/hedis-HPV/SampleHPV0001.xml" //Denom Not Met, too old
	private static final Map ASSERTIONS_HPV0001 = ['A.01': '']
    private static final Map MEASURES_HPV0001  = [C2595: [num: 0, denom: 0]]

	
    private static final String HPV0002 = "src/test/resources/samples/hedis-HPV/SampleHPV0002.xml" //Denom Met
	private static final Map ASSERTIONS_HPV0002 = [C2815: '', C31: '']
	private static final Map MEASURES_HPV0002  = [C2595: [num: 0, denom: 1]]
	
    private static final String HPV0003 = "src/test/resources/samples/hedis-HPV/SampleHPV0003.xml" //Denom Not Met, Male
	private static final Map ASSERTIONS_HPV0003 = [C2815: '']
	private static final Map MEASURES_HPV0003  = [C2595: [num: 0, denom: 0]]

	
    private static final String HPV0004 = "src/test/resources/samples/hedis-HPV/SampleHPV0004.xml" //Num Met
	private static final Map ASSERTIONS_HPV0004 = [C2815: '']
	private static final Map MEASURES_HPV0004  = [C2595: [num: 1, denom: 1]]
	
	private static final String HPV0005 = "src/test/resources/samples/hedis-HPV/SampleHPV0005.xml" //Num Met
	private static final Map ASSERTIONS_HPV0005 = [C2815: '']
	private static final Map MEASURES_HPV0005  = [C2595: [num: 1, denom: 1]]
	
	private static final String HPV0006 = "src/test/resources/samples/hedis-HPV/SampleHPV0006.xml" //Num Not Met
	private static final Map ASSERTIONS_HPV0006 = [C2815: '']
	private static final Map MEASURES_HPV0006  = [C2595: [num: 0, denom: 1]]

	private static final String HPV0007 = "src/test/resources/samples/hedis-HPV/SampleHPV0007.xml" //Num Met, tests to reject duplicate dates of "2009-11-02" and "2009-11-02 10:10:10"
	private static final Map ASSERTIONS_HPV0007 = ['C2595: C3422: C3538': '[List<Date>]20091102000000, 20091102101010, 20091202000000, 20100102101010']
	private static final Map MEASURES_HPV0007  = [C2595: [num: 1, denom: 1]]
/*
Concepts used:
INPUT
"	1 -> year(s)"
"	5 -> day(s)"
"	C2815 -> Patient Age EQ 13 Years"
"	C2991 -> HEDIS-HPV Vaccine Administered"
"	C31 -> Female"
"	C54 -> Denominator Criteria Met"
"	C544 -> Denominator Exclusions Met"
"	C545 -> Denominator Inclusions Met"
OUTPUT
"	1 -> year(s)"
"	C2595 -> QM HEDIS-HPV Human Papillomavirus Vax"
"	C2815 -> Patient Age EQ 13 Years"
"	C31 -> Female"
"	C529 -> Rejected for Missing or Bad Data"
"	C54 -> Denominator Criteria Met"
"	C545 -> Denominator Inclusions Met"
"	C569 -> Missing Data for Date of Birth"
"	C63 -> Vaccine Human Papilloma Virus (HPV)"

*/
	
	@Unroll
	def "test HEDIS FPC v2015.0.0"() 
	{
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'HEDIS_HPV', version: '2015.0.0'],
			specifiedTime: '2012-01-01'
		]
		def responsePayload = OpencdsClient.sendEvaluateAtSpecifiedTimeMessage(params, input)
//		println responsePayload

		then:
		def data = new XmlSlurper().parseText(responsePayload)
		def results = VMRUtil.getResults(data, '\\|')
//		assertions.size() == results.assertions.size()
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
//        measures.size() == results.measures.size()
        measuresList.each {entry ->
        assert results.measuresList.get(entry.key).num == entry.value.num
        assert results.measuresList.get(entry.key).denom == entry.value.denom				
        }
//		results.measures.each {entry ->
//			System.err.println "${entry.key} -> ${entry.value.num} ${entry.value.denom}"
//		}
//		results.assertions.each {entry ->
//			System.err.println "${entry.key} -> ${entry.value}"
//		}

		where:
		vmr | assertions | measuresList
		EMPTY0001 | ASSERTIONS_EMPTY0001| MEASURES_EMPTY0001 
		HPV0001 | ASSERTIONS_HPV0001| MEASURES_HPV0001
		HPV0002 | ASSERTIONS_HPV0002| MEASURES_HPV0002
		HPV0003 | ASSERTIONS_HPV0003| MEASURES_HPV0003
		HPV0004 | ASSERTIONS_HPV0004| MEASURES_HPV0004
		HPV0005 | ASSERTIONS_HPV0005| MEASURES_HPV0005
		HPV0006 | ASSERTIONS_HPV0006| MEASURES_HPV0006
		HPV0007 | ASSERTIONS_HPV0007| MEASURES_HPV0007
	}
}
