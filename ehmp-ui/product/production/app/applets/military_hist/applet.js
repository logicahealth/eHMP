define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/military_hist/eventHandler',
    'app/applets/military_hist/appConfig'
], function(Backbone, Marionette, _, Handlebars, EventHandler, Config) {
    "use strict";

    var channelName = 'military_hist';
    var summaryColumns = [{
        name: 'displayName',
        label: 'Name',
        cell: 'string'
    }, {
        name: 'description',
        label: 'Description',
        cell: 'string'
    }];
    var expandedColumns = [{
        name: 'displayName',
        label: 'Name',
        cell: 'string'
    }, {
        name: 'description',
        label: 'Description',
        cell: 'string'
    }, {
        name: 'modifiedOn',
        label: 'Last Modified',
        cell: 'string'
    }, {
        name: 'location',
        label: 'Location',
        cell: 'string'
    }, {
        name: 'modifiedBy',
        label: 'Modified By'
    }];
    //var channel = ADK.Messaging.getChannel(channelName);
    var appletView = ADK.AppletViews.GridView.extend({
        _super: ADK.AppletViews.GridView.prototype,
        initialize: function(options) {
            this.channel = ADK.Messaging.getChannel(channelName);
            var fetchOptionsGet = {
                resourceTitle: 'patient-meta-get',
                cache: true,
                patient: ADK.PatientRecordService.getCurrentPatient(),
                fetchType: 'GET',
                pageable: false,
                collectionConfig: {
                    collectionParse: function(col) {
                        if (col.models[0]) {
                            if (col.models[0].get('status') === 202) {
                                //patient data not found, returning defaults
                                return Config.getDefaults().val;
                            }
                            return overridedisplayNames(col.models[0].get('val'));
                        }
                    },
                    model: Backbone.Model.extend({
                        defaults: {
                            'applet_id': channelName
                        }
                    })
                }
            };
            this.collection = ADK.PatientRecordService.fetchCollection(fetchOptionsGet);
            this.appletOptions = {
                collection: this.collection,
                onClickRow: this.onClickRow,
                tblRowSelector: '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr',
                toolbarOptions: {
                    buttonTypes: ['detailsviewbutton', 'editviewbutton']
                }
            };

            if (this.columnsViewType === 'expanded') {
                this.appletOptions.columns = expandedColumns;
            } else {
                this.appletOptions.columns = summaryColumns;
            }

            this.listenTo(this.channel, 'noInfoButton', function() {
                return true;
            });
            this.listenTo(this.channel, 'editView', function(channelObj) {
                var mockmodel = channelObj.model.clone();
                this.listenTo(mockmodel, 'custom_save', function(model) {
                    channelObj.model.set(model.attributes);
                    this.collectionSave(channelObj.collection || this.collection);
                });
                EventHandler.showEditView.call(this, mockmodel);
            });
            this.listenTo(this.channel, 'detailView', function(channelObj) {
                this.onClickRow(channelObj.model);
            });
            this.listenTo(this.channel, 'update-mh-View', function(collection) {
                if (this.collection !== collection) {
                    this.collection.set(collection.models);
                }
            });
            this._super.initialize.apply(this, arguments);
            //end of initialize
        },
        onClickRow: function(model) {
            EventHandler.showDetailsView.call(this, model);
        },
        collectionSave: function(collection) {
            //clear cacche before saving
            //using ResourceService because PatientRecordService doesn't have a cache control method (yet).
            ADK.ResourceService.clearCache(this.collection.url);
            var patient = ADK.PatientRecordService.getCurrentPatient();

            var isAcknowledged = false;
            if (patient.has("acknowledged")) {
                isAcknowledged = true;
            }

            var options = {
                wait: true
            };
            // Get the pid param in the same way as ADK.PatientRecordService.fetchCollection does
            collection.url = ADK.ResourceService.buildUrl('patient-meta-edit', {
                pid: patient.get('pid') || patient.get('icn') || patient.get('id') || "",
                _ack: isAcknowledged
            });
            collection.sync('update', collection, options).success(this.channel.trigger('update-mh-View', collection));

        }
    });

    function overridedisplayNames(data) {
        return _.map(data, function(d) {
            d.displayName = Config.displayNames[d.name] || d.displayName;
            return d;
        });
    }

    var applet = {
        id: 'military_hist',
        viewTypes: [{
            type: 'summary',
            view: appletView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: appletView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }],

        defaultViewType: 'summary'
    };
    return applet;
});