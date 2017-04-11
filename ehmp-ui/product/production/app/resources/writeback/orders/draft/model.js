define([
    'main/ADK',
    'app/resources/writeback/orders/draft/subdomain/laboratory'
], function(ADK, Laboratory) {

    'use strict';

    //============================= CONSTANTS =============================
    var SUBDOMAIN_DATA_FIELD_MAP = {
        'laboratory': Laboratory.DATA_FIELDS,
    };

    var SUBDOMAIN_CONTENT_VALIDATION_FIELD_MAP = {
        'laboratory': Laboratory.CONTENT_VALIDATION_FIELDS,
    };

    var SUBDOMAIN_POPULATE_MODEL_FUNCTION_MAP = {
        'laboratory': Laboratory.populateModel,
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
    //============================== PARSERS ==============================
    var parseSave = function(resp) {
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

        var siteCode = this.user.get('site');
        // Populate the clinical object fields only if the object UID is undefined
        if (_.isEmpty(this.get('uid'))) {

            _.defaults(objectData, {
                patientUid: this.patient.get('uid'),
                ehmpState: 'draft',
                displayName: '',
                referenceId: ''
            });

            var provider = _.get(this.user.get('duz'), siteCode);
            objectData.authorUid = 'urn:va:user:' + siteCode + ':' + provider;
        }

        // Always set the visit context information
        var visit = this.patient.get('visit') || {};
        var location = visit.locationUid;
        objectData.visit = {
            serviceCategory: visit.serviceCategory || '',
            dateTime: visit.dateTime || '',
            location: location
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
        return _.mapValues(resourceMap, function(resource) {
            return _.pick(resource, ['method', 'resource', 'parameters']);
        });
    };

    var execute = function(actionName, options) {
        var methodName = 'draft:' + actionName;
        var action = resourceMap[methodName];
        _.extend(this, _.pick(action, ['validate', 'parse']));

        // Clear out any existing errors
        this.validationError = null;

        // Perform any functions that need to occur before validation and execution
        if (_.isFunction(action.beforeExecute)) {
            action.beforeExecute.call(this);
        }

        // Manually run validation on the model before running any function
        if (!this.isValid()) {
            this.trigger(methodName + ':error', this, this.validationError, {});
            return;
        }

        var attributes = {
            success: _.bind(handleSuccess, this),
            error: _.bind(handleError, this)
        };
        _.extend(attributes, DEFAULT_ATTRIBUTES, options);

        this.sync(methodName, this, attributes);
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
        _.each(attributes, function(key) {
            if (_.isUndefined(payload[key]) || _.isNull(payload[key])) {
                payload[key] = '';
            }
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
        'draft:read': {
            resource: 'orders-read-draft',
            method: 'read',
            parameters: {
                pid: 'pid',
                resourceId: 'uid'
            },
            validate: validateUid,
            parse: parseRead
        },
        'draft:delete': {
            resource: 'orders-lab-save-draft',
            method: 'create',
            parameters: {
                pid: 'pid',
            },
            beforeExecute: setDeletedState,
            validate: validateUid,
            parse: parseEmpty
        },
        'draft:save': {
            resource: 'orders-lab-save-draft',
            method: 'create',
            parameters: {
                pid: 'pid',
            },
            beforeExecute: populateModel,
            validate: validateClinicalObject,
            parse: parseSave,
        }
    };

    //============================ PUBLIC API =============================
    return ADK.Resources.Writeback.Model.extend({
        resource: 'draft-order',
        vpr: 'draft-order',
        idAttribute: 'uid',
        childParse: false,

        defaults: {
            uid: null,
            patientUid: '',
            authorUid: '',
            domain: 'ehmp-order',
            subDomain: '',
            referenceId: '',
            visit: {},
            data: {}
        },

        methodMap: getMethodMap(),

        getDraft: _.partial(execute, 'read'),
        deleteDraft: _.partial(execute, 'delete'),
        saveDraft: _.partial(execute, 'save'),
        getPayload: getPayload,
        setPayload: setPayload,
        extractPayload: extractPayload,
        getUid: getUid,
        setUid: setUid,
        resetDraft: resetDraft,
        populateModel: populateModel
    });
});
