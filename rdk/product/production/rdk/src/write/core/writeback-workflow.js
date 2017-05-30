'use strict';

var async = require('async');
var _ = require('lodash');
var rdk = require('../../core/rdk');
var jdsDirectWriter = require('./jds-direct-writer');
var rpcClientFactory = require('./rpc-client-factory');
var readOnlyRpcClientFactory = require('./../../subsystems/vista-read-only-subsystem');
var pjdsWriter = require('../orders/common/orders-common-pjds-writer');
var uidUtil = require('./../../utils/uid-utils');

function getVistaConfig(logger, appConfig, user) {
    var site = _.get(user, 'site');
    if (!site) {
        logger.error('getVistaConfig: user site not found');
    }
    var siteConfiguration = _.get(appConfig, ['vistaSites', site]);
    if (!siteConfiguration) {
        logger.error('getVistaConfig: site configuration not found');
    }
    var context = _.get(appConfig, ['rpcConfig', 'context']);
    if (!context) {
        logger.error('getVistaConfig: app rpcConfig context not found');
    }
    var accessCode = _.get(user, 'accessCode');
    if (!accessCode) {
        logger.error('getVistaConfig: user access code not found');
    }
    var verifyCode = _.get(user, 'verifyCode');
    if (!verifyCode) {
        logger.error('getVistaConfig: user verify code not found');
    }
    var division = _.get(user, 'division');
    if (!division) {
        logger.error('getVistaConfig: user division not found');
    }
    var vistaConfig = _.extend({}, siteConfiguration, {
        site: site,
        context: context,
        accessCode: accessCode,
        verifyCode: verifyCode,
        division: division
    });
    return vistaConfig;
}

module.exports = function writebackWorkflow(req, res, tasks) {
    var writebackContext = {
        logger: req.logger,
        audit: req.audit,
        vistaConfig: getVistaConfig(req.logger, req.app.config, req.session.user),
        siteHash: req.session.user.site || getSystemAuthorSite(req),
        siteParam: req.param('site'), //used to pass in site.  e.g. lab order detail site
        duz: req.session.user.duz,
        cookie: req.headers.cookie,
        authorization: req.headers.authorization,
        appConfig: req.app.config,
        app: req.app,
        model: req.body,
        interceptorResults: req.interceptorResults,
        resourceId: req.param('resourceId'),
        uidList: req.param('uid'),
        loadReference: (req.param('loadReference') === 'true'),
        vprModel: null,
        vprResponse: null,
        vprResponseStatus: 200,
        rpcClient: null,
        vistaUserClass: req.session.user.vistaUserClass
    };

    //check interceptorResults.patientIdentifiers.site against req.session.user.site
    if (_.isEmpty(_.get(writebackContext, 'interceptorResults.patientIdentifiers.site', ''))) {
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('The request can not determine the site for the record requested');
    } else if (writebackContext.interceptorResults.patientIdentifiers.site !== writebackContext.siteHash) {
        return res.status(rdk.httpstatus.precondition_failed)
            .rdkSend('This requested record belongs to a site other than the site currently logged into.');
    }

    var elevatedTaskResponse = {};
    var elevatedTasks = [jdsDirectWriter, pjdsWriter];
    tasks = _.map(tasks, function(task) {
        if (_.contains(elevatedTasks, task)) {
            return task.bind(null, writebackContext, elevatedTaskResponse);
        }
        return task.bind(null, writebackContext);
    });

    async.series(tasks, function(err) {
        rpcClientFactory.closeRpcClient(writebackContext);
        readOnlyRpcClientFactory.closeAllRpcSystemClients(writebackContext);
        if (err) {
            req.logger.error(err);
            return res.status(500).rdkSend(err);
        }
        if (!writebackContext.vprResponse) {
            var undefinedResponse = {};
            undefinedResponse.error = 'Undefined response from the resource';
            req.logger.error('Writeback error: undefined response from the resource');
            return res.status(500).rdkSend(undefinedResponse);
        }
        return res.status(writebackContext.vprResponseStatus).rdkSend(_.extend({
            status: writebackContext.vprResponseStatus,
            data: writebackContext.vprResponse
        }, elevatedTaskResponse));
    });
};

function getSystemAuthorSite(req) {
    if (_.get(req, 'session.user.consumerType', '') !== 'system') {
        return '';
    }
    var authorUid = _.get(req, 'body.authorUid', '');
    var authorSite = uidUtil.extractSiteHash(authorUid);
    return authorSite;
}


module.exports._getVistaConfig = getVistaConfig;
