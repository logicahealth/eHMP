package org.opencds.config.service.security;

import org.opencds.config.api.xml.JAXBContextService;

import spock.lang.Specification

class UserDetailsServiceImplIntegrationSpec extends Specification {

    UserDetailsServiceImpl service

    def "build a test configuration and find a user"() {
        given:
        def location = "src/test/resources/config-security.xml"
        def jaxbcs = new JAXBContextService()
        def username = "username"

        when:
        service = new UserDetailsServiceImpl(jaxbcs, location)
        
        and:
        def result = service.loadUserByUsername(username)

        then:
        result
        result.username == 'username'
        result.password == 'password'
        result.enabled
        result.authorities.authority == ['ROLE_CONFIG_USER']
        
        and:"default spring-required values are appropriately valued"
        result.accountNonExpired == true
        result.accountNonLocked == true
        result.credentialsNonExpired == true
    }
}
