define([
    'moment',
    'app/resources/fetch/video_visits/collection'
], function(Moment, BaseCollection) {
    'use strict';

    var Timezone = BaseCollection.extend({
        resource: 'video-visit-facility-timezone-get'
    });

    return Timezone;
});