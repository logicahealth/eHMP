package org.opencds.service;

import java.util.Map;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil
import org.springframework.ws.soap.client.SoapFaultClientException;

import spock.lang.Specification
import spock.lang.Unroll

public class StackOverflowFunctionalSpec extends Specification {
	private static Map concepts = [C3421:'Denom', C3422: 'Num', C3423: 'Denom Excl',
		C2895 : 'HEDIS-Stand Alone Prenatal Visits',
		C2899 : 'HEDIS-Pregnancy Diagnosis',
		C2975 : 'HEDIS-Deliveries',
		C3023 : 'HEDIS-Obstetric Panel',
		C3037 : 'HEDIS-Prenatal Ultrasound',
		C3038 : 'HEDIS-Prenatal Visits',
		C3265 : 'Named Dates Inserted',
		C3292 : 'Gestational Age',
		C3295 : 'Encounter with Delivery in Relaxed Timeframe',
		C3296 : 'Two Encounters with Deliveries in Relaxed Timeframe',
		C3298 : 'QM HEDIS-FPC First Delivery',
		C3299 : 'QM HEDIS-FPC Second Delivery',
		C3300 : 'Denominator Criteria Met for First Delivery',
		C3301 : 'Denominator Criteria Met for Second Delivery',
		C3305 : 'Percent GE 21 LE 40',
		C3306 : 'Percent GE 41 LE 60',
		C3341 : 'QM HEDIS-FPC',
		C3386 : 'QM HEDIS-FPC 0-20 Percent',
		C3387 : 'QM HEDIS-FPC 21-40 Percent',
		C3388 : 'QM HEDIS-FPC 41-60 Percent',
		C3389 : 'QM HEDIS-FPC 61-80 Percent',
		C3390 : 'QM HEDIS-FPC 81-100 Percent',
		C3429 : 'Age',
		C3568 : 'Percent',
		C3569 : 'Prenatal Visits',
		C3570 : 'Expected Visits',
		C3591 : 'Pregnancy, 2nd',
		C3593 : 'Gestational Age, 2nd Pregnancy',
		C3595 : 'Prenatal Visits, 2nd Pregnancy',
		C3598 : 'Percent, 2nd Pregnancy',
		C3600 : 'Expected Visits, 2nd Pregnancy',
		C844 : 'Pregnancy'
	]
	private static final String FPC_0013 = "src/test/resources/samples/SO-test.xml"
	/* 1 - Denom check: HEDIS Delivery by ICD9Px	*/
	/* 1 - Num check: one standalone prenatal visit by HCPCS, w/ provider, 1 month before delivery  */
	private static final Map ASSERTIONS_FPC_0013 = [ 'Percent(1)': '7', 'PrenatalVisitDistinctDateCount(1)': '1']
	private static final Map MEASURES_FPC_0013 = [C3386: [num: 1, denom: 1], C3387: [num: 0, denom: 1], C3388: [num: 0, denom: 1],
		C3389: [num: 0, denom: 1], C3390: [num: 0, denom: 1]]


	@Unroll
	def "test HEDIS FPC v2015.0.0"() {
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'org.opencds', businessId: 'bounce', version: '1.5.5'],
			specifiedTime: '2012-01-01'
		]
		def responsePayload = OpencdsClient.sendEvaluateAtSpecifiedTimeMessage(params, input)

		then:
		def e = thrown(SoapFaultClientException)
		e.message == 'OpenCDS encountered Exception when building output: CdsOutputResultSetBuilder received a StackOverflowError, possibly caused by duplicate ids in the output from the ExecutionEngine'

		where:
		vmr | assertions | measuresList
		FPC_0013 | ASSERTIONS_FPC_0013| MEASURES_FPC_0013
	}
}
