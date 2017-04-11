package org.opencds.service

import org.opencds.service.util.OpencdsClient
import org.springframework.ws.soap.client.SoapFaultClientException

import spock.lang.Specification

class UnknownKMIdFunctionalSpec extends Specification {
    
    private final String TEST = 'src/test/resources/samples/hedis-aab/SampleAAB0001.xml'
    
    def "test"() {
        given:
        def input = new File(TEST).text
        def params = [
            kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'UnknownKM', version: '2014.1.0'],
            ]
        
        when:
        def responsePayload = OpencdsClient.sendEvaluateMessage(params, input)
        
        then:
        def e = thrown(SoapFaultClientException)
        def detailEntry = e.soapFault.faultDetail.detailEntries.next()
        detailEntry.name.toString() == '{http://www.omg.org/spec/CDSS/201105/dss}UnrecognizedScopedEntityException'
    }

}
