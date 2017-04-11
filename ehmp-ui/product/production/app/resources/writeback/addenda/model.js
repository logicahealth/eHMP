define([
    'moment'
], function(moment) {
    var formUidCounter = 0;
    var addendum = ADK.Resources.Writeback.Model.extend({
        resource: 'addendum-add',
        vpr: 'notes',
        idAttribute: 'uid',
        parse: function(resp, options) {
            if (resp.data) {
                if (resp.data.addendum) {
                    // 'create' calls return the model
                    return resp.data.addendum;
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
                    resource = 'addendum-add';
                    break;
                case 'update': //PUT
                    resource = 'addendum-update';
                    break;
                case 'delete': //DELETE
                    resource = 'notes-addendum-unsigned-delete';
                    break;
            }
            url = ADK.ResourceService.buildUrl(resource, criteria);
            url = ADK.ResourceService.replaceURLRouteParams(url, params);
            return url.replace(/\/+/g, '/').replace(/\?$/, ''); //replace multiple /'s with one and remove trailing '?'
        },
        setFields: function() {
            var site = this.user.get('site');
            var authorUid = 'urn:va:user:' +site+ ':' +this.user.get('duz')[this.user.get('site')];
            var authorName = this.user.get('lastname') + ',' + this.user.get('firstname');
            var authorDisplayName = authorName.replace(/\w*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            var preSaveItems = {
                'authorUid': authorUid,
                'author': authorName,
                'authorDisplayName': authorDisplayName,
                'patientName': this.patient.get('displayName'),
                'patientBirthDate': this.patient.get('birthDate'),
                'isAddendum': true
            };
            var textData = {
                'author': authorName,
                'authorDisplayName': authorDisplayName,
                'authorUid': authorUid,
            };

            _.extend(this.attributes, preSaveItems);
            _.extend(this.get('text')[0], textData);

        },
        defaults: function() {
            return {
                'authorUid': null,
                'documentDefUid': null,
                'encounterName': null,
                //TEMPORARY DATA until clinical objects validator stops requiring
                //unnecessary visit information
                'encounterServiceCategory': 'A',
                'locationUid': 'urn:va:location:9E7A:64',
                'encounterDateTime': '20160101080000',
                'localId': null,
                'localTitle': null,
                'parentUid': null,
                'referenceDateTime': null,
                'signedDateTime': null,
                'signer': null,
                'signerDisplayName': null,
                'signerUid': null,
                'status': 'UNSIGNED',
                'statusDisplayName': 'Unsigned',
                'summary': '',
                'text': [{
                    'author': null,
                    'authorDisplayName': null,
                    'authorUid': null,
                    'content': '',
                    'dateTime': moment().format(),
                    'signer': null,
                    'signerDisplayName': null,
                    'signerUid': null,
                    'status': 'UNSIGNED'
                }]
            };
        },
        validate: function(attributes, options) {
            this.errorModel.clear();
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
        validateRequiredTime: function(attributes) {
            var inputDate = attributes.addendumDerivReferenceDate;
            var inputTime = attributes.addendumDerivReferenceTime;

            if (inputTime === null || inputTime === undefined || inputTime === '') {
                this.errorModel.set({
                    addendumDerivReferenceTime: 'Enter a time'
                });
                return false;
            }

            if (!this.isTime(inputTime)) {
                this.errorModel.set({
                    addendumDerivReferenceTime: 'Enter a valid time'
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
                        addendumDerivReferenceTime: 'Time cannot be in the future'
                    });
                    return false;
                }
            }
            return true;
        },
        validateRequiredDate: function(attributes) {
            var inputDate = attributes.addendumDerivReferenceDate;
            if (!inputDate) {
                this.errorModel.set({
                    addendumDerivReferenceDate: 'Enter a date'
                });
                return false;
            }
            if (!this.isDate(inputDate)) {
                this.errorModel.set({
                    addendumDerivReferenceDate: 'Enter a valid date'
                });
                return false;
            }
            if (inputDate && moment(inputDate).startOf('day').isAfter(moment().startOf('day'))) {
                this.errorModel.set({
                    addendumDerivReferenceDate: 'Reference Date must not be in the future'
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

    return addendum;
});