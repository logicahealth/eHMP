define([
    'app/resources/fetch/community_health_summaries/model',
    'app/resources/fetch/community_health_summaries/collection'
], function(CommunityHealthSummary, CommunityHealthSummaries) {
    'use strict';

    return {
        Model: CommunityHealthSummary,
        Collection: CommunityHealthSummaries
    };
});
