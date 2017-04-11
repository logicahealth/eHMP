'use strict';

var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var _ = require('lodash');
var pidValidator = rdk.utils.pidValidator;

module.exports = {
    getLastWorkspace: function(req, res) {
        return getLastWorkspace(req, res);
    },
    getLastWorkspaceWithCallback: function(req, res, pid, callback) {
        return getLastWorkspace(req, res, pid, callback);
    }
};

function getLastWorkspace(req, res, otherPid, callback) {
    req.logger.debug('getEhmpUserContext resource called');
    var uid = req.session.user.uid;
    var pid = req.param('pid') || otherPid;
    if (_.isUndefined(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid');
    }
    if (_.isUndefined(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid');
    }
    var patientIdentifier = '';
    if (pidValidator.isIcn(pid)) {
        patientIdentifier = 'icn:' + pid;
    } else if (pidValidator.isPidEdipi(pid)) {
        patientIdentifier = 'edipi:' + pid;
    } else if (pidValidator.isSiteDfn(pid)) {
        patientIdentifier = 'pid:' + pid;
    } else {
        res.status(rdk.httpstatus.bad_request).rdkSend('Invalid Pid. Please pass either ICN or Primary Site ID.');
    }
    var pjdsOptions = {
        store: 'ehmpusers',
        key: uid
    };
    var returnLastWorkspace = function(resultObj, httpStatus) {
        if (!_.isUndefined(callback)) {
            return callback(resultObj);
        } else {
            return res.status(httpStatus).rdkSend(resultObj);
        }
    };
    pjds.get(req, res, pjdsOptions, function(error, response) {
        var resultObj = {};
        resultObj.status = _.get(response, 'statusCode');
        resultObj.data = [];
        if (error) {
            resultObj.status = 202;
            return returnLastWorkspace(resultObj, rdk.httpstatus.accepted);
        }
        var recentPatients = response.data.eHMPUIContext || [];
        if (recentPatients.length === 0) {
            return returnLastWorkspace(resultObj, rdk.httpstatus.ok);
        }
        var targetRecentPatient = _.find(recentPatients, {
            'patientIdentifier': patientIdentifier
        });
        if (_.isUndefined(targetRecentPatient)) {
            return returnLastWorkspace(resultObj, rdk.httpstatus.ok);
        } else {
            resultObj.data = [{
                workspaceContext: targetRecentPatient.workspaceContext
            }];
            return returnLastWorkspace(resultObj, rdk.httpstatus.ok);
        }
    });
}
