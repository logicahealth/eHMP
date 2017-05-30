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
        if (siteCode && !siteMap.isEmpty()) {
            site = siteMap.find({
                siteCode: siteCode
            });
        }
        return (site) ? (site.get('name') || '') : '';
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
                model.set('version', Config.DATA_VERSION);
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

    var appletView = ADK.AppletViews.GridView.extend({
        _super: ADK.AppletViews.GridView.prototype,
        initialize: function(options) {
            this.channel = ADK.Messaging.getChannel(Config.CHANNEL_NAME);
            this.collection = new ADK.UIResources.Fetch.MilitaryHistory.MetaCollection();
            this.collection.fetchCollection();

            this.sites = new ADK.UIResources.Fetch.MilitaryHistory.SiteCollection();
            this.bindEntityEvents(this.sites, this.siteCollectionEvents);

            this.viewType = options.appletConfig.viewType;
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
        collectionEvents: {
            'sync': function() {
                if (this.columnsViewType === 'expanded') {
                    this.sites.fetchCollection();

                    var uids = _.pluck(this.collection.models, 'attributes.touchedBy');

                    _.remove(uids, function(uid) {
                        return _.isEmpty(uid);
                    });

                    uids = _.uniq(uids);
                    this.numberOfUsers = uids.length;

                    this.userCollection = new ADK.UIResources.Fetch.MilitaryHistory.UserCollection();
                    this.bindEntityEvents(this.userCollection, this.userCollectionEvents);
                    this.userCollection.fetchCollection(uids);
                }
            }
        },
        siteCollectionEvents: {
            'sync': function() {
                this.collection.each(function(metaDataModel) {
                    if (metaDataModel.get('version') === Config.DATA_VERSION) {
                        metaDataModel.set('siteDisplayName', getSiteDisplayName(metaDataModel.get('siteHash'), this.sites));
                    }
                }, this);
            }
        },
        userCollectionEvents: {
            'sync': function(collection) {
                this.collection.each(function(metaDataModel) {
                    var user = collection.find(function(user) {
                        return user.get('uid') === metaDataModel.get('touchedBy');
                    });

                    if (user) {
                        var nameParts = user.get('name').split(',');
                        if (!_.isEmpty(nameParts)) {
                            metaDataModel.set('touchedByName', nameParts[1] + ' ' + nameParts[0]);
                            return;
                        }
                    }

                    metaDataModel.set('touchedByName', '');
                }, this);
            }
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
                    nextPreviousCollection: this.collection
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

            // Get the pid param in the same way as ADK.PatientRecordService.fetchCollection does
            collection.url = ADK.ResourceService.buildUrl('patient-meta-edit', {
                pid: patient.get('pid') || patient.get('icn') || patient.get('id') || "",
                _ack: isAcknowledged
            });
            collection.sync('update', collection, {
                success: function() {
                    ADK.UI.Workflow.hide();
                    ADK.Messaging.getChannel(Config.CHANNEL_NAME).trigger('applet:refresh');
                },
                error: function(err) {
                    var errorMessage = '';
                    try {
                        errorMessage = JSON.parse(err.responseText).message;
                    } catch (e) {
                        errorMessage = err.responseText;
                    }
                    model.set('errorMessage', errorMessage);
                    ADK.Messaging.getChannel(Config.CHANNEL_NAME).trigger('applet:refresh');
                }
            });
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.sites, this.siteCollectionEvents);
            this.unbindEntityEvents(this.userCollection, this.userCollectionEvents);
        }
    });

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