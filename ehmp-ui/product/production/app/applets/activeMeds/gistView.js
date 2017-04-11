define([
    "app/applets/activeMeds/gistConfig",
    "app/applets/activeMeds/medicationCollectionHandler",
], function(GistConfig, CollectionHandler) {
    "use strict";

    var GistView = ADK.AppletViews.InterventionsGistView.extend({
        initialize: function(options) {
            var self = this;
            this._super = ADK.AppletViews.InterventionsGistView.prototype;
            var patientType = ADK.PatientRecordService.getCurrentPatient().patientStatusClass();

            this.appletOptions = {
                filterFields: GistConfig.filterFields,
                gistModel: GistConfig.gistModel,
                collection: CollectionHandler.fetchMedsCollection(GistConfig.fetchOptions, patientType, 'gist'),
                collectionParser: GistConfig.transformCollection,
                gistHeaders: GistConfig.gistHeaders,
                enableTileSorting: true,
                onClickRow: function(model, event) {
                    var uid = model.get('uid');
                    var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                    ADK.Messaging.getChannel("activeMeds").trigger('detailView', {
                        uid: uid,
                        patient: {
                            icn: currentPatient.attributes.icn,
                            pid: currentPatient.attributes.pid
                        }
                    });
                }
            };
            this.listenTo(this.appletOptions.collection, 'customfilter', this.onCustomFilter);
            this.listenTo(this.appletOptions.collection, 'clear_customfilter', this.onClearCustomFilter);


            this._super.initialize.apply(this, arguments);
        },
        onCustomFilter: function(search) {
            var self = this;
            if (GistConfig.shadowCollection === undefined) {
                return;
            }

            var filtered = GistConfig.shadowCollection.filter(function(item) {
                var filterString = '';
                _.each(self.appletOptions.filterFields, function(field) {
                    if (field === 'drugClassName') {
                        var productLength = item.get('products') !== undefined ? item.get('products').length : 0;
                        for (var i = 0; i < productLength; i++) {
                            if (item.get('products')[i].drugClassName !== undefined) {
                                filterString = filterString + ' ' + item.get('products')[i].drugClassName;
                            }
                        }
                    } else {
                        filterString = filterString + ' ' + item.get(field);
                    }

                });
                if (search) {
                    return search.test(filterString);
                } else {
                    return true;
                }
            });
            var filteredCollection = new Backbone.Collection();
            filteredCollection.reset(filtered);
            this.appletOptions.collection.reset(filteredCollection.models);
        },
        onClearCustomFilter: function(search) {
            this.appletOptions.collection.reset(GistConfig.shadowCollection.models);
            if (search) {
                this.onCustomFilter(search);
            }
        }
    });

    return GistView;
});