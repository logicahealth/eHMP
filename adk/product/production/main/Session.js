define([
    'backbone',
    'moment',
    'api/Messaging',
    'underscore',
    'api/UrlBuilder',
    'main/adk_utils/patientUtils'
], function(
    Backbone,
    moment,
    Messaging,
    _,
    UrlBuilder,
    patientUtils
) {
    'use strict';

    var UserModel = Backbone.Model.extend({
        defaults: {
            site: '',
            expires: moment.utc([1970, 0, 1, 0, 0, 1]),
            status: 'loggedout'
        },
        parse: function(resp) {
            if (_.has(resp, 'data')) {
                resp = resp.data;
            }
            return _.extend({ displayName: this.getDisplayName(resp)}, resp);
        },
        getDisplayName: function(resp){
            var lastName = _.get(resp, 'lastname');
            var firstName = _.get(resp, 'firstname');
            var displayName = lastName;
            displayName += ((!_.isEmpty(lastName) && !_.isEmpty(firstName)) ? ', ' : '');
            displayName += firstName;
            return displayName;
        },
        initialize: function() {
            Messaging.getChannel('User').reply('site', this.getSite.bind(this));
        },
        getSite: function () {
            return this.get('site');
        }
    });

    var PatientModel = Backbone.Model.extend({
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
        },
        fetch: function(options) {
            Messaging.trigger('refresh.ehmp.patient');
            this.buildUrl();
            options = _.extend({
                parse: true,
                success: function() {
                    Messaging.trigger('refreshed.ehmp.patient');
                },
                error: function(error) {
                    console.log("ADK Patient Model: -------->> Error Refreshing Current Patient");
                    console.log(JSON.stringify(error, null, 4));
                    Messaging.trigger('refreshed.ehmp.patient');
                }
            }, options);
            Backbone.Model.prototype.fetch.call(this, options);
        },
        buildUrl: function(opts) {
            if (this.has('pid') || this.has('icn') || this.has('id')) {
                var options = _.extend({
                    resourceTitle: 'patient-record-patient',
                    criteria: {}
                }, opts);

                options = this.setFetchParams(options);

                this.url = UrlBuilder.buildUrl(options.resourceTitle, options.criteria);
            } else {
                this.url = null;
            }
        },
        parse: function(response, options) {
            var parsedResponse;
            if (response.data) {
                if (response.data.items) {
                    parsedResponse = response.data.items;
                } else {
                    parsedResponse = response.data;
                }
            } else {
                parsedResponse = response;
            }
            var refreshedPatient = _.findWhere(parsedResponse, {
                'pid': this.get('pid')
            }) || _.at(parsedResponse, 0) || {};
            if (this.get('patientRecordFlag') && !_.get(refreshedPatient, 'patientRecordFlag')) {
                this.unset('patientRecordFlag');
            }
            return refreshedPatient;
        },
        setFetchParams: function(opts) {
            return patientUtils.setPatientFetchParams(this, opts);
        },
        getIdentifier: function(patientIdentifierType) {
            return patientUtils.getPatientIdentifier(this, patientIdentifierType);
        },
        isInPrimaryVista: function() {
            return patientUtils.isPatientInPrimaryVista(this);
        }
    });

    var GlobalDateModel = Backbone.Model.extend({
        defaults: function() {
            return {
                fromDate: moment().subtract('months', 18).format('MM/DD/YYYY'), // one year ago by default
                toDate: moment().add('months', 6).format('MM/DD/YYYY'), // 6 months into future by default
                customFromDate: moment().subtract('months', 18).format('MM/DD/YYYY'),
                customToDate: moment().add('months', 6).format('MM/DD/YYYY'),
                selectedId: 'custom-range-apply-global' // '1yr-range-global'
            };
        }
    });

    var initialUserValues = JSON.parse(window.sessionStorage.getItem('user'));

    var initialPatientValues, initialGlobalDateValues;
    // Populate patient and globalDate models only if there is a previous user saved to session
    if (_.isObject(initialUserValues)) {
        initialPatientValues = JSON.parse(window.sessionStorage.getItem('patient'));
        var globalDateObj = JSON.parse(window.sessionStorage.getItem('globalDate'));
        if (_.has(globalDateObj, 'fromDate') && _.has(globalDateObj, 'toDate')) {
            initialGlobalDateValues = globalDateObj;
        }
    }

    var Session = {
        allAppletsLoadedPromise: new $.Deferred(),
        allUIResourcesLoadedPromise: new $.Deferred(),
        user: new UserModel(initialUserValues),
        patient: new PatientModel(initialPatientValues),
        globalDate: new GlobalDateModel(initialGlobalDateValues),
        clearSessionModel: function(key, setDefault, options) {
            this[key].clear(options);
            if (_.isBoolean(setDefault) && setDefault === true) {
                this[key].set(_.result(this[key], 'defaults'), options);
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
            }).set(this.globalDate.defaults(), {
                silent: true
            });
        }
    };

    return Session;
});
