define([
    "app/applets/activeMeds/gistConfig",
    "app/applets/activeMeds/medicationCollectionHandler"
], function(GistConfig, CollectionHandler) {
    "use strict";

    var GistView = ADK.AppletViews.InterventionsGistView.extend({
        initialize: function(options) {
            this._super = ADK.AppletViews.InterventionsGistView.prototype;
            var patientType = ADK.PatientRecordService.getCurrentPatient().patientStatusClass();

            this.appletOptions = {
                filterFields: GistConfig.filterFields,
                gistModel: GistConfig.gistModel,
                collection: CollectionHandler.fetchMedsCollection(GistConfig.fetchOptions, patientType, 'gist'),
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

            var filtered = _.filter(this.appletOptions.collection.originalModels,function(item) {
                var filterString = '';
                _.each(self.appletOptions.filterFields, function(field) {
                    var products = item.products;
                    if (field === 'drugClassName') {
                        var productLength = products !== undefined ? products.length : 0;
                        for (var i = 0; i < productLength; i++) {
                            if (products[i].drugClassName !== undefined) {
                                filterString = filterString + ' ' + products[i].drugClassName;
                            }
                        }
                    } else {
                        filterString = filterString + ' ' + item[field];
                    }

                });
                if (search) {
                    return search.test(filterString);
                } else {
                    return true;
                }
            });
            this.appletOptions.collection.reset(filtered);

        },
        onClearCustomFilter: function(search) {
            this.appletOptions.collection.reset(this.appletOptions.collection.originalModels);
            if (search) {
                this.onCustomFilter(search);
            }
        }
    });

    return GistView;
});