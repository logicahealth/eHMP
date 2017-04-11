define([
    'moment'
], function(moment) {
    var formUidCounter = 0;
    var note = ADK.Resources.Writeback.Model.extend({
        resource: 'notes-add',
        vpr: 'notes',
        idAttribute: 'uid',
        parse: function(resp, options) {
            if (resp.data) {
                if (resp.data.notes) {
                    // 'create' calls return the model
                    return resp.data.notes;
                } else {
                    // 'update' calls return a success/error message rather than the model
                    return {};
                }
            }
            return resp;
        },
        childAttributes: ['_labelsForSelectedValues'],
        resourceEvents: {
            'before:create': 'setFields',
            'before:update': 'setFields'
        },
        getUrl: function(method, options) {
            var url,
                opts = _.extend({
                    'params': this.params
                }, options),
                standardParams = {
                    pid: this.patient.get('pid'),
                    resourceId: this.get('uid')
                },
                params = _.extend({}, standardParams, _.isFunction(opts.params) ? opts.params.apply(this, arguments) : opts.params),
                criteria = options.criteria || {},
                resource = null;

            if (this.patient.has("acknowledged")) {
                criteria._ack = true;
            }

            switch (method.toLowerCase()) {
                case 'create': //POST
                    resource = 'notes-add';
                    break;
                case 'update': //PUT
                    resource = 'notes-update';
                    break;
                case 'delete': //DELETE
                    resource = 'notes-unsigned-delete';
                    break;
            }
            url = ADK.ResourceService.buildUrl(resource, criteria);
            url = ADK.ResourceService.replaceURLRouteParams(url, params);
            return url.replace(/\/+/g, '/').replace(/\?$/, ''); //replace multiple /'s with one and remove trailing '?'
        },
        setFields: function() {
            var site = this.user.get('site');
            //var authorUid = this.user.get('duz') && this.user.get('duz')[this.user.get('site')];
            var authorUid = 'urn:va:user:' +site+ ':' +this.user.get('duz')[this.user.get('site')];
            var authorName = this.user.get('lastname') + ',' + this.user.get('firstname');
            var preSaveItems = {
                'entered': moment().format('YYYYMMDDHHmmss'),
                'lastUpdateTime': moment().format('YYYYMMDDHHmmss'),
                'patientIcn': this.patient.get('icn'),
                'pid': this.patient.get('pid'),
                'patientName': this.patient.get('displayName'),
                'patientBirthDate': this.patient.get('birthDate'),
                'authorUid': authorUid,
                'author': authorName,
                'authorDisplayName': authorName.replace(/\w*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})

            };
            var textData = {
                'author': authorName,
                'authorDisplayName': authorName,
                'authorUid': authorUid,
                'dateTime': moment().format(),
            };

            _.extend(this.attributes, preSaveItems);
            _.extend(this.get('text')[0], textData);

        },
        defaults: function() {
            return {
                'author': null,
                'authorDisplayName': (ADK.UserService.getUserSession().get('lastname') + ',' + ADK.UserService.getUserSession().get('firstname')).replace(/\w*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}),
                'authorUid': null,
                'documentClass': 'PROGRESS NOTES',
                'documentDefUid': null,
                'documentTypeName': 'Progress Note',
                'encounterName': null,
                'encounterServiceCategory': null,
                'locationUid': null,
                'encounterDateTime': null,
                'patientStatus': (ADK.PatientRecordService.getCurrentPatient().patientStatusClass() === 'Inpatient') ? 'INPATIENT' : 'OUTPATIENT',
                'entered': null,
                'facilityName': 'None',
                'formUid': '' + formUidCounter++,
                'isInterdisciplinary': 'false',
                'lastUpdateTime': null,
                'localId': null,
                'localTitle': '',
                'nationalTitle': {
                    name: '',
                    vuid: ''
                },
                'patientIcn': null,
                'pid': null,
                'patientName': null,
                'patientBirthDate': null,
                'referenceDateTime': null,
                'signedDateTime': null,
                'signer': null,
                'signerDisplayName': null,
                'signerUid': null,
                'status': 'UNTRANSCRIBED',
                'statusDisplayName': 'Unsigned',
                'summary': '',
                'text': [{
                    'author': null,
                    'authorDisplayName': null,
                    'authorUid': null,
                    'content': '',
                    'dateTime': null,
                    'signer': null,
                    'signerDisplayName': null,
                    'signerUid': null,
                    'status': 'UNSIGNED'
                }]
            };
        },
        validate: function(attributes, options) {
            this.errorModel.clear();
            this.validateTitle(attributes);
            this.validateRequiredDate(attributes);
            this.validateRequiredTime(attributes);
            if (options.validationType && options.validationType === 'sign') {
                if (_.isEmpty(attributes.text[0].content)) {
                    this.errorModel.set({
                        "text.0.content": 'Note body is required before signing'
                    });
                }
            }

            if (!_.isEmpty(this.errorModel.toJSON())) {
                return 'Correct validation errors before saving';
            }
        },
        validateTitle: function(attributes) {
            if (_.isEmpty(attributes.documentDefUid)) {
                this.errorModel.set({
                    documentDefUidUnique: 'Enter in a note title'
                });
                return false;
            }
            return true;
        },
        validateRequiredTime: function(attributes) {
            var inputDate = attributes.derivReferenceDate;
            var inputTime = attributes.derivReferenceTime;

            if (inputTime === null || inputTime === undefined || inputTime === '') {
                this.errorModel.set({
                    derivReferenceTime: 'Enter a time'
                });
                return false;
            }

            if (!this.isTime(inputTime)) {
                this.errorModel.set({
                    derivReferenceTime: 'Enter a valid time'
                });
                return false;
            }

            inputTime = inputTime.split(':');

            if (moment(inputDate).startOf('day').isSame(moment().startOf('day'))) {
                var currentHours = moment().hours();
                var currentMinutes = moment().minutes();
                var inputHours = inputTime[0] * 1;
                var inputMinutes = inputTime[1] * 1;
                if (inputHours > currentHours || (inputHours === currentHours && inputMinutes > currentMinutes)) {
                    this.errorModel.set({
                        derivReferenceTime: 'Time cannot be in the future'
                    });
                    return false;
                }
            }
            return true;
        },
        validateRequiredDate: function(attributes) {
            var inputDate = attributes.derivReferenceDate;
            if (!inputDate) {
                this.errorModel.set({
                    derivReferenceDate: 'Enter a date'
                });
                return false;
            }
            if (inputDate && moment(inputDate).startOf('day').isAfter(moment().startOf('day'))) {
                this.errorModel.set({
                    derivReferenceDate: 'Reference date must not be in the future'
                });
                return false;
            }
            return true;
        },
        isDate: function(text) {
            return moment(text, "MM/DD/YYYY", true).isValid();
        },
        isTime: function(text) {
            return moment(text, 'HH:mm',true).isValid();
        }
    });

    return note;
});