package org.opencds.config.client.util;

import javax.ws.rs.core.MediaType;

import org.opencds.config.cli.util.ResourceUtil;

import spock.lang.Specification

class ResourceUtilSpec extends Specification {
    private static final String EXEC_ENG_XML = "src/test/resources/executionEngines.xml"
    private static final String KM_PKG = "src/test/resources/org.opencds^bounce^1.5.5.drl"
 
    def "get contents of the xml file into the map"() {
        given:
        def data = EXEC_ENG_XML
        
        when:
        def result = ResourceUtil.get(data)
        
        then:
        result.input
        result.input instanceof String
        result.mediaType == MediaType.APPLICATION_XML
        result.type == 'executionEngines'
    }
    
    def "get contents of a file that is not found returns FileNotFoundException"() {
        given:
        def data = "I_dont_exist"
        
        when:
        def result = ResourceUtil.get(data)
        
        then:
        result == null
        thrown(Exception)
    }
    
    def "get contents of the knowledgePackage file into the map"() {
        given:
        def data = KM_PKG
        
        when:
        def result = ResourceUtil.get(data)
        
        then:
        result.input
        result.input instanceof FileInputStream
        result.mediaType == MediaType.APPLICATION_OCTET_STREAM
        
        and:
        result.input.close()
    }

}
