define([], function() {

    'use strict';

    return (function() {

        var LAB_DATA_FIELDS = [
            'availableLabTests',
            'labTestText',
            'collectionDateTime',
            'collectionDate',
            'collectionType',
            'collectionSample',
            'defaultCollSamp',
            'immediateCollectionDate',
            'immediateCollectionTime',
            'howOften',
            'howLong',
            'specimen',
            'urgency',
            'forTest',
            'doseDate',
            'doseTime',
            'drawDate',
            'drawTime',
            'orderComment',
            'anticoagulant',
            'sampleDrawnAt',
            'additionalComments',
            'annotation',
            'problemRelationship',
            'activity'
        ];

        var LAB_CONTENT_VALIDATION_FIELDS = [
            'availableLabTests',
        ];

        var populateModel = function() {
            var data = this.get('data') || {};
            return {
                displayName: (data.labTestText || '')
            };
        };

        return {
            DATA_FIELDS: LAB_DATA_FIELDS,
            CONTENT_VALIDATION_FIELDS: LAB_CONTENT_VALIDATION_FIELDS,
            populateModel: populateModel
        };
    })();
});
