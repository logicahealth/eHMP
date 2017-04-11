define([
    'backbone',
    'jquery',
    'main/ui_components/alert/component',
    'api/ResourceService',
    'api/SessionStorage',
    'api/UserService',
    'api/Messaging',
    'api/Navigation',
    'api/UserDefinedScreens',
    'api/Checks',
    'api/PatientRecordService',
    'api/WorkspaceContextRepository'
], function (Backbone, $, UIAlert, ResourceService, SessionStorage, UserService,
    Messaging, Navigation, UserDefinedScreens, Checks, PatientRecordService, WorkspaceContextRepository) {
    'use strict';

    var CCOWService = {
        contextorControl: null,

        getTokenFromContextItems: function () {
            var contextItems = this.contextorControl.CurrentContext;
            var token = "~~TOK~~";
            var coll = new Enumerator(contextItems);
            if (!coll.atEnd()) {
                for (; !coll.atEnd(); coll.moveNext()) {
                    var itemName = coll.item().name;
                    var itemValue = coll.item().value;
                    if (itemName.indexOf("vistatoken") > 0) token += itemValue;
                }
            }
            return token;
        },
        getDfnFromContextItems: function () {
            var contextItems = this.contextorControl.CurrentContext;
            var dfn;
            var coll = new Enumerator(contextItems);
            if (!coll.atEnd()) {
                for (; !coll.atEnd(); coll.moveNext()) {
                    var itemName = coll.item().name;
                    var itemValue = coll.item().value;
                    if (itemName.indexOf("dfn") > 0) {
                        dfn = itemValue;
                        break;
                    }
                }
            }
            return dfn;
        },
        getDivisionFromContextItems: function () {
            var contextItems = this.contextorControl.CurrentContext;
            var division;
            var coll = new Enumerator(contextItems);
            if (!coll.atEnd()) {
                for (; !coll.atEnd(); coll.moveNext()) {
                    var itemName = coll.item().name;
                    var itemValue = coll.item().value;
                    //console.log('CCOW Item', itemName, itemValue);
                    if (itemName.indexOf("dfn") > 0) {
                        var itemArray = itemName.split('_');
                        division = itemArray && itemArray[1];
                        break;
                    }
                }
            }
            return division;
        },
        loadSessionObject: function (ccowObject) {
            var ccowSession = SessionStorage.getModel('ccow');
            ccowSession.set('pid', ccowObject.pid);
            ccowSession.set('state', 'listening');
            ccowSession.set('status', 'Connected');
            this.persistCcowSession(ccowSession);

        },
        persistCcowSession: function (ccowModel) {
            SessionStorage.clear('ccow');
            SessionStorage.addModel('ccow', ccowModel);
        },

        //Ensure ICN for patient
        ensureICNforPatient: function (dfn, callback) {
            var patientModel = new Backbone.Model();
            var sitePatientInfo;
            var icnRegex = /\d+V\d+/;
            if (dfn && dfn.indexOf(';') === -1) {
                if (icnRegex.test(dfn)) {
                    sitePatientInfo = dfn;
                } else {
                    sitePatientInfo = UserService.getUserSession().get('site') + ';' + dfn;
                }
            } else {
                sitePatientInfo = dfn;
            }
            patientModel.set('pid', sitePatientInfo);
            this.loadSessionObject({'pid' : dfn});

            var searchOptions = {
                resourceTitle: 'patient-search-pid',
                patient: patientModel
            };

            var self = this;

            searchOptions.onSuccess = function(patientDemographicsCollection, resp) {
                var patient = patientDemographicsCollection.find(function(item) {
                    return item.get('pid').indexOf(sitePatientInfo) === 0;
                });
                if (patient) {
                    Messaging.trigger('patient:selected', patient);
                    return callback && callback();
                }
                else {
                    //if no matches
                    self.loadSessionObject({pid: ''});
                    return callback && callback();
                }
            };

            PatientRecordService.fetchCollection(searchOptions);

        },
        getSiteInfo: function (callback) {
            var division;
            var contextItemDivision = this.getDivisionFromContextItems();
            contextItemDivision = contextItemDivision || UserService.getUserSession().get('division');

            //authentication-list
            var searchOptions = {
                resourceTitle: 'authentication-list',
                cache: true,
                onError: function (coll, resp) {
                    callback({
                        error: 'Site Info cannot be obtained'
                    });
                },
                onSuccess: function (coll, resp) {
                    if (resp.data && resp.data.items) {
                        var site = _.find(resp.data.items, function (siteInfo) {
                            division = siteInfo.stationNumber || siteInfo.division;
                            return division === contextItemDivision;
                        });
                        callback(site);
                    } else {
                        callback({
                            error: 'Site Info cannot be obtained'
                        });
                    }
                }
            };
            ResourceService.fetchCollection(searchOptions);
        },
        getPid: function (patient) {
            var parsePID = patient.get('pid');
            if (parsePID && parsePID.indexOf(';') > -1) {
                parsePID = parsePID.split(';')[1];
            }
            return parsePID;
        },
        handleContextChange: function (patient, callback) {
            var self = this;
            var parsePID = self.getPid(patient);

            if (parsePID === this.ccowSession.get('pid')) {
                return callback && callback();
            }

            if (self.contextorControl && self.contextorControl.State === 2) {
                var nameItem = new ActiveXObject("Sentillion.ContextItem.1");
                var localIdItem = new ActiveXObject("Sentillion.ContextItem.1");
                var nationalIdItem = new ActiveXObject("Sentillion.ContextItem.1");
                var contextCollection = new ActiveXObject("Sentillion.ContextItemCollection.1");
                try {
                    //patient name
                    nameItem.name = 'Patient.co.PatientName';
                    nameItem.value = patient.get('displayName') + '^^^^';
                    contextCollection.Add(nameItem);

                    self.getSiteInfo(function (response) {
                        if (response.error) {
                            self.updateCcowStatus('Disconnected', '');
                        } else {
                            self.updateCcowStatus('Connected');
                        }

                        self.contextorControl.StartContextChange();

                        //dfn
                        localIdItem.name = 'Patient.id.MRN.DFN_' + (response.stationNumber ||  response.division);
                        //Sometimes production key in json seems to have string value. This will ensure we are reading it right.
                        if (response.production.toString() === "false") {
                            localIdItem.name = localIdItem.name + '_TEST';
                        }

                        localIdItem.value = parsePID;
                        contextCollection.Add(localIdItem);
                        //icn
                        if (patient.get('icn') !== null) {
                            nationalIdItem.name = 'Patient.id.MRN.NationalIDNumber';
                            //Sometimes production key in json seems to have string value. This will ensure we are reading it right.
                            if (response.production.toString() === "false") {
                                nationalIdItem.name = nationalIdItem.name + '_TEST';
                            }
                            nationalIdItem.value = patient.get('icn');
                            contextCollection.Add(nationalIdItem);
                        }
                        var coll = new Enumerator(contextCollection);
                        for (; !coll.atEnd(); coll.moveNext()) {
                            var itemName = coll.item().name;
                            var itemValue = coll.item().value;
                            //console.log('Item', itemName, itemValue);
                        }
                        var contextResponse = self.contextorControl.EndContextChange(true, contextCollection);
                        if (contextResponse === 1) {
                            callback();
                        } else if (contextResponse === 2) {
                            callback(true);
                        } else {
                            self.updateCcowStatus('Suspended');
                            callback();
                        }

                    });
                } catch (e) {
                    self.updateCcowStatus('Disconnected');
                    callback();
                }
            } else {
                callback();
            }
        },

        updatePatientInfo: function () {
            var self = this;
            var dfn = this.getDfnFromContextItems();
            var parsePID = this.getPid(PatientRecordService.getCurrentPatient());
            if (!_.isUndefined(dfn) && (dfn !== parsePID)) {
                var currentWorkspaceAndContextModel = WorkspaceContextRepository.currentWorkspaceAndContext;
                var workspace = WorkspaceContextRepository.getDefaultScreenOfContext('staff');
                var failingChecks = Checks._checkCollection.models;
                Checks.unregister(failingChecks);
                ADK.UI.Workflow.hide();
                ADK.UI.Modal.hide();
                if (currentWorkspaceAndContextModel.get('context') !== 'staff') {
                    Navigation.navigate(workspace);
                    self.getSiteInfo(function (site) {
                        self.ensureICNforPatient(site.siteCode + ';' + dfn, false);
                    });

                } else {
                    self.getSiteInfo(function (site) {
                        self.ensureICNforPatient(site.siteCode + ';' + dfn, false);
                    });
                }
            }
        },
        formatPatientNameForContext: function (name) {
            var formattedName = name.replace(',', '^');
            formattedName = formattedName + '^^^^';
            return formattedName;
        },
        updateContextItems: function (pid, localId, name) {
            var ccowModel = SessionStorage.getModel('ccow');
            ccowModel.set('pid', pid);
            var contextItems = ccowModel.get('contextItems');

            for (var i = 0; i < contextItems.length; i++) {
                if (contextItems[i].name.indexOf('patient.id.mrn.dfn') > -1) {
                    contextItems[i].value = localId;
                } else if (contextItems[i].name.indexOf('patient.co.patientname') > -1) {
                    contextItems[i].value = name;
                }
            }

            ccowModel.set('contextItems', contextItems);
            SessionStorage.clear('ccow');
            SessionStorage.addModel('ccow', ccowModel);
        },
        suspendContext: function () {
            var me = this;
            try {
                this.contextorControl && this.contextorControl.Suspend();
                this.updateCcowStatus('Suspended', function () {
                       me.contextCallback('Disconnected');
                });
            } catch (e) {
                //console.log(e);
                this.updateCcowStatus('Disconnected', function () {
                       me.contextCallback('Disconnected', 'Error occurred during breaking context link. Try again later.');
                });
            }

        },
        resumeContext: function () {
            var me = this;
            try {
                this.contextorControl && this.contextorControl.Resume();
                this.updateCcowStatus('Connected', function () {
                    me.contextCallback('Connected');
                });
            } catch (e) {
                this.updateCcowStatus('Disconnected', function () {
                    me.contextCallback('Disconnected','Error occurred during rejoining context link. Try again later.');
                });
            }

        },
        updateCcowStatus: function (status, callback) {
            var ccowModel = SessionStorage.getModel('ccow');
            ccowModel.set('status', status);
            SessionStorage.clear('ccow');
            SessionStorage.addModel('ccow', ccowModel);
            this.ccowSession = SessionStorage.getModel('ccow');
            callback && callback();

        },
        getCccowStatusSecondary: function () {
            var status = (this.ccowSession && this.ccowSession.get('status')) || false;
            return status;
        },
        getCcowStatus: function () {
            this.ccowSession = SessionStorage.getModel('ccow');
            if ("ActiveXObject" in window) {
                if (_.isUndefined(this.ccowSession.get('status')) || this.ccowSession.get('state') === 'initial'){
                    //Launch CCOW in IE
                    Messaging.trigger('ccow:init');
                } else {
                    var status = this.ccowSession.get('status');
                    this.vaultStatus = (status === 'Connected' || status === 'Disconnected' || status === 'Suspended');
                    return this.ccowSession.get('status');
                }
            } else {
                return false;
            }

            //return SessionStorage.getModel('ccow').get('status');

        },
        vaultStatus: true,
        ccowIconSwitch: function (e, ccowAction) {
            var ccow_state = SessionStorage.getModel('ccow').get('state');
            if (_.isUndefined(ccow_state) || ccow_state === 'initial') {
                this.vaultStatus = false;
                e.stopPropagation();
                return;
            }
            var clinicalText = '<strong>Do you wish to turn Clinical link on?</strong>';

            if (ccowAction === 'Disconnected') {
                clinicalText = '<strong>Do you wish to turn Clinical link off?</strong>';
            } else {
                //Make sure there is no write back in progress when trying to resume context
                var dfn = this.getDfnFromContextItems();
                var parsePID = this.getPid(PatientRecordService.getCurrentPatient());
                if (!_.isUndefined(dfn) && (dfn !== parsePID)) {
                    var failingChecks = Checks._checkCollection.models;
                    if (failingChecks.length > 0) {
                        clinicalText = failingChecks[0].get('failureMessage') + ' Do you wish to turn Clinical link on?';
                    }
                }
            }
            e.preventDefault();

            var me = this;
            var alertView = new UIAlert({
                title: "Confirm",
                icon: "",
                messageView: Backbone.Marionette.ItemView.extend({
                        tagName: 'p',
                        template: Handlebars.compile(clinicalText),
                    }),
                    footerView: Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile([
                        '{{ui-button "No" classes="btn-default alert-cancel" title="Click to cancel"}}',
                        '{{ui-button "Yes" classes="btn-primary alert-continue" title="Click to continue"}}',
                    ].join('\n')),
                    events: {
                        'click .alert-cancel': function() {
                            UIAlert.hide();
                        },
                        'click .alert-continue': function () {
                            if (ccowAction === 'Disconnected') {
                                me.suspendContext();
                            } else {
                                me.resumeContext();
                            }
                        }

                    }
                })
            });
            alertView.show();
            e.stopPropagation();
        },
        contextCallback: function (ccowAction, message){
            if (ccowAction === 'Disconnected') {
                var ccowNotification = new ADK.UI.Notification({
                        icon: "fa-check",
                        message: message || 'Clinical Link Broken',
                        type: "basic",
                        autoClose: true,
                });
                ccowNotification.show();
            } else {
                this.updatePatientInfo();
            }
            UIAlert.hide();
            Messaging.trigger('ccow:updatedPatientPhotoCcowStatus', ccowAction);
            Messaging.trigger('ccow:updateHeaderStatus', ccowAction);
        },
        quit: function () {
            if (this.contextorControl && this.contextorControl.State === 2) {
                this.contextorControl.Suspend();
            }
        }
    };

    if ("ActiveXObject" in window) {
        window.onbeforeunload = function () {
            var ccowModel = SessionStorage.getModel('ccow');
            ccowModel.set('state', 'initial');
            SessionStorage.clear('ccow');
            SessionStorage.addModel('ccow', ccowModel);
            CCOWService.quit();
        };

        Messaging.on('user:beginSessionEnd', function () {
            try {
                if (CCOWService.contextorControl && CCOWService.contextorControl.State === 2) {
                    CCOWService.contextorControl.Suspend();
                }
            } catch (e) {
                //Do Nothing as unable to communicate to vault. Vault may be down.
            }
        });
    }

    return CCOWService;
});