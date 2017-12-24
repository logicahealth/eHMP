define([
    'moment',
    'app/resources/picklist/video_visits/collection'
], function(Moment, BaseCollection) {
    'use strict';

    var Instructions = BaseCollection.extend({
        resource: 'video-visit-instructions-get',
        cache: false,
        parse: function(response, options) {
            var results = BaseCollection.prototype.parse.apply(this, arguments);
            results.push({ title: 'Other' });
            return results;
        }
    });

    return Instructions;
});