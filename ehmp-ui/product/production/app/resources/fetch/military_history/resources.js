define([
    'app/resources/fetch/military_history/meta_model',
    'app/resources/fetch/military_history/meta_collection',
    'app/resources/fetch/military_history/site_collection',
    'app/resources/fetch/military_history/user_collection'
], function(MetaModel, MetaCollection, SiteCollection, UserCollection) {
    'use strict';

    return {
        MetaModel: MetaModel,
        MetaCollection: MetaCollection,
        SiteCollection: SiteCollection,
        UserCollection: UserCollection
    };
});
