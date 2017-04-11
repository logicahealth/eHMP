package org.opencds.service

import org.opencds.service.util.OpencdsClient

import spock.lang.Specification
import spock.lang.Unroll

class HttpsFunctionalSpec extends Specification{

	// sample vmr was extracted from http://develop.opencds.org/OpenCDSDemo/latest/OxygenDemo.wssc
	private static final String BOUNCE_VMR = "src/test/resources/samples/bounce/vmr.xml"
	
	@Unroll
	def "test https connection"(){
		when:
		def input = new File(BOUNCE_VMR).text
		def params = [kmEvaluationRequest:[scopingEntityId: 'org.opencds', businessId: 'bounce', version: '1.5.5'], specifiedTime: '2015-01-01']
		def responsePayload = OpencdsClient.sendEvaluateAtSpecifiedTimeMessageHttps(params, input)
		print responsePayload
		
		then:
        def data = new XmlSlurper().parseText(responsePayload)
        data.vmrOutput.templateId.@root.text() == "2.16.840.1.113883.3.1829.11.1.2.1"
	}
}