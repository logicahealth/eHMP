define([
    'main/ADK',
    'app/resources/writeback/activities/draft/subdomain/request'
], function(ADK, Request) {

    'use strict';

    return (function() {

        //============================= CONSTANTS =============================
        var SUBDOMAIN_DATA_FIELD_MAP = {
            'request': Request.DATA_FIELDS
        };

        var SUBDOMAIN_CONTENT_VALIDATION_FIELD_MAP = {
            'request': Request.CONTENT_VALIDATION_FIELDS
        };

        var SUBDOMAIN_POPULATE_MODEL_FUNCTION_MAP = {
            'request': Request.populateModel
        };

        var VALID_CLINICAL_OBJECT_FIELDS = ['patientUid', 'authorUid', 'domain', 'subDomain', 'visit', 'data'];
        var VALID_VISIT_FIELDS = ['location', 'serviceCategory', 'dateTime'];

        var DEFAULT_ATTRIBUTES = {
            contentType: 'application/json'
        };

        //============================ VALIDATION =============================
        var validateObject = function(attributes, fields, parent) {
            var errorField = _.find(fields, function(field) {
                return ((_.isUndefined(this[field])) || (_.isNull(this[field])));
            }, attributes);

            if (_.isString(errorField)) {
                var fieldName = (_.isUndefined(parent) ? errorField : (parent + '.' + errorField));
                return '"' + fieldName + '" attribute is required';
            }
        };

        var validateContent = function(attributes, fields, parent) {
            var errorField = _.find(fields, function(field) {
                return _.isEmpty(this[field]);
            }, attributes);

            if (_.isString(errorField)) {
                var fieldName = (_.isUndefined(parent) ? errorField : (parent + '.' + errorField));
                return '"' + fieldName + '" cannot be empty';
            }
        };

        var validateClinicalObject = function(attributes, options) {
            var error = validateObject(attributes, VALID_CLINICAL_OBJECT_FIELDS);
            if (_.isString(error)) {
                return error;
            }

            error = validateObject(attributes.visit, VALID_VISIT_FIELDS, 'visit');
            if (_.isString(error)) {
                return error;
            }

            error = validateObject(attributes.data, (SUBDOMAIN_DATA_FIELD_MAP[attributes.subDomain] || []), 'data');
            if (_.isString(error)) {
                return error;
            }

            error = validateContent(attributes.data, (SUBDOMAIN_CONTENT_VALIDATION_FIELD_MAP[attributes.subDomain] || []), 'data');
            if (_.isString(error)) {
                return error;
            }
        };

        var validateUid = function(attributes, options) {
            return validateObject(attributes, ['uid']);
        };

        var validateUpdate = function(attributes, options) {
            var error = validateUid(attributes, options);
            if (_.isString(error)) {
                return error;
            }

            error = validateClinicalObject(attributes, options);
            if (_.isString(error)) {
                return error;
            }
        };

        var validateInvalid = function() {
            return "Invalid request type";
        };

        //========================== URL GENERATION ===========================
        var getUrl = function(method, options) {
            var params = {
                pid: this.patient.get('pid')
            };

            var criteria = options.criteria || {};

            if (this.patient.has("acknowledged")) {
                criteria._ack = true;
            }

            var url = ADK.ResourceService.buildUrl(this.resource, criteria);
            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        };

        var getUrlWithUid = function(method, option) {
            var params = {
                pid: this.patient.get('pid'),
                resourceId: this.get('uid')
            };

            var criteria = option.criteria || {};

            if (this.patient.has("acknowledged")) {
                criteria._ack = true;
            }

            var url = ADK.ResourceService.buildUrl(this.resource, criteria);
            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        };

        //============================== PARSERS ==============================
        var parse = function(resp) {
            var data = resp.data;
            var location = _.get(data, 'headers.location', '');
            var uid = _.last(location.split('/'));

            return {
                uid: uid
            };
        };

        var parseRead = function(resp) {
            return resp.data;
        };

        var parseEmpty = function(resp) {
            return {};
        };

        //========================== SYNC CALLBACKS ===========================
        var handleSuccess = function(resp) {
            var serverAttrs = this.parse(resp) || {};
            if (_.isEmpty(serverAttrs)) {
                this.resetDraft();
            } else {
                this.set(serverAttrs);
            }
        };

        var handleError = function(resp) {
            var responseData = retrieveErrorMessage(resp);
            var errorMessage = (_.isArray(responseData) ? responseData.join('\n') : responseData);
            this.set('errorMessage', errorMessage);
        };

        //============================= UTILITIES =============================
        var populateModel = function() {

            var objectData = {};

            var key = this.get('subDomain') || '';
            var subdomainPopulateModel = _.get(SUBDOMAIN_POPULATE_MODEL_FUNCTION_MAP, key);
            if (_.isFunction(subdomainPopulateModel)) {
                _.extend(objectData, subdomainPopulateModel.apply(this));
            }

            // Populate the clinical object fields only if the object UID is undefined
            if (_.isEmpty(this.get('uid'))) {

                _.defaults(objectData, {
                    patientUid: this.patient.get('uid'),
                    ehmpState: 'draft',
                    displayName: '',
                    referenceId: ''
                });

                var siteCode = this.user.get('site');
                var provider = _.get(this.user.get('duz'), siteCode);
                objectData.authorUid = 'urn:va:user:' + siteCode + ':' + provider;
            }

            // Always set the visit context information
            var visit = this.patient.get('visit') || {};
            objectData.visit = {
                serviceCategory: visit.serviceCategory || '',
                dateTime: visit.dateTime || '',
                location: visit.locationUid || ''
            };

            this.set(objectData, {
                silent: true
            });
        };

        var setDeletedState = function() {
            this.set('ehmpState', 'deleted', {
                silent: true
            });
        };

        var retrieveErrorMessage = function(resp) {
            var errorMessage = _.get(resp, 'responseJSON.data.error');
            if (!_.isEmpty(errorMessage)) {
                return errorMessage;
            }

            errorMessage = _.get(resp, 'responseJSON.message');
            if (!_.isEmpty(errorMessage)) {
                return errorMessage;
            }

            var errorData = _.get(resp, 'responseJSON.data');
            if (_.isEmpty(errorData)) {
                errorMessage = 'System Error';
            }
            else if (_.isArray(errorData)) {
                errorMessage = (errorData.join('\n'));
            }
            else if (_.isString(errorData)) {
                errorMessage = errorData;
            }

            return errorMessage;
        };

        //=========================== API FUNCTIONS ===========================
        var getMethodMap = function() {
            var methodMap = {};
            _.each(resourceMap, function(resource) {
                methodMap[resource.method] = resource.requestType;
            });
            return methodMap;
        };

        var execute = function(actionName, options) {
            var action = _.get(resourceMap, actionName, resourceMap.invalid);
            _.extend(this, action);

            // Clear out any existing errors
            this.validationError = null;

            // Perform any functions that need to occur before validation and execution
            if (_.isFunction(this.beforeExecute)) {
                this.beforeExecute();
            }

            // Manually run validation on the model before running any function
            if (!this.isValid()) {
                this.trigger(action.method + ':error', this, this.validationError, {});
                return;
            }

            var attributes = {
                success: _.bind(handleSuccess, this),
                error: _.bind(handleError, this)
            };
            _.extend(attributes, DEFAULT_ATTRIBUTES, options);

            this.sync(action.method, this, attributes);
        };

        var getPayload = function() {
            return (this.get('data') || {});
        };

        var setPayload = function(data) {
            this.set('data', data, {
                silent: true
            });
        };

        var extractPayload = function(model, subDomain) {
            var key = subDomain || this.get('subDomain') || '';
            var attributes = _.get(SUBDOMAIN_DATA_FIELD_MAP, key, []);

            var payload = model.pick(attributes);

            // Fill in the missing data attributes with default values.
            var missingAttributes = _.difference(attributes, _.keys(payload));
            _.each(missingAttributes, function(key) {
                _.set(payload, key, '');
            });

            return payload;
        };

        var getUid = function() {
            return (this.get('uid') || '');
        };

        var setUid = function(uid) {
            this.set('uid', uid, {
                silent: true
            });
        };

        var resetDraft = function() {
            this.unset('data', {
                silent: true
            });
            this.unset('uid', {
                silent: true
            });
        };

        //============================= RESOURCES =============================
        var resourceMap = {
            read: {
                resource: 'orders-read-draft',
                validate: validateUid,
                getUrl: getUrlWithUid,
                parse: parseRead,
                method: 'draft:read',
                requestType: 'read'
            }
        };

        //============================ PUBLIC API =============================
        var draftResource = ADK.Resources.Writeback.Model.extend({
            resource: 'draft-action',
            vpr: 'draft-action',
            idAttribute: 'uid',
            childParse: false,

            defaults: {
                uid: null,
                patientUid: '',
                authorUid: '',
                domain: 'ehmp-activity',
                subDomain: '',
                referenceId: '',
                visit: {},
                data: {}
            },

            methodMap: getMethodMap(),

            getDraft: _.partial(execute, 'read'),

            getPayload: getPayload,
            setPayload: setPayload,
            extractPayload: extractPayload,
            getUid: getUid,
            setUid: setUid,
            resetDraft: resetDraft,
            populateModel: populateModel
        });

        return draftResource;
    })();
});
