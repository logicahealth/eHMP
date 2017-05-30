define([
    'underscore'
], function(_) {
    'use strict';

    var RESOURCE = 'operational-data-by-uid-getData';

    var userCollection = ADK.Resources.Collection.extend({
        model: ADK.Resources.Model,
        fetchCollection: function(uids) {
            this.numberOfUids = uids.length;
            this.reset();

            _.each(uids, _.bind(function(uid) {
                var fetchOptions = {
                    resourceTitle: RESOURCE,
                    criteria: {
                        uid: uid
                    },
                    onSuccess: _.bind(function(collection) {
                        if (!collection.isEmpty()) {
                            this.add(collection.first());
                        }

                        if (this.numberOfUids === this.length) {
                            this.trigger('sync', this);
                        }
                    }, this)
                };

                ADK.PatientRecordService.fetchCollection(fetchOptions);
            }, this));
        }
    });

    return userCollection;
});