package org.opencds.service.HEDIS_2015_0;

import java.util.Map;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil

import spock.lang.Specification
import spock.lang.Unroll
public class Hedis_v2015_0_0_IMA_FunctionalSpec extends Specification {

//Denominator check:  C2815:Patient Age EQ 13 Years,  C54:Denominator Criteria Met, C545:Denominator Inclusions Met
	
	private static final String IMA_den0000 = "src/test/resources/samples/hedis-ima/IMA_den0000.xml" //denom check denom - met : acute inpatient encounter : CPT=90733 13 years old during measurement year (dec 31, 2011 is 13th birthday so born dec 31,1998) 
    private static final Map ASSERTIONS_IMA_den0000 = [C2815:'', C54: '', C545: ''] 
	private static final Map MEASURES_IMA_den0000 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]

	private static final String IMA_den0001 = "src/test/resources/samples/hedis-ima/IMA_den0001.xml" //denom check denom - not met acute inpatient encounter : CPT=90733 13 years old during measurement year (dec 31, 2011 is 13th birthday birthTime value="19990101"/> <!--should not pass too young(denomNotMet)
	private static final Map ASSERTIONS_IMA_den0001 = [ 'A.01':'']
	private static final Map MEASURES_IMA_den0001 = [C3277: [num: 0, denom:0], C3276: [num: 0, denom: 0], C3284: [num: 0, denom: 0]]
	
	private static final String IMA_den0002 = "src/test/resources/samples/hedis-ima/IMA_den0002.xml" //denom check denom - met : acute inpatient encounter : CPT=90733 13 years old during measurement year (dec 31, 2011 is 13th birthday)<birthTime value="19980101"/> <!--should pass- 
	private static final Map ASSERTIONS_IMA_den0002 = [C2815:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_den0002 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]
	
	private static final String IMA_den0003 = "src/test/resources/samples/hedis-ima/IMA_den0003.xml" //denom check denom - not met acute inpatient encounter : CPT=90733 13 years old during measurement year (dec 31, 2011 is 13th birthday) <birthTime value="19971231"should not pass too old
	private static final Map ASSERTIONS_IMA_den0003 = [ 'A.01':'']
	private static final Map MEASURES_IMA_den0003 =  [C3277: [num: 0, denom:0], C3276: [num: 0, denom: 0], C3284: [num: 0, denom: 0]]
//	
//numerator check using den0000 as base:
	//	C3276	QM HEDIS-IMA (Mening) Immuniz. for Adolescents
	//	C3282	Numerator Criteria Met for Meningococcal Vaccine
	//	C54		Denominator Criteria Met
//	
	private static final String IMA_Mening0004 = "src/test/resources/samples/hedis-ima/IMA_Mening0004.xml" //num check-numerator met use IMA_den0000 as base for denom , then check vaccine dates latest date good 
	private static final Map ASSERTIONS_IMA_Mening0004 = [C2815:'',C3282:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Mening0004 = [C3277: [num: 0, denom: 1], C3276: [num: 1, denom: 1], C3284: [num: 0, denom: 1]]
	
	private static final String IMA_Mening0005 = "src/test/resources/samples/hedis-ima/IMA_Mening0005.xml" //num check numerator not met use IMA_den0000 as base for denom , then check vaccine dates day after 13th birthday
	private static final Map ASSERTIONS_IMA_Mening0005 = [C2815:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Mening0005 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]

	private static final String IMA_Mening0006 = "src/test/resources/samples/hedis-ima/IMA_Mening0006.xml" //num check-numerator met use IMA_den0000 as base for denom , then check vaccine dates on 11th birthday 
	private static final Map ASSERTIONS_IMA_Mening0006 = [C2815:'',C3282:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Mening0006 = [C3277: [num: 0, denom: 1], C3276: [num: 1, denom: 1], C3284: [num: 0, denom: 1]]
	
	private static final String IMA_Mening0007 = "src/test/resources/samples/hedis-ima/IMA_Mening0007.xml" //num check numerator not met use IMA_den0000 as base for denom , then check vaccine dates day before 11th birthday 
	private static final Map ASSERTIONS_IMA_Mening0007 = [C2815:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Mening0007 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]

		//numerator check using den0000 as base:
	//	C3277	QM HEDIS-IMA (Tdap/Td) Immuniz. for Adolescents
	//	C3278	Tetanus vaccine & Diptheria vaccine given between 10-13th birthday [ OpenCDS ]
	//	C3279	Tdap vaccine or Td vaccine given between 10-13th birthday
	//	C3283	Numerator Criteria Met for Tdap/Td logic
	//	C54		Denominator Criteria Met
	
	private static final String IMA_Tdap0004 = "src/test/resources/samples/hedis-ima/IMA_Tdap0004.xml" //num check-numerator met: use IMA_den0000 as base for denom , then check vaccine dates and the Tdap valueset latest date good
	private static final Map ASSERTIONS_IMA_Tdap0004 = [C2815:'',C3279:'',C3283:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0004 = [C3277: [num: 1, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]
	
	private static final String IMA_Tdap0005 = "src/test/resources/samples/hedis-ima/IMA_Tdap0005.xml" //num check numerator not met: use IMA_den0000 as base for denom , then check vaccine dates and teh Tdap valueset day after 13th birthday
	private static final Map ASSERTIONS_IMA_Tdap0005 = [C2815:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0005 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]

	private static final String IMA_Tdap0006 = "src/test/resources/samples/hedis-ima/IMA_Tdap0006.xml" //num check-numerator met use IMA_den0000 as base for denom , then check vaccine dates and teh Tdap valueset then check vaccine dates on 10th birthday
	private static final Map ASSERTIONS_IMA_Tdap0006 = [C2815:'',C3279:'',C3283:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0006 = [C3277: [num: 1, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]
	
	private static final String IMA_Tdap0007 = "src/test/resources/samples/hedis-ima/IMA_Tdap0007.xml" //num check numerator not metuse IMA_den0000 as base for denom , then check vaccine dates and teh Tdap valueset , then check vaccine dates day before 10th birthday
	private static final Map ASSERTIONS_IMA_Tdap0007 = [C2815:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0007 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]
		
	private static final String IMA_Tdap0008 = "src/test/resources/samples/hedis-ima/IMA_Tdap0008.xml" //num check-numerator met: use IMA_den0000 as base for denom , then check Td valueset latest date good
	private static final Map ASSERTIONS_IMA_Tdap0008 = [C2815:'',C3279:'',C3283:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0008 = [C3277: [num: 1, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]
	
	private static final String IMA_Tdap0009 = "src/test/resources/samples/hedis-ima/IMA_Tdap0009.xml" //num check-numerator met: use IMA_den0000 as base for denom , then check tetanus and diptheria logic and  valuesets	should pass
	private static final Map ASSERTIONS_IMA_Tdap0009 = [C2815:'',C3278:'',C3283:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0009 = [C3277: [num: 1, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]

	private static final String IMA_Tdap0010 = "src/test/resources/samples/hedis-ima/IMA_Tdap0010.xml" //num check-numerator not met:use IMA_den0000 as base for denom , then check tetanus and diptheria logic - outside date ranges	should not pass
	private static final Map ASSERTIONS_IMA_Tdap0010 = [C2815:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0010 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]
	
	private static final String IMA_Tdap0011 = "src/test/resources/samples/hedis-ima/IMA_Tdap0011.xml" //num check-numerator not met:use IMA_den0000 as base for denom , then check tetanus and diptheria logic - 2 of the same vaccine should not pass
	private static final Map ASSERTIONS_IMA_Tdap0011 = [C2815:'', C54: '', C545: '']
	private static final Map MEASURES_IMA_Tdap0011 = [C3277: [num: 0, denom: 1], C3276: [num: 0, denom: 1], C3284: [num: 0, denom: 1]]

		//numerator check using den0000 as base:
	//	C3277	QM HEDIS-IMA (Tdap/Td) Immuniz. for Adolescents
	//	C3276	QM HEDIS-IMA (Mening) Immuniz. for Adolescents
	//	C3284	QM HEDIS-IMA (Combination1) Immuniz. for Adolescents
	//	C2594	QM HEDIS-IMA  Immuniz. for Adolescents
	//	C3278	Tetanus vaccine & Diptheria vaccine given between 10-13th birthday [ OpenCDS ]
	//	C3279	Tdap vaccine or Td vaccine given between 10-13th birthday
	//	C3282	Numerator Criteria Met for Meningococcal Vaccine
	//	C3283	Numerator Criteria Met for Tdap/Td logic
	//	C539	Numerator Criteria Met
	//	C54		Denominator Criteria Met
	
	private static final String IMA_Tdap0012 = "src/test/resources/samples/hedis-ima/IMA_Tdap0012.xml" //num check-numerator met: use IMA_den0000 as base for denom , then check combination 1 will fire
	private static final Map ASSERTIONS_IMA_Tdap0012 = [C2815:'',C3279:'',C3282:'', C3283:'', C54: '', C545: '',C539:'']
	private static final Map MEASURES_IMA_Tdap0012 = [C3277: [num: 1, denom: 1], C3276: [num: 1, denom: 1], C3284: [num: 1, denom: 1]]

	//C569	Missing Data for Date of Birth
	//C529	Rejected for Missing or Bad Data
	
	private static final String IMA_noDOB = "src/test/resources/samples/hedis-ima/IMA_noDOB.xml"  //no DOB
	private static final Map ASSERTIONS_IMA_noDOB = [C529:'', C569:'', reject:'']
	private static final Map MEASURES_IMA_noDOB = [C3277: [num: 0, denom: 0]]
			
		@Unroll
	def "test HEDIS IMA v2015.0.0"() {
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'HEDIS_IMA', version: '2015.0.0'],
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
		IMA_den0000 | ASSERTIONS_IMA_den0000 | MEASURES_IMA_den0000 
		IMA_den0001 | ASSERTIONS_IMA_den0001 | MEASURES_IMA_den0001
		IMA_den0002 | ASSERTIONS_IMA_den0002 | MEASURES_IMA_den0002
		IMA_den0003 | ASSERTIONS_IMA_den0003 | MEASURES_IMA_den0003
		IMA_Mening0004 | ASSERTIONS_IMA_Mening0004 | MEASURES_IMA_Mening0004
		IMA_Mening0005 | ASSERTIONS_IMA_Mening0005 | MEASURES_IMA_Mening0005
		IMA_Mening0006 | ASSERTIONS_IMA_Mening0006 | MEASURES_IMA_Mening0006
		IMA_Mening0007 | ASSERTIONS_IMA_Mening0007 | MEASURES_IMA_Mening0007
		IMA_Tdap0004 | ASSERTIONS_IMA_Tdap0004  | MEASURES_IMA_Tdap0004
		IMA_Tdap0005 | ASSERTIONS_IMA_Tdap0005  | MEASURES_IMA_Tdap0005
		IMA_Tdap0006 | ASSERTIONS_IMA_Tdap0006  | MEASURES_IMA_Tdap0006
		IMA_Tdap0007 | ASSERTIONS_IMA_Tdap0007  | MEASURES_IMA_Tdap0007
		IMA_Tdap0008 | ASSERTIONS_IMA_Tdap0008  | MEASURES_IMA_Tdap0008
		IMA_Tdap0009 | ASSERTIONS_IMA_Tdap0009  | MEASURES_IMA_Tdap0009
		IMA_Tdap0010 | ASSERTIONS_IMA_Tdap0010  | MEASURES_IMA_Tdap0010
		IMA_Tdap0011 | ASSERTIONS_IMA_Tdap0011  | MEASURES_IMA_Tdap0011
		IMA_Tdap0012 | ASSERTIONS_IMA_Tdap0012  | MEASURES_IMA_Tdap0012
		IMA_noDOB | ASSERTIONS_IMA_noDOB | MEASURES_IMA_noDOB	
}}