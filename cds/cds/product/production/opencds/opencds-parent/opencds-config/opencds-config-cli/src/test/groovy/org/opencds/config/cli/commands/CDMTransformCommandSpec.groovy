package org.opencds.config.cli.commands

import spock.lang.Specification

class CDMTransformCommandSpec extends Specification {
	
	
	def "test xml to psv"() {
		given:
		def input = new FileInputStream('src/test/resources/cdm.xml')
		def output = new FileOutputStream('src/test/resources/my-output.psv') // System.out
		Closure command = new  CDMTransformCommand(input, output, 'spec').cdmToPsv
		
		when:
		command()
		
		then:
		true
	}
	
	def "test psv to xml"() {
//		given:
		def input = new FileInputStream('src/test/resources/cdm-test.psv')
		def output = new FileOutputStream('src/test/resources/cdm-test.xml')
		Closure command = new CDMTransformCommand(input, output, 'spec').psvToCdm
		
//		when:
		command()
		
//		then:
		true
	}
}
