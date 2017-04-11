define([], function() {
    'use strict';

    return (function() {
        var REQUEST_DATA_FIELDS = [
            'urgency',
            'earliest',
            'latest',
            'title',
            'assignment',
            'facility',
            'person',
            'requestDetails'
        ];

        var REQUEST_CONTENT_VALIDATION_FIELDS = [
        ];

        var populateModel = function() {
            var data = this.get('data') || {};
            var displayName = (data.title || '');
            return {
                displayName: displayName
            };
        };

        return {
            DATA_FIELDS: REQUEST_DATA_FIELDS,
            CONTENT_VALIDATION_FIELDS: REQUEST_CONTENT_VALIDATION_FIELDS,
            populateModel: populateModel
        };
    })();
});
