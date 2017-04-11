'use strict';

var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var asu = require('../../subsystems/asu/asu-process');
var async = require('async');

var NO_PERMISSION_FOR_ADDENDUM = 'You may not VIEW this UNSIGNED Addendum.';

function applyAsuRules(req, details, callback) {
    async.series({
        defaultUser: function (cb) {
            asu.getDefaultUserClass(req, function (error, response, body) {
                cb(error, body);
            });
        }
    }, function (error, response) {
        if (error) {
            req.logger.debug(error, 'asuProcess.getAsuPermissionForActionNames: Got an error fetching default USER class from JDS');
            return callback(error);
        }

        req.logger.debug({response: response}, 'asuProcess.getAsuPermission: getDefaultUserClass response');

        var items = JSON.parse(response.defaultUser).data.items;

        if (_.isEmpty(items)) {
            req.logger.debug({'response.defaultUser': response.defaultUser}, 'asuProcess.getAsuPermissionForActionNames: Could NOT find default USER class in JDS');
            return callback(error);
        }

        var documents = splitAccessDocuments(req, details, items);

        async.series([function (cb) {

            var httpConfig = _.extend({}, req.app.config.asuServer, {
                logger: req.logger,
                json: true,
                url: "/asu/rules/multiAccessDocument",
                body: {'documents': documents.request}
            });

            http.post(httpConfig, function (err, response, data) {
                req.logger.debug({response: response}, 'asuProcess.evaluate results');
                if (err) {
                    req.logger.info(err);
                    return cb(err);
                }

                return cb(false, data);
            });
        }], function (err, result) {
            if (err) {
                req.logger.error({error: err});
                callback(err);
            } else {
                var data = result[0];
                var uncheckedIndex = 0;

                if (err) {
                    req.logger.error({
                        localTitle: item.localTitle,
                        asuError: err,
                        asuResult: result
                    }, 'asu-utils.applyAsuRules: Failed to check ASU for item ');
                    return callback(err);
                }

                _.each(details.data.items, function(item) {
                    if (nullchecker.isNullish(item.documentDefUid) || item.status === 'RETRACTED') {
                        return;
                    }
                    var asuResult = data[uncheckedIndex++];
                    if (asuResult === true) {
                        req.logger.debug('asu-utils.applyAsuRules: pushing item to response');
                        documents.response.push(item);
                        return;
                    }
                    item.text = [];
                });
                callback(null, documents.response);
            }
        });
    });
}

function applyAsuRulesWithActionNames(req, requiredPermission, allPermissions, details, callback) {
    async.series({
        defaultUser: function (cb) {
            asu.getDefaultUserClass(req, function (error, response, body) {
                cb(error, body);
            });
        }
    }, function (error, response) {
        if (error) {
            req.logger.debug(error, 'asuProcess.getAsuPermissionForActionNames: Got an error fetching default USER class from JDS');
            return callback(error);
        }

        req.logger.debug({response: response}, 'asuProcess.getAsuPermission: getDefaultUserClass response');

        var items = JSON.parse(response.defaultUser).data.items;

        if (_.isEmpty(items)) {
            req.logger.debug({'response.defaultUser': response.defaultUser}, 'asuProcess.getAsuPermissionForActionNames: Could NOT find default USER class in JDS');
            return callback(error);
        }

        var documents = splitActionDocuments(req, details, items, allPermissions);

        async.series([function (cb) {
            // Request the permissions on the documents

            var httpConfig = _.extend({}, req.app.config.asuServer, {
                logger: req.logger,
                json: true,
                url: "/asu/rules/getMultiDocPermissions",
                body: {'documents': documents.request}
            });

            http.post(httpConfig, function (err, response, data) {
                req.logger.debug({response: response}, 'asuProcess.evaluate results');
                if (err) {
                    req.logger.info(err);
                    return cb(err);
                }

                return cb(false, data);
            });
        }], function (err, result) {
            // Modify the documents with the results from the permission request.

            if (err) {
                req.logger.error({error: err});
                callback(err);
            } else {
                var data = result[0];
                var uncheckedIndex = 0;

                _.each(details.data.items, function(item) {
                    if(nullchecker.isNullish(item.documentDefUid)) {
                        // These documents were added to the list before the request went out.
                        formatAddendum(item);
                        return;
                    }

                    var approved = [];
                    _.each(data[uncheckedIndex], function(val) {
                        if(val.hasPermission === true) {
                            approved.push(val.actionName);
                        }
                    });

                    uncheckedIndex++;

                    redactDocument(req, item, approved);

                    //If the user has the required permission, push the item to the list.
                    if (_.contains(approved, requiredPermission)) {
                        item.asuPermissions = approved;
                        req.logger.debug({
                            title: item.localTitle,
                            asuResult: item
                        }, 'asu-utils.applyAsuRulesForActionNames: pushing item to response');
                        documents.response.push(item);
                    } else {
                        formatAddendum(item);
                    }
                });

                callback(null, documents.response);
            }
        });
    });
}


/**
 * Splits the documents between the ones that need permissions and the ones that do not.
 * @returns {{response: Array, request: Array}}
 */
function splitActionDocuments(req, details, items, allPermissions) {
    var responseArray = [];
    var requestArray = [];

    async.each(details.data.items, function (item, callback) {
        if (nullchecker.isNullish(item.documentDefUid)) {
            req.logger.debug('asu-utils.applyAsuRulesForActionNames: Item NOT evaluated by ASU. No docDefUid');
            responseArray.push(item);
            return setImmediate(callback);
        }

        // Format getPermission expects
        var asuItem = {
            data: {
                items: [item]
            },
            actionNames: allPermissions
        };

        asu.getPermission(req, asuItem, items, function (asuError, asuResult) {
            if (asuError) {
                req.logger.error({error: asuError});
                callback(asuError);
            } else {
                requestArray.push(asuResult);
            }
        });
    });

    return {
        response: responseArray,
        request: requestArray
    };
}


/**
 * Splits the documents between the ones that need permissions and the ones that do not.
 * @returns {{response: Array, request: Array}}
 */
function splitAccessDocuments(req, details, items) {
    var responseArray = [];
    var requestArray = [];

    async.each(details.data.items, function (item, callback) {
        if (item.status === 'RETRACTED') {
            redactDocument(req, item, []);
            responseArray.push(item);
            return;
        }

        if (nullchecker.isNullish(item.documentDefUid)) {
            req.logger.debug({item: item}, 'asu-utils.applyAsuRules: Item NOT evaluated by ASU');
            responseArray.push(item);
            return;
        }

        // Format getPermission expects
        var asuItem = {
            data: {
                items: [item]
            }
        };

        asu.getPermission(req, asuItem, items, function (asuError, asuResult) {
            if (asuError) {
                req.logger.error({error: asuError});
                callback(asuError);
            } else {
                requestArray.push(asuResult)
            }
        });
    });

    return {
        response: responseArray,
        request: requestArray
    };
}


function redactDocument(req, item, approved) {
    if (item.status === 'RETRACTED') {
        item.summary += ' (Retracted)';
        item.localTitle += ' (Retracted)';
        if (_.find(req.session.user.vistaUserClass, function (item) {
                return item.role === 'CHIEF, MIS';
            }) === undefined) {

            var msg = 'This note has been retracted.  See HIM personnel for access.';
            item.text = [{
                content: msg
            }];
            item.stub = 'true';
            item.activity = item.activity || [];
            item.results = item.results || [];
        }
        if (!_.contains(approved, 'VIEW')) {
            approved.push('VIEW');
        }
    }
}


function formatAddendum(item) {
    if (item.noteType === 'ADDENDUM') {
        if (item.addendumBody) {
            item.addendumBody = NO_PERMISSION_FOR_ADDENDUM;
        }

        _.each(item.text, function (textElement) {
            textElement.content = NO_PERMISSION_FOR_ADDENDUM;

            if (textElement.contentPreview) {
                textElement.contentPreview = NO_PERMISSION_FOR_ADDENDUM;
            }
        });
    }
}


module.exports.NO_PERMISSION_FOR_ADDENDUM = NO_PERMISSION_FOR_ADDENDUM;
module.exports.applyAsuRules = applyAsuRules;
module.exports.applyAsuRulesWithActionNames = applyAsuRulesWithActionNames;
