'use strict';


var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var _ = require('lodash');
var async = require('async');


// Treat as static final
var NO_PERMISSION_FOR_ADDENDUM = 'You may not VIEW this UNSIGNED Addendum.';
var POSSIBLE_ROLES = {
    'AUTHOR/DICTATOR': 'AUTHOR/DICTATOR',
    'Author (Dictator)': 'AUTHOR/DICTATOR',
    'AU': 'AUTHOR/DICTATOR',
    'ATTENDING PHYSICIAN': 'ATTENDING PHYSICIAN',
    'Attending Physician': 'ATTENDING PHYSICIAN',
    'ATT': 'ATTENDING PHYSICIAN',
    'TRANSCRIBER': 'TRANSCRIBER',
    'Transcriber': 'TRANSCRIBER',
    'TR': 'TRANSCRIBER',
    'EXPECTED COSIGNER': 'EXPECTED COSIGNER',
    'Expected Cosigner': 'EXPECTED COSIGNER',
    'EC': 'EXPECTED COSIGNER',
    'EXPECTED SIGNER': 'EXPECTED SIGNER',
    'Expected Signer': 'EXPECTED SIGNER',
    'ES': 'EXPECTED SIGNER',
    'SURROGATE': 'SURROGATE',
    'Surrogate': 'SURROGATE',
    'SUR': 'SURROGATE',
    'ADDITIONAL SIGNER': 'ADDITIONAL SIGNER',
    'Additional Signer': 'ADDITIONAL SIGNER',
    'X': 'ADDITIONAL SIGNER',
    'COMPLETER': 'COMPLETER',
    'Completer': 'COMPLETER',
    'CP': 'COMPLETER',
    'INTERPRETER': 'INTERPRETER',
    'Interpreter': 'INTERPRETER',
    'IN': 'INTERPRETER',
    'ENTERER': 'ENTERER',
    'Enterer': 'ENTERER',
    'E': 'ENTERER',
    'SIGNER': 'SIGNER',
    'Signer': 'SIGNER',
    'S': 'SIGNER',
    'COSIGNER': 'COSIGNER',
    'Cosigner': 'COSIGNER',
    'C': 'COSIGNER'
};
Object.freeze(POSSIBLE_ROLES);

/**
 * @param req
 * @param callback {function}
 */
function getDefaultUserClass(req, callback) {
    req.audit.logCategory = 'RETRIEVE';

    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/data/find/asu-class?filter=eq("name","USER")',
        logger: req.logger
    });

    return http.get(options, callback);
}


/**
 * @param req
 * @param jdsResponse {{data:{items: []}}} The documents collected from the JDS
 * @param callback {function}
 */
function applyAsuRules(req, jdsResponse, callback) {
    applyAsuRulesWithActionNames(req, undefined, undefined, jdsResponse, callback);
}


/**
 * @param req
 * @param requiredPermission {string | undefined} The type of permission the user must have in order to view the document.
 *                                                Example: 'View'
 * @param allPermissions {[] | undefined}
 * @param jdsResponse {{data:{items: []}}} The documents collected from the JDS
 * @param callback {function}
 */
function applyAsuRulesWithActionNames(req, requiredPermission, allPermissions, jdsResponse, callback) {
    async.series({
        defaultUser: function (cb) {
            getDefaultUserClass(req, function (error, response, body) {
                cb(error, body);
            });
        }
    }, function processDocuments(error, response) {
        if (error) {
            req.logger.debug(error, 'asuProcess.getAsuPermissionForActionNames: Got an error fetching default USER class from JDS');
            return callback(error);
        }
        var users = _getUsers(response.defaultUser);
        if (users instanceof Error) {
            req.logger.debug(users, 'asuProcess.getAsuPermissionForActionNames: Failed to parse JSON');
            return callback(users);
        }
        var result = _createDocumentList(jdsResponse.data.items, users, requiredPermission, allPermissions);
        if (result instanceof Error) {
            req.logger.debug(result, 'asuProcess.getAsuPermissionForActionNames: Skipping asu rules no documents provided');
            return callback(null, []);
        }
        var filtered = result.filterPermission(req);
        if (!filtered) {
            req.logger.debug(filtered, 'asuProcess.getAsuPermissionForActionNames: Failed to filter Documents');
            return callback('Missing Vista Config Options');
        }
        return result.asuRequestPermissions(req, callback);
    });
}


/**
 * Helper function to remove the try/catch from applyAsuRulesWithActionNames
 * try/catch is an "Optimization Killer" and should be abstracted to its own function.
 *
 * @param defaultUser {String}
 * @returns {*}
 * @private
 */
function _getUsers(defaultUser) {
    try {
        return JSON.parse(defaultUser).data.items;
    } catch (e) {
        return e;
    }
}


/**
 * Helper function to remove try/catch while creating new Documents.
 * try/catch is an "Optimization Killer" and should be abstracted to its own function.
 *
 * <em> See: documentation for _Documents </em>
 *
 * @param item
 * @returns {*}
 * @private
 */
function _createDocument(item) {
    try {
        return new Document(item);
    } catch (e) {
        return e;
    }
}


/**
 * Helper function to remove try/catch while creating new documents.
 * try/catch is an "Optimization Killer" and should be abstracted to its own function.
 *
 * <em> See: documentation for DocumentsList </em>
 *
 *  @param items
 * @param users
 * @param requiredPermissions
 * @param allPermission
 * @returns {*}
 * @private
 */
function _createDocumentList(items, users, requiredPermissions, allPermission) {
    try {
        return new DocumentList(items, users, requiredPermissions, allPermission);
    } catch (e) {
        return e;
    }
}


/**
 * The Document Object is used to store and refactor a single document
 *
 * @param item {{ activity: object, category: string, consultProcedure: string, dateTime: string, facilityCode: string,
 *                facilityName: string, fromService: string, kind: string, lastAction: string, lastUpdateTime: string,
 *                localId: string, orderName: string, orderUid: string, patientClassCode: string,
 *                patientClassName: string, pid: string, place: string, providerDisplayName: string,
 *                providerName: string, providerUid: string, provisionalDx: string, reason: string, results: object,
 *                service: string, stampTime: string, statusName: string, summary: string, typeName: string, uid: string,
 *                urgency: string, author: string, authorDisplayName: string, authorUid: string, clinicians: object,
 *                documentClass: string, documentDefUid: string, documentTypeCode: string, documentTypeName: string,
 *                encounterName: string, encounterUid: string, entered: string, isInterdisciplinary: string,
 *                localTitle: string, nationalTitle: object, referenceDateTime: string, signedDateTime: string,
 *                signer: string, signerDisplayName: string, signerUid: string, status: string,
 *                statusDisplayName: string, text: object, codes: object, attending: string,
 *                attendingDisplayName: string, attendingUid: string, cosignedDateTime: string, cosigner: string,
 *                cosignerDisplayName: string, cosignerUid: string, case: number, diagnosis: object, hasImages: boolean,
 *                imageLocation: string, imagingTypeUid: string, locationName: string, locationUid: string, name: string,
 *                providers: object, verified: boolean, interpretation: string }}
 *
 * asuRequest - Hold the information required to check permissions for each document.
 *      {actionNames: {[] || undefined}, docDefUid: {string}, docStatus: {string},
 *      roleNames: {[]}, userClassUids: {[]}}
 *
 * @constructor
 */
var Document = function (item) {
    this.response = item;
    this.asuRequest = {};

    if (!this.isValid()) {
        throw new Error('Item missing Required Information');
    }

};

/**
 * Checks that the Document was constructed with the required amount of information to create the ASU request.
 * @returns {boolean}
 */
Document.prototype.isValid = function () {
    if (_.isEmpty(this.response)) {
        return false;
    }
    if (this.needsPermissions()) {
        return !!_.get(this, 'response.status');
    }
    return true;
};

/**
 * Checks if the document needs to request permission from from the ASU before being sent to the client.
 * @returns {boolean}
 */
Document.prototype.needsPermissions = function () {
    return !!_.get(this.response, 'documentDefUid');
};

/**
 * Finds the roles that the current user has for this document.
 * @param currentUser {string} urn:va:user:<site>:<duz>
 */
Document.prototype.setExtractRoles = function (currentUser) {
    var extractedRoles = [];

    var clinicians = _.get(this, 'response.clinicians', []);
    _.each(clinicians, function checkRole(item) {
        var role = _.get(item, 'role');
        if (role && _.has(POSSIBLE_ROLES, role) && item.uid === currentUser) {
            extractedRoles.push(POSSIBLE_ROLES[role]);
        }
    });

    if (_.isEmpty(extractedRoles)) {
        extractedRoles = this._extractRolesFromText(currentUser);
    }
    extractedRoles = _.uniq(extractedRoles);

    this.asuRequest.roleNames = extractedRoles;
};

/**
 * A helper function in the event that the document does not have a list of clinicians
 * @param {string} currentUser urn:va:user:<site>:<duz>
 * @returns {Array}
 * @private
 */
Document.prototype._extractRolesFromText = function (currentUser) {
    var extractedRoles = [];

    if (_.get(this, 'response.authorUid') === currentUser) {
        extractedRoles.push(POSSIBLE_ROLES['AUTHOR/DICTATOR']);
    }

    if (_.get(this, 'response.signerUid') === currentUser) {
        extractedRoles.push(POSSIBLE_ROLES.SIGNER);
    }

    if (_.get(this, 'response.cosignerUid') === currentUser) {
        extractedRoles.push(POSSIBLE_ROLES.COSIGNER);
    }

    if (_.get(this, 'response.attendingUid') === currentUser) {
        extractedRoles.push(POSSIBLE_ROLES['ATTENDING PHYSICIAN']);
    }

    return extractedRoles;
};

/**
 * @param req
 * @param approved
 */
Document.prototype.redactDocument = function (req, approved) {
    if (this.response.status === 'RETRACTED') {
        if (_.isUndefined(this.response.summary)) {
            this.response.summary = '';
        }
        if (_.isUndefined(this.response.localTitle)) {
            this.response.localTitle = '';
        }
        this.response.summary += ' (Retracted)';
        this.response.localTitle += ' (Retracted)';

        var check = _.find(req.session.user.vistaUserClass, function checkUserRole(item) {
            return item.role === 'CHIEF, MIS';
        });

        if (check === undefined) {
            var msg = 'This note has been retracted.  See HIM personnel for access.';
            this.response.text = [{
                content: msg
            }];
            this.response.stub = 'true';
            this.response.activity = this.response.activity || [];
            this.response.results = this.response.results || [];
        }
        if (!_.contains(approved, 'VIEW')) {
            approved.push('VIEW');
        }
    }
};

// I am not sure that this does anything. It does not appear that the JDS is sending back info with
// noteType or addendumBody.  This was kept because it existed prior to refactoring.
Document.prototype.formatAddendum = function () {
    //noinspection JSUnresolvedVariable
    if (this.response.noteType === 'ADDENDUM') {
        //noinspection JSUnresolvedVariable
        if (this.response.addendumBody) {
            this.response.addendumBody = NO_PERMISSION_FOR_ADDENDUM;
        }

        _.each(this.response.text, function (textElement) {
            textElement.content = NO_PERMISSION_FOR_ADDENDUM;

            if (textElement.contentPreview) {
                textElement.contentPreview = NO_PERMISSION_FOR_ADDENDUM;
            }
        });
    }
};

Document.prototype.setDocDefUid = function () {
    this.asuRequest.docDefUid = this.response.documentDefUid;
};

Document.prototype.setDocStatus = function () {
    this.asuRequest.docStatus = this.response.status;
};

/**
 * @param userClasses {[]} The response from getDefaultUserClass()
 * @param userDetails {{vistaUserClass: {}}} The user details from the document or the session
 */
Document.prototype.setUserClassUids = function (userClasses, userDetails) {
    var docDefSite = this.response.documentDefUid.substring(15, this.response.documentDefUid.lastIndexOf(':'));
    var allUserClassUids = _
        .chain(userDetails.vistaUserClass || [])
        .concat(userClasses)
        .map('uid')
        .value();
    var userClassUids = _.filter(allUserClassUids, function isDocDefSite(uid) {
        return uid.indexOf(docDefSite) > -1;
    });
    if (_.isEmpty(userClassUids)) {
        // just send the first UID--rule evaluation requires at least one, but
        // since none match the docDefUid it doesn't matter which one; this
        // document can only succeed by role name matching
        userClassUids = _.slice(allUserClassUids, 0, 1);
    }
    this.asuRequest.userClassUids = userClassUids;
};

/**
 * @param actionNames {[]}
 */
Document.prototype.setActionNames = function (actionNames) {
    this.asuRequest.actionNames = actionNames;
};


/**
 * @param items {[]} The `items` field of the the JDS documents request
 * @param userClasses {[]} The result of: getDefaultUserClass()
 * @param [requiredPermissions] {string} The type of permission the user must have in order to view the document.
 *                                        Example: 'View'
 * @param [allPermissions] {[]}
 * @constructor
 */
var DocumentList = function (items, userClasses, requiredPermissions, allPermissions) {
    if (_.isEmpty(items)) {
        throw new Error('items cannot be an empty list');
    } else if (_.isEmpty(userClasses)) {
        throw new Error('userClasses cannot be empty');
    }
    this._jdsDocuments = items;
    this._asuRequest = [];
    this.response = [];
    this.requiredPermissions = requiredPermissions;
    this.allPermissions = allPermissions;
    this.userClasses = userClasses;
    this.isAccessDocument = !(requiredPermissions && allPermissions);
};

/**
 * Filters out the documents that do not need to request permission from the asu, and creates a list
 * of the ones that do inside of the _asuRequest array.
 */
DocumentList.prototype.filterPermission = function (req) {
    var self = this;
    var hasErrors = false;

    _.each(this._jdsDocuments, function asuSetup(item) {
        var doc = _createDocument(item);
        if (_.isError(doc)) {
            req.logger.debug(item, 'DocumentList.filterPermission: Invalid Document');
            return;
        }

        if (self.isAccessDocument && item.status === 'RETRACTED') {
            doc.redactDocument(req, []);
            return;
        }

        if (!doc.needsPermissions()) {
            return;
        }

        var userDetails = item.userdetails;
        if (_.isUndefined(userDetails) || _.isNull(userDetails)) {
            userDetails = req.session.user;
        }

        var userUid = _.get(userDetails, 'uid');
        if (_.isUndefined(userUid)) {
            var site = _.get(userDetails, 'site');
            var duz = _.get(userDetails, 'duz');

            if(_.isEmpty(site) || _.isEmpty(duz) || !_.has(duz, site)) {
                hasErrors = true;
                return false;
            }
            userUid = 'urn:va:user:' + site + ':' + duz[site];
        }

        doc.setExtractRoles(userUid);
        doc.setDocDefUid();
        doc.setDocStatus();
        doc.setUserClassUids(self.userClasses, userDetails);
        if (self.isAccessDocument === false) {
            doc.setActionNames(self.allPermissions);
        }
        self._asuRequest.push(doc.asuRequest);
    });
    return !hasErrors;
};

/**
 * @param req
 * @param callback {function}
 */
DocumentList.prototype.asuRequestPermissions = function (req, callback) {
    var self = this;
    var httpConfig = _.extend({}, req.app.config.asuServer, {
        logger: req.logger,
        json: true,
        url: '/asu/rules/getMultiDocPermissions',
        body: {'documents': self._asuRequest}
    });

    if (this.isAccessDocument) {
        httpConfig.url = '/asu/rules/multiAccessDocument';
    }
    http.post(httpConfig, function (err, resp, body) {
        if (err || !body) {
            err = err || 'No response returned, status ' + _.get(resp, 'statusCode');
            req.logger.error({error: err});
            return callback(err);
        }
        if (self.isAccessDocument) {
            return self._asuCallbackAccess(body, callback);
        }
        return self._asuCallback(req, body, callback);
    });
};

/**
 * @param req
 * @param permissions {[]} The result from ASU request
 * @param callback {function}
 * @private
 */
DocumentList.prototype._asuCallback = function (req, permissions, callback) {
    var self = this;
    var uncheckedIndex = 0;

    async.each(this._jdsDocuments, function checkPermission(item, asyncCallback) {
        var doc = _createDocument(item);
        if (!_.isError(doc)) {
            if ((self.isAccessDocument && item.status === 'RETRACTED') || !doc.needsPermissions()) {
                doc.formatAddendum();
                self.response.push(doc.response);
            } else {
                var approved = [];

                /** @param val {{hasPermission: boolean, actionName: string}} */
                _.each(permissions[uncheckedIndex], function docPermission(val) {
                    if (val.hasPermission) {
                        approved.push(val.actionName);
                    }
                });
                doc.redactDocument(req, approved);
                uncheckedIndex++;
                if (_.contains(approved, self.requiredPermissions)) {
                    doc.response.asuPermissions = approved;
                    self.response.push(doc.response);
                }
            }
        }
        return asyncCallback();
    }, function () {
        return callback(null, self.response);
    });
};

/**
 * @param permissions {[]} The result from ASU request
 * @param callback {function}
 * @private
 */
DocumentList.prototype._asuCallbackAccess = function (permissions, callback) {
    var self = this;
    var uncheckedIndex = 0;
    async.each(this._jdsDocuments, function checkPermission(item, asyncCallback) {
        var doc = _createDocument(item);
        if (!_.isError(doc)) {
            if ((self.isAccessDocument && item.status === 'RETRACTED') || !doc.needsPermissions()) {
                self.response.push(doc.response);
                return asyncCallback();
            } else {
                if (permissions[uncheckedIndex] === true) {
                    self.response.push(doc.response);
                }
                uncheckedIndex++;
            }
        }
        return asyncCallback();
    }, function () {
        return callback(null, self.response);
    });
};

/* global module */
module.exports.NO_PERMISSION_FOR_ADDENDUM = NO_PERMISSION_FOR_ADDENDUM;
module.exports.POSSIBLE_ROLES = POSSIBLE_ROLES;
module.exports.applyAsuRules = applyAsuRules;
module.exports.applyAsuRulesWithActionNames = applyAsuRulesWithActionNames;
module.exports._Document = Document;
module.exports.DocumentList = DocumentList;
module.exports._createDocument = _createDocument;
module.exports._createDocumentList = _createDocumentList;
module.exports._getUsers = _getUsers;
module.exports._createDocument = _createDocument;
module.exports._createDocumentList = _createDocumentList;


