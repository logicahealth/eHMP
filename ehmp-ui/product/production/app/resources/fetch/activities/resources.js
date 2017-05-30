define([
    'app/resources/fetch/activities/model',
    'app/resources/fetch/activities/collection',
	'app/resources/fetch/activities/instanceModel',
    'app/resources/fetch/activities/instanceCollection',
    'app/resources/fetch/activities/startActivity'
], function(Model, Collection, InstanceModel, InstanceCollection, StartActivity) {
    'use strict';
    return {
        Model: Model,
        Collection: Collection,
		InstanceModel: InstanceModel,
        InstanceCollection: InstanceCollection,
        StartActivity: StartActivity
    };
});