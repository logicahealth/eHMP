package org.opencds.plugin

import org.opencds.plugin.PluginContext.PostProcessPluginContext
import org.opencds.plugin.support.PluginDataCacheImpl
import org.opencds.vmr.v1_0.internal.EvalTime
import org.opencds.vmr.v1_0.internal.EvaluatedPerson
import org.opencds.vmr.v1_0.internal.FocalPersonId

import spock.lang.Specification

class AssertionsPluginSpec extends Specification {
    static final CONCEPTS = 'src/test/resources/concepts.txt'
    
    Map allFactLists
    Map namedObjects
    Set assertions
    Map results
    Map supportingData
    PluginDataCache cache

    def setup() {
        namedObjects = [:]
        cache = Mock()
        results = [:]
        supportingData = [:]
        allFactLists = [
            (EvalTime): [
                new EvalTime(evalTimeValue : new Date())
            ],
            (EvaluatedPerson) : [
                new EvaluatedPerson(id : UUID.randomUUID() as String)
            ],
            (FocalPersonId) : [
                new FocalPersonId(UUID.randomUUID() as String)]
        ]
        def p = new Properties()
        p.load(new StringReader(new File(CONCEPTS).text))
    }

    def "test concepts"() {
        given:
        assertions = ['C103', 'C10', 'C50']
        PostProcessPluginContext context = PluginContext.createPostProcessPluginContext(
                allFactLists, namedObjects, assertions, results, supportingData, cache)
        
        
        and:
        0 * _._

        when:
        new AssertionsPlugin().execute(context)
        
        then:
        println context.namedObjects
        context.resultFactLists.ObservationResult != null
        context.resultFactLists.ObservationResult.size() > 0
        context.resultFactLists.ObservationResult[0].observationValue.text == 'C10=|C103=|C50='
    }
    
    def "test OpenCDS concepts"() {
        given:
        assertions = ['C103', 'C10', 'C50']
        supportingData = ['concepts' : SupportingData.create('concepts', 'kmid', 'pkgid', 'properties', new File(CONCEPTS).text)]
        cache = new PluginDataCacheImpl() 
        PostProcessPluginContext context = PluginContext.createPostProcessPluginContext(
                allFactLists, namedObjects, assertions, results, supportingData, cache)
        
        and:
        0 * _._

        when:
        new AssertionsPlugin().execute(context)
        
        then:
        println context.namedObjects
        context.resultFactLists.ObservationResult != null
        context.resultFactLists.ObservationResult.size() > 0
        context.resultFactLists.ObservationResult[0].observationValue.text == 'C10=|C103=|C50='
    }
    
}
