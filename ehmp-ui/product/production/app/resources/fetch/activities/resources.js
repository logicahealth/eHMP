define([
    'app/resources/fetch/activities/model',
    'app/resources/fetch/activities/collection',
	'app/resources/fetch/activities/instanceModel',
    'app/resources/fetch/activities/instanceCollection',
    'app/resources/fetch/activities/startActivity',
    'app/resources/fetch/activities/detailsCollection'
], function(Model, Collection, InstanceModel, InstanceCollection, StartActivity, DetailsCollection) {
    'use strict';
    return {
        Model: Model,
        Collection: Collection,
		InstanceModel: InstanceModel,
        InstanceCollection: InstanceCollection,
        StartActivity: StartActivity,
        DetailsCollection: DetailsCollection
    };
});