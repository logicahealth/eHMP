define([
    "backbone",
    "moment"
], function(Backbone, moment) {
    'use strict';

    var UserModel,
        PatientModel = Backbone.Model.extend({
            isInpatient: function() {
                if (this.patientStatusClass == "Inpatient") {
                    return true;
                }
                return false;
            },
            hasPatientFlags: function() {
                if (this.patientRecordFlag) {
                    return true;
                }
                return false;
            },
            hasCrisisNotes: function() {
                if (this.cwadf && this.cwadf.indexOf('C') >= 0) {
                    return true;
                }
                return false;
            },
            hasFlags: function() {
                if (this.cwadf && this.cwadf.indexOf('W') >= 0) {
                    return true;
                }
                return false;
            },
            hasAllergies: function() {
                if (this.cwadf && this.cwadf.indexOf('A') >= 0) {
                    return true;
                }
                return false;
            },
            hasDirectives: function() {
                if (this.cwadf && this.cwadf.indexOf('D') >= 0) {
                    return true;
                }
                return false;
            }
        });
    if (window.sessionStorage.hasOwnProperty('user')) {
        UserModel = Backbone.Model.extend({
            defaults: JSON.parse(window.sessionStorage.getItem('user'))
        });
        PatientModel = PatientModel.extend({
            defaults: JSON.parse(window.sessionStorage.getItem('patient'))
        });
    } else {
        UserModel = Backbone.Model.extend({
            defaults: {
                site: '',
                expires: moment.utc('Thu, 01 Jan 1970 00:00:01 GMT'),
                status: 'loggedout'
            }
        });
    }

    var GlobalDateModel = Backbone.Model.extend({
        defaults: {
            fromDate: moment().subtract('months', 18).format('MM/DD/YYYY'), // one year ago by default
            toDate: moment().add('months', 6).format('MM/DD/YYYY'), // 6 months into future by default
            customFromDate: moment().subtract('months', 18).format('MM/DD/YYYY'),
            customToDate: moment().add('months', 6).format('MM/DD/YYYY'),
            selectedId: 'custom-range-apply-global' // '1yr-range-global'
        }
    });

    var Session = {
        allAppletsLoadedPromise: new $.Deferred(),
        user: new UserModel(),
        patient: new PatientModel(),
        globalDate: new GlobalDateModel(),
        clearSessionModel: function(key, setDefault) {
            this[key].clear();
            if (_.isBoolean(setDefault) && setDefault === true) {
                this[key].set(this[key].defaults);
            }
        },
        clearAllSessionModels: function() {
            this.user.clear({
                silent: true
            });
            this.patient.clear({
                silent: true
            });
            this.globalDate.clear({
                silent: true
            }).set(this.globalDate.defaults, {
                silent: true
            });
        }
    };

    return Session;
});