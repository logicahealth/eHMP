define([
    'backbone',
    'marionette',
    'underscore',
    'api/Messaging',
    'api/SessionStorage',
    'api/CCOWService',
    'api/Checks'
], function (Backbone, Marionette, _, Messaging, SessionStorage, CCOWService, Checks) {
    'use strict';

    var CCOWObjectsModel = Backbone.Model.extend({});

    var contextorControl;

     var pendingChangeCheck = function (contextItems) {
        var failingChecks = Checks._checkCollection.models;
        if (failingChecks.length > 0) {
            var gatherLabels = [];
            var checkMesage = '';
            _.each(failingChecks, function (f) {
                //we want to parse out duplicate labels
                if (gatherLabels.indexOf(f.get('label')) === -1) {
                    gatherLabels.push(f.get('label'));
                    checkMesage += "Warning! Changes to in progress eHMP " + f.get('label') + " will be lost!";
                }
            });
            contextorControl.SetSurveyResponse("decision=conditional_accept&reason=" + checkMesage);
        }
        return;
     };

    var commitChange = function (contextItems) {

        if (CCOWService.getCcowStatus() !== 'Connected') {
            return;
        }
        CCOWService.updatePatientInfo();

    };

    var setPatientStatusClass = function (patient) {
        var patientType = 'Outpatient';
        if (patient.get('admissionUid') && patient.get('admissionUid') !== null) {
            patientType = 'Inpatient';
        }
        patient.set('patientStatusClass', patientType);
        return patient;
    };


    var CCOWObjectsView = Backbone.Marionette.ItemView.extend({
        template: _.template(''),
        initialize: function () {

           this.model = new CCOWObjectsModel();
           this.ccowSession = SessionStorage.getModel('ccow');
           try {
                contextorControl = new ActiveXObject("Sentillion.Contextor.1");

           } catch (e) {
                this.ccowSession.set('status', 'NotConnected');
                this.model.set('failed', 'yes');
           }
           if (this.ccowSession.get('status') === 'NotConnected') {
                CCOWService.vaultStatus = false;
                return;
           }
           var state = this.ccowSession.get('state');

           this.ccowSession.set('status', 'Connected');

           if (!this.model.get('failed')) {
                if (!state || state === 'initial') {
                    this.runContext();
                }
           }
        },


        persistCcowSession: function () {
            SessionStorage.clear('ccow');
            SessionStorage.addModel('ccow', this.ccowSession);
        },
        loadSessionObject: function (ccowObject) {
            var self = this;
            self.ccowSession.set('pid', ccowObject.pid);
            self.ccowSession.set('state', 'listening');
            self.ccowSession.set('status', 'Connected');
            self.persistCcowSession();
        },
        runContext: function () {
            var self = this;
            var runContextManager = $.Deferred();
            var loginDeferred = $.Deferred();
            self.ccowSession.set('state', 'initial');

            loginDeferred.done(function (ccowObject) {
                self.loadSessionObject(ccowObject);
            });
            loginDeferred.fail(function () {
                Messaging.trigger('user:sessionEnd');
                self.ccowSession.set('status', 'NotConnected');
                self.persistCcowSession();
            });

            runContextManager.fail(function () {
                self.ccowSession.set('status', 'NotConnected');
                self.persistCcowSession();
            });


            runContextManager.done(function () {
                self.ccowSession.set('state', 'ranlocator');
                var dfn = CCOWService.getDfnFromContextItems();
                self.persistCcowSession();

                //CCOW CONNECTION
                if (!_.isUndefined(dfn)) {
                    CCOWService.ensureICNforPatient(dfn, null);
                } else {
                    CCOWService.loadSessionObject({pid:''});
                    Messaging.trigger('ccow:nopatient');
                }
            });

            if (contextorControl.State === 1) {
                try {
                    contextorControl.Run("eHMP", "", true);
                } catch (e) {
                    if (e.message.indexOf("C2W_CM") > -1) {
                        try
                        {
                            contextorControl.Run("eHMP#", "", true);
                        } catch (e2) {
                            runContextManager.reject();
                        }
                    } else {
                        runContextManager.reject();
                    }

                } finally {
                    /* jshint ignore:start */
                    eval('function contextorControl::Pending(contextItems) { pendingChangeCheck(contextItems); }');
                    eval('function contextorControl::Committed(contextItems) { commitChange(contextItems); }');
                    /* jshint ignore:end */
                    CCOWService.contextorControl = contextorControl;
                    runContextManager.resolve();
                }
            }
        }



    });

    return CCOWObjectsView;
});