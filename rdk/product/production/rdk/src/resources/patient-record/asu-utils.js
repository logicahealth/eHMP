/*jslint node: true */
'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var asu = require('../../subsystems/asu/asu-process');
var async = require('async');

function applyAsuRules(req, details, callback) {
    var asuResponse = [];

    async.each(details.data.items, function(item, callback) {

        // short circuit - skipping ASU check to allow all users to see meta data of retracted notes
        if (item.status === 'RETRACTED') {
            item.summary += ' (Retracted)';
            item.localTitle += ' (Retracted)';
            if (_.find(req.session.user.vistaUserClass, function(item) {
                    return item.role === 'CHIEF, MIS';
                }) === undefined) {

                var msg = 'This note has been retracted.  See HIM personnel for access if required.';
                item.text = [{
                    content: msg
                }];
                item.stub = 'true';
                item.activity = item.activity || [];
                item.results = item.results || [];
            }
            asuResponse.push(item);
            return callback();
        }


        if (nullchecker.isNullish(item.documentDefUid)) {
            req.logger.debug({item:item}, 'asu-utils.applyAsuRules: Item NOT evaluated by ASU');
            asuResponse.push(item);
            return callback();
        }
        var asuItem = {
            data: {
                items: [item]
            }
        };
        req.logger.debug({item:item},'asu-utils.applyAsuRules: Item ready to be sent for ASU evaluation');
        asu.getAsuPermission(req, asuItem, function(asuError, asuResult) {
            if (!nullchecker.isNullish(asuError) || _.isNull(asuResult)) {
                req.logger.error({localTitle:item.localTitle, asuError:asuError, asuResult:asuResult},'asu-utils.applyAsuRules: Failed to check ASU for item ');
                item.text = [];
                return callback(asuError);
            }
            //If the user has permission to view the document, push the item to the list of items to be viewed.
            //true or false is got from the ASU java code.
            req.logger.debug({title:item.localTitle, asuResult:asuResult},'asu-utils.applyAsuRules: Result for item');

            if (asuResult === true) {
                req.logger.debug('asu-utils.applyAsuRules: pushing item to response');
                asuResponse.push(item);
                return callback();
            }
            item.text = [];
            return callback();
        });

    }, function(err) {
        if (err) {
            req.logger.error(err, 'asu-utils.applyAsuRules error in applyAsuRules');
            return callback(err);
        }
        req.logger.debug({asuResponse:asuResponse}, 'asu-utils.applyAsuRules response');
        return callback(null, asuResponse);

    });
}
function applyAsuRulesWithActionNames(req, requiredPermission, allPermissions, details, callback) {
    var asuResponse = [];
    async.each(details.data.items, function(item,callback){

        if (nullchecker.isNullish(item.documentDefUid)) {
            req.logger.debug('asu-utils.applyAsuRulesForActionNames: Item NOT evaluated by ASU. No docDefUid');
            asuResponse.push(item);
            return callback();
        }
        var asuItem = {
            data: {
                items: [item]
            },
            actionNames: allPermissions
        };
        asu.getAsuPermissionForActionNames(req, asuItem, function(asuError, asuResult) {
            var item = asuItem.data.items[0];
            if (!nullchecker.isNullish(asuError) || _.isNull(asuResult)) {
                req.logger.error({title:item.localTitle,asuError:asuError,asuResult:asuResult},'asu-utils.applyAsuRules: Failed to check ASU for item');
                item.text = [];
                return callback(asuError);
            }
            req.logger.debug({title:item.localTitle, asuResult:asuResult},'asu-utils.applyAsuRulesForActionNames: Displaying result for item');
            //Condense the ASU result to a simple array of approved permissions.
            var approved = _.chain(asuResult)
                .filter(function(perm) {return perm.hasPermission === true;})
                .map(function(perm) { return perm.actionName;})
                .value();
            if (item.status === 'RETRACTED') {
                item.summary += ' (Retracted)';
                item.localTitle += ' (Retracted)';
                if (_.find(req.session.user.vistaUserClass, function(item) {
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
            //If the user has the required permission, push the item to the list.
            if (_.contains(approved, requiredPermission)) {
                item.asuPermissions = approved;
                req.logger.debug({title:item.localTitle,asuResult:asuResult},'asu-utils.applyAsuRulesForActionNames: pushing item to response');
                asuResponse.push(item);
                return callback();
            }
            item.text = [];
            return callback();
        });

    }, function(err) {
        if (err) {
            req.logger.error(err,'asu-utils.applyAsuRulesForActionNames error in applyAsuRules');
            return callback(err);
        }
        req.logger.debug({asuResponse:asuResponse},'asu-utils.applyAsuRulesForActionNames: asuResponse');
        return callback(null, asuResponse);
    });
}


module.exports.applyAsuRules = applyAsuRules;
module.exports.applyAsuRulesWithActionNames = applyAsuRulesWithActionNames;
