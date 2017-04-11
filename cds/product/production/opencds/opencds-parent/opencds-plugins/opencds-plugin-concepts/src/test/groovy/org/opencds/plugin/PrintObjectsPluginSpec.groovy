package org.opencds.plugin

import org.opencds.plugin.PluginContext.PostProcessPluginContext
import org.opencds.vmr.v1_0.internal.EvalTime
import org.opencds.vmr.v1_0.internal.EvaluatedPerson
import org.opencds.vmr.v1_0.internal.FocalPersonId
import org.opencds.vmr.v1_0.internal.ObservationResult

import spock.lang.Specification

class PrintObjectsPluginSpec extends Specification {

    Map allFactLists
    Map namedObjects
    Set assertions
    Map results
    Map supportingData
    PluginDataCache cache

    def setup() {
        namedObjects = [:]
        results = [:]
        cache = Mock()
        assertions = Mock()
        supportingData = Mock()
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
    }

    def "test concepts"() {
        given:
        namedObjects << ['C123:C201:B' : 'C']
        namedObjects << ['C234:C354:E' : 'F']
        namedObjects << ['pattern that does not match' : 1]
        results << [ObservationResult : []]
        PostProcessPluginContext context = PluginContext.createPostProcessPluginContext(
                allFactLists, namedObjects, assertions, results, supportingData, cache)

        and:
        0 * _._

        when:
        new PrintObjectsPlugin().execute(context)

        then:
        context.resultFactLists.ObservationResult != null
        context.resultFactLists.ObservationResult.size() > 0
        context.resultFactLists.ObservationResult[0].observationValue.text == 'C123:C201:B:C|C234:C354:E:F'
    }
}
