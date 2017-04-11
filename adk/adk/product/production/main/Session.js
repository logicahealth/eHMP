define([
    "backbone",
    "moment"
], function(Backbone, moment) {
    'use strict';

    var UserModel,
        PatientModel = Backbone.Model.extend({
            isInpatient: function() {
                if (this.patientStatusClass() == "Inpatient") {
                    return true;
                }
                return false;
            },
            isOutpatient: function() {
                if (this.patientStatusClass() == 'Outpatient') {
                    return true;
                }
                return false;
            },
            patientStatusClass: function() {
                if (this.hasOwnProperty('attributes')) {
                    return (!!this.get('admissionUid')) ? 'Inpatient' : 'Outpatient';
                } else {
                    return (!!this.admissionUid) ? 'Inpatient' : 'Outpatient';
                }
            },
            hasPatientFlags: function() {
                if (this.hasOwnProperty('attributes')) {
                    if (_.isArray(this.get('patientRecordFlag')) && !_.isEmpty(this.get('patientRecordFlag'))) {
                        return true;
                    }
                } else {
                    if (_.isArray(this.patientRecordFlag) && !_.isEmpty(this.patientRecordFlag)) {
                        return true;
                    }
                }
                return false;
            },
            hasCrisisNotes: function() {
                if (this.hasOwnProperty('attributes')) {
                    if (this.has('cwadf') && this.get('cwadf').indexOf('C') >= 0) {
                        return true;
                    }
                } else {
                    if (this.cwadf && this.cwadf.indexOf('C') >= 0) {
                        return true;
                    }
                }
                return false;
            },
            hasFlags: function() {
                if (this.hasOwnProperty('attributes')) {
                    if (this.has('cwadf') && this.get('cwadf').indexOf('W') >= 0) {
                        return true;
                    }
                } else {
                    if (this.cwadf && this.cwadf.indexOf('W') >= 0) {
                        return true;
                    }
                }
                return false;
            },
            hasAllergies: function() {
                if (this.hasOwnProperty('attributes')) {
                    if (this.has('cwadf') && this.get('cwadf').indexOf('A') >= 0) {
                        return true;
                    }
                } else {
                    if (this.cwadf && this.cwadf.indexOf('A') >= 0) {
                        return true;
                    }
                }
                return false;
            },
            hasDirectives: function() {
                if (this.hasOwnProperty('attributes')) {
                    if (this.has('cwadf') && this.get('cwadf').indexOf('D') >= 0) {
                        return true;
                    }
                } else {
                    if (this.cwadf && this.cwadf.indexOf('D') >= 0) {
                        return true;
                    }
                }
                return false;
            }
        });

    var GlobalDateModel = Backbone.Model.extend({
        defaults: {
            fromDate: moment().subtract('months', 18).format('MM/DD/YYYY'), // one year ago by default
            toDate: moment().add('months', 6).format('MM/DD/YYYY'), // 6 months into future by default
            customFromDate: moment().subtract('months', 18).format('MM/DD/YYYY'),
            customToDate: moment().add('months', 6).format('MM/DD/YYYY'),
            selectedId: 'custom-range-apply-global' // '1yr-range-global'
        }
    });

    if (window.sessionStorage.hasOwnProperty('user')) {
        UserModel = Backbone.Model.extend({
            defaults: JSON.parse(window.sessionStorage.getItem('user')),
            parse: function(resp) {
                if (_.has(resp, 'data')) {
                    return resp.data;
                }
                return resp;
            }
        });
        PatientModel = PatientModel.extend({
            defaults: JSON.parse(window.sessionStorage.getItem('patient'))
        });
        var globalDateItem = window.sessionStorage.getItem('globalDate');
        if (globalDateItem) {
            var globalDateObj = JSON.parse(globalDateItem);
            if (globalDateObj.fromDate && globalDateObj.toDate) {
                GlobalDateModel = GlobalDateModel.extend({
                    defaults: globalDateObj
                });
            }
        }
    } else {
        UserModel = Backbone.Model.extend({
            defaults: {
                site: '',
                expires: moment.utc([1970, 0, 1, 0, 0, 1]),
                status: 'loggedout'
            },
            parse: function(resp) {
                if (_.has(resp, 'data')) {
                    return resp.data;
                }
                return resp;
            }
        });
    }

    var Session = {
        allAppletsLoadedPromise: new $.Deferred(),
        allUIResourcesLoadedPromise: new $.Deferred(),
        user: new UserModel(),
        patient: new PatientModel(),
        globalDate: new GlobalDateModel(),
        clearSessionModel: function(key, setDefault, options) {
            this[key].clear(options);
            if (_.isBoolean(setDefault) && setDefault === true) {
                this[key].set(this[key].defaults, options);
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
