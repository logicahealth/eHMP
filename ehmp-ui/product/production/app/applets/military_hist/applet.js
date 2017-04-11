define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'async',
    'app/applets/military_hist/views/modalEditView',
    'app/applets/military_hist/views/modalDetailsView',
    'app/applets/military_hist/appConfig'
], function(Backbone, Marionette, _, Handlebars, moment, async, ModalEditView, ModalDetailsView, Config) {
    "use strict";

    function getSiteDisplayName(siteCode, siteMap) {
        var site;
        if (siteCode && siteMap && siteMap.items && siteMap.items.length > 0) {
            site = _.find(siteMap.items, {
                siteCode: siteCode
            });
        }
        return (site) ? (site.name || '') : '';
    }

    function preProcessData(data, currentVersion) {
        var ret = _.map(data, function(d) {
            if (d.version === currentVersion) {
                d.displayName = Config.displayNames[d.name] || d.displayName;
                var touchedOnDisplay = moment(d.touchedOn).format('MM/DD/YYYY');
                d.touchedOnDisplay = (touchedOnDisplay !== 'Invalid date') ? touchedOnDisplay : '';
                d.applet_id = d.appletId;
            } else {
                //this is the old version (only two versions now)
                d.displayName = Config.displayNames[d.name] || d.displayName;
                d.siteDisplayName = d.location;
                d.touchedByName = d.modifiedBy;
                d.touchedOnDisplay = d.modifiedOn;
            }
            return d;
        });
        return ret;
    }

    function postProcessData(collection) {
        _.each(collection.models, function(model) {
            //updating model before save
            model.unset('touchedByName', {
                silent: true
            });
            model.unset('siteDisplayName', {
                silent: true
            });
            model.set('appletId', model.get('applet_id'));
            model.unset('applet_id', {
                silent: true
            });
            model.unset('touchedOnDisplay', {
                silent: true
            });
            model.unset('displayName', {
                silent: true
            });

            //update old versions data model
            if (model.get('edited')) {
                model.unset('edited', {
                    silent: true
                });
                //this is the old data model version
                var removables = ['location', 'modifiedBy', 'modifiedOn'];
                _.each(removables, function(r) {
                    model.unset(r, {
                        silent: true
                    });
                });
                model.set('version', DATA_VERSION);
            }

        });
        return collection;
    }



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
            name: 'touchedOnDisplay',
            label: 'Last Modified',
            cell: 'string'
        }, {
            name: 'siteDisplayName',
            label: 'Location',
            cell: 'string'
        }, {
            name: 'touchedByName',
            label: 'Modified By'
        }]
    };

    var CHANNEL_NAME = 'military_hist';
    var DATA_VERSION = '2.0.r01';
    var appletView = ADK.AppletViews.GridView.extend({
        _super: ADK.AppletViews.GridView.prototype,
        initialize: function(options) {
            this.channel = ADK.Messaging.getChannel(CHANNEL_NAME);
            var sitesFetchOptions = {
                resourceTitle: 'authentication-list'
            };
            var usersFetchOptions = {
                resourceTitle: 'user-service-userinfo-byUid'
            };
            var fetchOptionsGet = {
                resourceTitle: 'patient-meta-get',
                cache: true,
                patient: ADK.PatientRecordService.getCurrentPatient(),
                fetchType: 'GET',
                pageable: false,
                onSuccess: function(meta) {
                    var uids = _.pluck(meta.models, 'attributes.touchedBy');
                    _.remove(uids, function(meta) {
                        return _.isEmpty(meta);
                    });
                    var tasks = [];
                    _.each(uids, function(uid) {
                        var fetchOptions = _.extend({}, usersFetchOptions, {
                            criteria: {
                                uid: uid
                            },
                            onSuccess: function(options, result) {
                                options.fetchOptions.cb(null, result.data);
                            }
                        });
                        tasks.push(function(callback) {
                            _.extend(fetchOptions, {
                                cb: callback
                            });
                            ADK.ResourceService.fetchCollection(fetchOptions);
                        });
                    });
                    //last function gets the sites
                    tasks.push(function(callback) {
                        var fetchOptions = _.extend({}, sitesFetchOptions, {
                            onSuccess: function(options, result) {
                                callback(null, result.data);
                            },
                            onError: function(options, err) {
                                callback(err);
                            }
                        });
                        ADK.ResourceService.fetchCollection(fetchOptions);
                    });
                    async.parallel(tasks, _.bind(function(err, results) {
                        var siteMap = results.pop();

                        _.each(this.models, function(model) {
                            var nameParts;
                            var user = _.find(results, {
                                uid: model.get('touchedBy')
                            });
                            if (user) {
                                nameParts = user.name.split(',');
                                if (nameParts.length > 1) {
                                    model.set({
                                        touchedByName: nameParts[1] + ' ' + nameParts[0]
                                    });
                                }
                            }
                            //only set displayname if data version matches
                            if (model.get('version') === DATA_VERSION) {
                                model.set('siteDisplayName', getSiteDisplayName(model.get('siteHash'), siteMap));
                            }
                        });
                    }, meta));
                },
                collectionConfig: {
                    collectionParse: function(col) {
                        var defaults = Config.getDefaults(DATA_VERSION);

                        if (col.models[0]) {
                            if (col.models[0].get('status') === 202) {
                                //patient data not found, returning defaults
                                return defaults;
                            }
                            var val = col.models[0].get('val');

                            return preProcessData(val, DATA_VERSION);
                        }
                    },
                    model: Backbone.Model.extend({
                        defaults: {
                            'applet_id': CHANNEL_NAME
                        }
                    })
                }
            };
            this.viewType = options.appletConfig.viewType;
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
                this.appletOptions.columns = columns.expanded;
            } else {
                this.appletOptions.columns = columns.summary;
            }

            this.listenTo(this.channel, 'editView', function(channelObj) {
                if (this.isLocalPatient()) {
                    var mockmodel = channelObj.model.clone();
                    this.listenTo(mockmodel, 'custom_save', function(model) {
                        channelObj.model.set(model.attributes);
                        this.collectionSave(channelObj.collection || this.collection, model);
                    });
                    this.showEditView(mockmodel);
                } else {
                    this.showPatientLocalityError();
                }
            });
            this.listenTo(this.channel, 'detailView', function(channelObj) {
                this.onClickRow(channelObj.model);
            });
            this.listenTo(this.channel, 'applet:refresh', this.refresh);
            this._super.initialize.apply(this, arguments);
            //end of initialize
        },
        onClickRow: function(model) {
            this.getDetailsModal(model);
        },
        showEditView: function(model) {
            var options = {
                size: "small",
                title: 'Edit Military History',
                showProgress: false,
                keyboard: true,
                steps: [{
                    view: ModalEditView,
                    viewModel: model
                }]
            };
            var workflow = new ADK.UI.Workflow(options);
            workflow.show();
        },
        getDetailsModal: function(model) {
            var detailsView = new ModalDetailsView({
                model: model
            });
            var modalView = new ADK.UI.Modal({
                view: detailsView,
                options: {
                    size: "medium",
                    title: model.get('displayName'),
                    keyboard: true,
                    nextPreviousCollection: this.collection,
                },
                callbackView: this

            });
            modalView.show();
        },
        showPatientLocalityError: function() {
            var errorMessage = 'Editing has been disabled. Please login to the Home Site of the Patient to edit';
            var errorAlertView = new ADK.UI.Notification({
                title: 'Non-Local Patient',
                message: errorMessage,
                type: 'warning',
                autoClose: false
            });
            errorAlertView.show();
        },
        isLocalPatient: function() {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var userSession = ADK.UserService.getUserSession();
            var pid = currentPatient.get('pid');
            var patientSite = pid.split(';')[0];
            var userSite = userSession.get('site');
            if (patientSite === userSite) {
                return true;
            } else {
                return false;
            }
        },
        collectionSave: function(collection, model) {
            model.unset('errorMessage');

            postProcessData(collection);

            //clear cacche before saving
            //using ResourceService because PatientRecordService doesn't have a cache control method (yet).
            ADK.ResourceService.clearCache(this.collection.url);
            var id = '',
                patient = ADK.PatientRecordService.getCurrentPatient();

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
            collection.sync('update', collection, {
                success: function() {
                    ADK.UI.Workflow.hide();
                    ADK.Messaging.getChannel(CHANNEL_NAME).trigger('applet:refresh');
                },
                error: function(err) {
                    var errorMessage = '';
                    try {
                        errorMessage = JSON.parse(err.responseText).message;
                    } catch (e) {
                        errorMessage = err.responseText;
                    }
                    model.set('errorMessage', errorMessage);
                    ADK.Messaging.getChannel(CHANNEL_NAME).trigger('applet:refresh');
                }
            });
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