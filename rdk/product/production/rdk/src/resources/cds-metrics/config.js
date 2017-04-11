'use strict';

module.exports = {
    metricDbName: 'metric',
    /*
     * definedMetricDefinitions represents descriptor data that must be seeded in Mongo DB before metrics can be queried for in the CDS Metrics Dashboard.
     * These definitions are static because they require code support to be of any use.  Any time a new metric is supported through code, a descriptor must
     * be created before it can be queried.  NOTE: while the CDS Dashboard Metrics API supports the manipulation of these definition values through REST calls,
     * it is recommended that these definitions are modified in this file, due to the mentioned code support required.
     */
    definedMetricDefinitions: [{
        _id: 1,
        name: 'SessionCount',
        description: 'Number of Drools Sessions Created.',
        unitOfMeasure: 'Count',
        updateInterval: '60000',
        origins: [],
        invocationTypes: [],
        property: 'value',
        aggregation: ['count', 'min', 'max', 'avg', 'sum'],
        collection: 'observation'
    }, {
        _id: 2,
        name: 'Execution_Begin',
        description: 'Rules that started execution.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: ['EngineOne', 'SystemB'],
        invocationTypes: ['Direct', 'Background'],
        type: 'engine',
        event: 'begin',
        aggregation: ['count'],
        collection: 'metrics'
    }, {
        _id: 3,
        name: 'Execution_End',
        description: 'Rules that ended execution.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: ['EngineOne', 'SystemB'],
        invocationTypes: ['Direct', 'Background'],
        type: 'engine',
        event: 'end',
        aggregation: ['count'],
        collection: 'metrics'
    }, {
        _id: 6,
        name: 'Invocation_Begin',
        description: 'Invocations that have started.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: [],
        invocationTypes: ['Direct', 'Background'],
        type: 'invoke',
        event: 'begin',
        aggregation: ['count'],
        collection: 'metrics'
    }, {
        _id: 7,
        name: 'Invocation_End',
        description: 'Invocations that have ended.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: [],
        invocationTypes: ['Direct', 'Background'],
        type: 'invoke',
        event: 'end',
        aggregation: ['count'],
        collection: 'metrics'
    }, {
        _id: 8,
        name: 'Summary_Total',
        description: 'Summary, total timings report.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: [],
        invocationTypes: ['Direct', 'Background'],
        type: 'invoke',
        event: 'summary',
        property: 'timings.total',
        aggregation: ['count', 'min', 'max', 'avg', 'sum'],
        collection: 'metrics'
    }, {
        _id: 9,
        name: 'Summary_CallSetup',
        description: 'Summary, callSetup timings report.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: [],
        invocationTypes: ['Direct', 'Background'],
        type: 'invoke',
        event: 'summary',
        property: 'timings.callSetup',
        aggregation: ['count', 'min', 'max', 'avg', 'sum'],
        collection: 'metrics'
    }, {
        _id: 10,
        name: 'Summary_InEngines',
        description: 'Summary, inEngines timings report.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: [],
        invocationTypes: ['Direct', 'Background'],
        type: 'invoke',
        event: 'summary',
        property: 'timings.inEngines',
        aggregation: ['count', 'min', 'max', 'avg', 'sum'],
        collection: 'metrics'
    }, {
        _id: 11,
        name: 'Summary_HandlingResults',
        description: 'Summary, handlingResults timings report.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: [],
        invocationTypes: ['Direct', 'Background'],
        type: 'invoke',
        event: 'summary',
        property: 'timings.handlingResults',
        aggregation: ['count', 'min', 'max', 'avg', 'sum'],
        collection: 'metrics'
    }, {
        _id: 12,
        name: 'Summary_TotalResults',
        description: 'Summary, handlingResults timings report.',
        unitOfMeasure: 'Count',
        updateInterval: '15000',
        origins: [],
        invocationTypes: ['Direct', 'Background'],
        type: 'invoke',
        event: 'summary',
        property: 'totalResults',
        aggregation: ['count', 'min', 'max', 'avg', 'sum'],
        collection: 'metrics'
    }],
    /*
     *  definedMetricGroups represents seed data for metrics groups.
    */
    definedMetricGroups: [{
        'name': 'All Metrics',
        'description': 'A list of all metric definitions currently available',
        'metricList': [
            'SessionCount',
            'Execution_Begin',
            'Execution_End',
            'Invocation_Begin',
            'Invocation_End',
            'Summary_Total',
            'Summary_CallSetup',
            'Summary_InEngines',
            'Summary_HandlingResults',
            'Summary_TotalResults'
        ]
    }],

};
