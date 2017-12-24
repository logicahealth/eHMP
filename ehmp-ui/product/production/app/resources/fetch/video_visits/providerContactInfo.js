define([
    'moment',
    'app/resources/fetch/video_visits/collection'
], function(Moment, BaseCollection) {
    'use strict';

    var ProviderContactInfo = BaseCollection.extend({
        resource: 'video-visit-provider-contact-get',
        cache: false
    });

    return ProviderContactInfo;
});