define([], function() {

    'use strict';

    return (function() {

        var LAB_DATA_FIELDS = [
            'availableLabTests',
            'labTestText',
            'collectionTime',
            'collectionDate',
            'collectionType',
            'collectionSample',
            'otherCollectionSample',
            'immediateCollectionDate',
            'immediateCollectionTime',
            'collectionDateTimePicklist',
            'howOften',
            'howLong',
            'specimen',
            'otherSpecimen',
            'urgency',
            'urgencyText',
            'forTest',
            'doseDate',
            'doseTime',
            'drawDate',
            'drawTime',
            'orderComment',
            'anticoagulant',
            'sampleDrawnAt',
            'urineVolume',
            'orderComment',
            'additionalComments',
            'annotation',
            'problemRelationship',
            'activity',
            'notificationDate',
            'pastDueDate',
            'isActivityEnabled'
        ];

        var LAB_CONTENT_VALIDATION_FIELDS = [
            'availableLabTests',
        ];

        var populateModel = function() {
            var data = this.get('data') || {};
            var labTestText = (data.labTestText || '');
            var urgencyText = (data.urgencyText || '');
            var displayName = (labTestText + ' - ' + urgencyText);
            return {
                displayName: displayName
            };
        };

        return {
            DATA_FIELDS: LAB_DATA_FIELDS,
            CONTENT_VALIDATION_FIELDS: LAB_CONTENT_VALIDATION_FIELDS,
            populateModel: populateModel
        };
    })();
});
