package org.opencds.plugin

import org.opencds.plugin.PluginContext.PostProcessPluginContext
import org.opencds.vmr.v1_0.internal.EvalTime
import org.opencds.vmr.v1_0.internal.EvaluatedPerson
import org.opencds.vmr.v1_0.internal.FocalPersonId
import org.opencds.vmr.v1_0.internal.concepts.ProcedureConcept

import spock.lang.Specification

class ConceptsPluginSpec extends Specification {

    Map allFactLists
    Map namedObjects
    Set assertions
    Map supportingData
    PluginDataCache cache

    def setup() {
        namedObjects = [:]
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
        Map results = ["procedureConcepts" : [
                [Id: 'ONE', displayName: '1'] as ProcedureConcept,
                [Id: 'TWO', displayName: '2'] as ProcedureConcept
            ]]
        PostProcessPluginContext context = PluginContext.createPostProcessPluginContext(
                allFactLists, namedObjects, assertions, results, supportingData, cache)

        when:
        new ConceptsPlugin().execute(context)

        and:
        0 * _._

        then:
        context.resultFactLists.ObservationResult != null
        context.resultFactLists.ObservationResult.size() > 0
        context.resultFactLists.ObservationResult[0].observationValue.text == 'ONE=1|TWO=2'
    }
}
