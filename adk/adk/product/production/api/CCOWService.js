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

    var pendingChangeCheck = function (contextItems) {
        var failingChecks = Checks._checkCollection;
        if (failingChecks.length > 0) {
            var checkMessage = '';
            var gatherLabels = _.uniq(failingChecks.models, function(item){
                return item.get('label');
            });

            _.each(gatherLabels, function (f) {
                gatherLabels.push(f.get('label'));
                checkMessage += "Warning! Changes to in progress eHMP " + f.get('label') + " will be lost!";
            });
            CCOWService.contextorControl.SetSurveyResponse("decision=conditional_accept&reason=" + checkMessage);
        }
        return;
    }

    var commitChange = function (contextItems) {
        if (CCOWService.getCcowStatus() !== 'Connected') {
            return;
        }
        CCOWService.updatePatientInfo();
    }

    var CCOWService = {
        contextorControl: null,
        start: function (callback) {
            if ("ActiveXObject" in window){
                var ccowSession = SessionStorage.getModel('ccow');
                if (_.isUndefined(ccowSession) || !ccowSession.has('status')) {
                    ccowSession = new Backbone.Model();
                }

                ccowSession.set('reinitialize', false);

                try {
                    this.contextorControl = new ActiveXObject("Sentillion.Contextor.1");
                } catch (e) {
                    ccowSession.set({
                        status: 'Disconnected',
                        vaultConnected: false
                    });
                    this.persistCcowSession(ccowSession);
                    return callback(e);
                }
                if (!_.isUndefined(this.contextorControl) && this.contextorControl.State === 1) {
                    try {
                        this.contextorControl.Run("eHMP", "", true);
                    } catch (e) {
                        // This error gets thrown if there's already an ehmp CCOW session in the vault. In this case
                        // we attempt to create another unique session with a numerical value after the eHMP (eg. eHMP#123456)
                        if (e.message.indexOf("C2W_CM") > -1) {
                            try {
                                this.contextorControl.Run("eHMP#", "", true);
                            } catch (e2) {
                                console.error(e2);
                                ccowSession.set({
                                    status: 'Disconnected',
                                    vaultConnected: false
                                });
                                this.persistCcowSession(ccowSession);
                                return callback(e2);
                            }
                        } else {
                            return callback('error');
                        }
                    }

                    // These eval statements listen for context changes with the ActiveX control. Unfortunately, eval
                    // is the only way for this to work.
                    /* jshint ignore:start */
                    eval('function CCOWService.contextorControl::Pending(contextItems) { pendingChangeCheck(contextItems); }');
                    eval('function CCOWService.contextorControl::Committed(contextItems) { commitChange(contextItems); }');
                    /* jshint ignore:end */

                    if (ccowSession.get('status') === 'Suspended') {
                        CCOWService.suspendContext(true);
                    } else {
                        ccowSession.set('status', 'Connected');
                    }

                    this.persistCcowSession(ccowSession);
                    return callback && callback();
                }
            }
        },
        getTokenFromContextItems: function () {
            var contextItems = _.get(this.contextorControl, 'CurrentContext');
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
            var contextItems = _.get(this.contextorControl, 'CurrentContext');
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
            var contextItems = _.get(this.contextorControl, 'CurrentContext');
            var division;
            var coll = new Enumerator(contextItems);
            if (!coll.atEnd()) {
                for (; !coll.atEnd(); coll.moveNext()) {
                    var itemName = coll.item().name;
                    var itemValue = coll.item().value;
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
            ccowSession.set({
                pid: ccowObject.pid,
                status: 'Connected'
            });
            this.persistCcowSession(ccowSession);

        },
        persistCcowSession: function (ccowModel) {
            SessionStorage.clear('ccow');
            SessionStorage.addModel('ccow', ccowModel);
        },
        getSiteInfo: function (callback) {
            var division;
            var contextItemDivision = this.getDivisionFromContextItems();
            contextItemDivision = contextItemDivision || UserService.getUserSession().get('division');

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
                        if (_.isUndefined(site)) {
                          callback({error: 'Site Info cannot be obtained for ' + contextItemDivision });
                        } else {
                          callback(site);
                        }
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
            var parsePID = this.getPid(patient);

            if (parsePID === this.ccowSession.get('pid')) {
                return callback && callback();
            }

            if (this.contextorControl && this.contextorControl.State === 2) {
                var nameItem = new ActiveXObject("Sentillion.ContextItem.1");
                var localIdItem = new ActiveXObject("Sentillion.ContextItem.1");
                var nationalIdItem = new ActiveXObject("Sentillion.ContextItem.1");
                var contextCollection = new ActiveXObject("Sentillion.ContextItemCollection.1");
                try {
                    //patient name
                    nameItem.name = 'Patient.co.PatientName';
                    nameItem.value = patient.get('displayName') + '^^^^';
                    contextCollection.Add(nameItem);

                    this.getSiteInfo(_.bind(function (response) {
                        if (response.error) {
                            this.updateCcowStatus('Disconnected', '');
                        } else {
                            this.updateCcowStatus('Connected');
                        }
                        this.contextorControl.StartContextChange();

                        //dfn
                        localIdItem.name = 'Patient.id.MRN.DFN_' + (response.stationNumber || response.division);
                        //Sometimes production key in json seems to have string value. This will ensure we are reading it right.
                        if (response.production.toString() === "false") {
                            localIdItem.name = localIdItem.name + '_TEST';
                        }

                        localIdItem.value = parsePID;
                        contextCollection.Add(localIdItem);
                        //icn
                        if (_.isString(patient.get('icn')) && patient.get('icn').indexOf(';') === -1) {
                            nationalIdItem.name = 'Patient.id.MRN.NationalIDNumber';
                            //Sometimes production key in json seems to have string value. This will ensure we are reading it right.
                            if (response.production.toString() === "false") {
                                nationalIdItem.name = nationalIdItem.name + '_TEST';
                            }

                            var icnArray = patient.get('icn').split('V');
                            if (icnArray.length > 0) {
                                nationalIdItem.value = icnArray[0];
                            } else {
                                nationalIdItem.value = patient.get('icn');
                            }
                            contextCollection.Add(nationalIdItem);
                        }
                        var coll = new Enumerator(contextCollection);
                        for (; !coll.atEnd(); coll.moveNext()) {
                            var itemName = coll.item().name;
                            var itemValue = coll.item().value;
                        }
                        var contextResponse = this.contextorControl.EndContextChange(true, contextCollection);
                        if (contextResponse === 1) {
                            callback();
                        } else if (contextResponse === 2) {
                            callback(true);
                        } else {
                            this.updateCcowStatus('Suspended');
                            callback();
                        }

                    }, this));
                } catch (e) {
                    this.updateCcowStatus('Disconnected');
                    callback();
                }
            } else {
                callback();
            }
        },
        updatePatientInfo: function () {
            var dfn = this.getDfnFromContextItems();
            var parsePID = this.getPid(PatientRecordService.getCurrentPatient());
            if (!_.isUndefined(dfn) && (dfn !== parsePID)) {
                var failingChecks = Checks._checkCollection.models;
                Checks.unregister(failingChecks);
                ADK.UI.Workflow.hide();
                ADK.UI.Modal.hide();
                this.getSiteInfo(function (site) {
                    ADK.PatientRecordService.setCurrentPatient(site.siteCode + ';' + dfn, {
                        reconfirm: true,
                        navigation: true,
                        modalOptions: {
                            backdrop: 'static'
                        },
                        hideCloseX: true,
                        skipAckPatientConfirmation: true,
                        displayBreakClinicalLink: true,
                        displayVisitHomePageBtnOnSync: true,
                        suspendContextOnError: true,
                        callback: function (e) {
                            var currentWorkspaceAndContextModel = WorkspaceContextRepository.currentWorkspaceAndContext;
                            var workspace = WorkspaceContextRepository.getDefaultScreenOfContext('patient');
                            if (currentWorkspaceAndContextModel.get('context') === 'staff') {
                                Navigation.navigate(workspace);
                            }
                        }
                    });
                });
            } else {
                ADK.UI.Modal.hide();
            }
        },
        formatPatientNameForContext: function (name) {
            var formattedName = name.replace(',', '^');
            formattedName = formattedName + '^^^^';
            return formattedName;
        },
        suspendContext: function (hideNotification) {
            try {
                this.contextorControl && this.contextorControl.Suspend();
                this.updateCcowStatus('Suspended', _.bind(function () {
                    this.contextCallback('Disconnected', null, hideNotification);
                }, this));
            } catch (e) {
                this.updateCcowStatus('Disconnected', _.bind(function () {
                    this.contextCallback('Disconnected', 'Error occurred during breaking context link. Try again later.', hideNotification);
                }, this));
            }

        },
        resumeContext: function () {
            try {
                this.contextorControl && this.contextorControl.Resume();
                this.updateCcowStatus('Connected', _.bind(function () {
                    this.contextCallback('Connected');
                }, this));
            } catch (e) {
                this.updateCcowStatus('Disconnected', _.bind(function () {
                    this.contextCallback('Disconnected', 'Error occurred during rejoining context link. Try again later.');
                }, this));
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
            if ("ActiveXObject" in window && !_.isUndefined(this.ccowSession)) {
                var status = this.ccowSession.get('status');
                var vaultConnected = (status === 'Connected' || status === 'Disconnected' || status === 'Suspended');
                this.ccowSession.set('vaultConnected', vaultConnected);
                this.persistCcowSession(this.ccowSession);
                return status;
            } else {
                return false;
            }
        },
        ccowIconSwitch: function (e, ccowAction) {
            if (!SessionStorage.getModel('ccow').get('vaultConnected')) {
                e.stopPropagation();
                return;
            }
            var clinicalText = '<p>Do you wish to turn Clinical link on?</p>';

            if (ccowAction === 'Disconnected') {
                clinicalText = '<p>Do you wish to break Clinical link?</p>';
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

            var alertView = new UIAlert({
                title: "Confirm",
                icon: "",
                messageView: Backbone.Marionette.ItemView.extend({
                    tagName: 'p',
                    template: Handlebars.compile(clinicalText),
                }),
                footerView: Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile([
                        '{{ui-button "No" classes="btn-default btn-sm alert-cancel" title="Press enter to cancel"}}',
                        '{{ui-button "Yes" classes="btn-primary btn-sm alert-continue" title="Press enter to break clinical link"}}',
                    ].join('\n')),
                    events: {
                        'click .alert-cancel': function () {
                            UIAlert.hide();
                        },
                        'click .alert-continue': _.bind(function () {
                            if (ccowAction === 'Disconnected') {
                                this.suspendContext();
                            } else {
                                this.resumeContext();
                            }
                        }, this)

                    }
                })
            });
            alertView.show();
            e.stopPropagation();
        },
        contextCallback: function (ccowAction, message, hideNotification) {
            if (ccowAction === 'Disconnected') {
                if (!hideNotification) {
                    var ccowNotification = new ADK.UI.Notification({
                        icon: "fa-check",
                        message: message || 'Clinical Link Broken',
                        type: "basic",
                        autoClose: true,
                    });
                    ccowNotification.show();
                }
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

            var ccowSession = SessionStorage.getModel('ccow');
            ccowSession.set('reinitialize', true);
            this.persistCcowSession(ccowSession);
        }
    };

    if ("ActiveXObject" in window) {
        window.onbeforeunload = function () {
            CCOWService.quit();
        };

        Messaging.on('loaded.ehmp.applets', function() {
            var ccowSession = SessionStorage.getModel('ccow');
            if (UserService.getStatus() === UserService.STATUS.LOGGEDIN && !_.isUndefined(ccowSession) && ccowSession.get('reinitialize')) {
                CCOWService.start(function (error) {
                    if (!error && ccowSession.get('status') === 'Connected') {
                        CCOWService.updatePatientInfo();
                    }
                });
            }
        });

        Messaging.on('user:beginSessionEnd', function () {
            try {
                if (CCOWService.contextorControl && CCOWService.contextorControl.State === 2) {
                    CCOWService.contextorControl.Suspend();
                }
            } catch (e) {
                console.warn('Unable to suspend CCOW session as vault may be down', e);
            }
        });
    }

    return CCOWService;
});
