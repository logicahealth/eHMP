define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/military_hist/eventHandler',
    'app/applets/military_hist/appConfig'
], function(Backbone, Marionette, _, Handlebars, EventHandler, Config) {
    "use strict";

    var currentPatient = ADK.PatientRecordService.getCurrentPatient();
    var columns = {
        summary: [{
            name: 'displayName',
            label: 'Name',
            cell: 'string'
        }, {
            name: 'description',
            label: 'Description',
            cell: 'string'
        }],
        expanded: [{
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
        }]
    };





    var channel = ADK.Messaging.getChannel('military_hist');


    var applet = ADK.AppletViews.GridView.extend({
        _super: ADK.AppletViews.GridView.prototype,
        initialize: function(options) {
            var fetchOptionsGet = {
                resourceTitle: 'patient-meta-get',
                patient: currentPatient,
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
                    }
                }
            };
            this.viewType = options.appletConfig.viewType;
            this.collection = ADK.PatientRecordService.fetchCollection(fetchOptionsGet);
            this.appletOptions = {
                columns: columns[this.viewType],
                collection: this.collection,
                onClickRow: this.onClickRow,
                tblRowSelector: '#data-grid-' + this.options.appletConfig.instanceId + ' tbody tr'
            };

            this.listenTo(channel, 'noInfoButton', function() {
                return true;
            });
            this.listenTo(channel, 'editView', function(channelObj) {
                var mockmodel = channelObj.model.clone();
                this.listenTo(mockmodel, 'custom_save', function(model) {
                    channelObj.model.set(model.attributes);
                    this.collectionSave(channelObj.collection);
                });
                EventHandler.showEditView.call(this, mockmodel);
            });
            this._super.initialize.apply(this, arguments);
            //end of initialize
        },
        onClickRow: function(model) {
            EventHandler.showDetailsView.call(this, model);
        },
        collectionSave: function(collection) {
            var id = '',
                patient = ADK.PatientRecordService.getCurrentPatient();

            // Get the pid param in the same way as ADK.PatientRecordService.fetchCollection does
            collection.url = ADK.ResourceService.buildUrl('patient-meta-edit', {
                pid: patient.get('pid') || patient.get('icn') || patient.get('id') || ""
            });
            collection.sync('update', collection);
        }

    });

    return applet;
    //end of function

    function overridedisplayNames(data) {
        return _.map(data, function(d) {
            d.displayName = Config.displayNames[d.name] || d.displayName;
            return d;
        });
    }
});