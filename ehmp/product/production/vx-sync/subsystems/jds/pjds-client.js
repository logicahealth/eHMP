'use strict';

require('../../env-setup');

var _ = require('underscore');
var uuid = require('node-uuid');
var format = require('util').format;
var request = require('request');
var inspect = require(global.VX_UTILS + 'inspect');
var errorUtil = require(global.VX_UTILS + 'error');
var objUtil = require(global.VX_UTILS + 'object-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var uuid = require('node-uuid');
var VxSyncForeverAgent = require(global.VX_UTILS + 'vxsync-forever-agent');

/**
 * Creates an instance of the PjdsClient
 * @constructor
 * @param log - the log object used for this instance of the PjdsClient
 * @param metrics - the metrics object used for this instance of the PjdsClient
 * @param config - the vxsync configuration object used for this instance of the PjdsClient
 **/
function PjdsClient(log, metrics, config) {
    if (!(this instanceof PjdsClient)) {
        return new PjdsClient(log, metrics, config);
    }

    this.log = log;
    this.metrics = metrics;
    this.config = config;
}

/**
 * Generate a uid from an id and a site hash
 * @param {string} id - either a pid in the format of siteHash;DFN or the IEN of the user (the site hash is ignored)
 * @param {string} site - the site hash for the patient or user
 **/
function generateBlistUid(id, site, list) {
    var uid = 'urn:va:'+list+':'+site+':';

    if (list === 'patient') {
	    var parts = pidUtil.extractPiecesFromPid(id);
	    uid += parts.dfn+':'+parts.dfn;
	    if (site !== parts.site) {
	    	return 'Invalid PID for site';
	    }
	} else if (list === 'user') {
		uid += id;
	} else {
		return 'Invalid list type';
	}

    return uid;
}

/**
 * Executes a PJDS command
 * @param path - The PJDS REST URL (Without that http://<ip>:port)
 * @param dataToPost - If this is a PUT or POST, then this is the data that is going to be sent in the BODY of the request
 * @param method - The type of HTTP method (i.e. GET, PUT, POST, etc)
 * @param {function} callback - The callback function that should be called when the execute is completed
 **/
PjdsClient.prototype.execute = function(path, dataToPost, method, metricsObj, callback) {
    this.log.debug(path);
    this.log.debug(inspect(dataToPost));
    metricsObj.timer = 'stop';
    if (_.isEmpty(this.config.pjds)) {
        this.metrics.debug('PJDS Execute in Error', metricsObj);
        return setTimeout(callback, 0, errorUtil.createFatal('No value passed for PJDS configuration'));
    }

    var url = format('%s://%s:%s%s', this.config.pjds.protocol, this.config.pjds.host, this.config.pjds.port, path);

    if (method === 'POST' || method === 'PUT') {
        if (_.isEmpty(dataToPost)) {
            this.log.error('pjds-client.execute(): Tried to POST or PUT without dataToPost. url: %s', url);
            this.metrics.debug('PJDS Execute in Error', metricsObj);
            return setTimeout(callback, 0, errorUtil.createFatal('No dataToPost passed to store'));
        } else {
            var dataToPostWithoutPwd = objUtil.removeProperty(objUtil.removeProperty(dataToPost, 'accessCode'), 'verifyCode');
            this.log.debug('pjds-client.execute(): Sending message to PJDS. %s -> dataToPost: %j', url, dataToPostWithoutPwd);
        }
    } else {
        this.log.debug('pjds-client.execute(): Sending message to PJDS. url: %s', url);
        dataToPost = undefined;
    }

    var self = this;
    request({
        url: url,
        method: method || 'GET',
        json: dataToPost,
        timeout: this.config.pjds.timeout || 60000,
        agentClass: VxSyncForeverAgent
    }, function(error, response, body) {
        self.log.debug('pjds-client.execute(): posted data to PJDS %s', url);

        if (error || response.statusCode === 500) {
            self.log.error('pjds-client.execute(): Unable to access PJDS endpoint: %s %s', method, url);
            self.log.error('%j %j', error, body);

            self.metrics.debug('PJDS Execute in Error', metricsObj);
            return callback(errorUtil.createTransient((error || body || 'Unknown Error')), response);
        }

        var json;
        if (_.isEmpty(body)) {
            self.log.debug('pjds-client.execute(): Response body is empty.  Status code:', response.statusCode);
            self.metrics.debug('PJDS Execute complete', metricsObj);
            return callback(null, response);
        }

        try {
            json = _.isObject(body) ? body : JSON.parse(body);
        } catch (parseError) {
            self.log.error('pjds-client.execute(): Unable to parse JSON response:', body);
            self.log.error('pjds-client.execute(): Unable to parse JSON response, and response is defined.  this is actually bad');
            self.log.error(inspect(parseError));
            self.log.error('::' + body + '::');
            json = body;
        }

        var responseWithoutPwd = objUtil.removeProperty(objUtil.removeProperty(json, 'accessCode'), 'verifyCode');
        self.log.debug('pjds-client.execute(): PJDS response for the caller to handle %j', responseWithoutPwd);
        self.metrics.debug('PJDS Execute complete', metricsObj);
        callback(null, response, json);
    });
};

/**
 * Retrieves a list of ehmp active users
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.getActiveUsers = function(callback) {
    this.log.debug('pjds-client.getActiveUser()');
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'getActiveUser',
        'process': uuid.v4(),
        'timer': 'start'
    };
    this.metrics.debug('PJDS Get OSync Active User by uid', metricsObj);

    var args = _.toArray(arguments);
    callback = args.pop();

    var path = '/activeusr/';

    if (args.length > 0) {
        path += args[0].filter;
    }

    this.execute(path, null, 'GET', metricsObj, callback);
};
/**
 * Add an active user to the list of ehmp active users
 * @param activeUser - The user to add to the active user list
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.addActiveUser = function(activeUser, callback) {
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'addActiveUser',
        'uid': activeUser.uid,
        'process': uuid.v4(),
        'timer': 'start'
    };

    this.execute('/activeusr/' + activeUser.uid, activeUser, 'PUT', metricsObj, callback);
};

/**
 * Remove (delete) a user from the ehmp active user list
 * @param {string} uid - The identifier of the user to delete from the ehmp active user list
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.removeActiveUser = function(uid, callback) {
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'removeActiveUser',
        'uid': uid,
        'process': uuid.v4(),
        'timer': 'start'
    };

    this.execute('/activeusr/' + uid, null, 'DELETE', metricsObj, callback);
};

/**
 * Retrieves a list of osync clinics for a given site
 * @param {string} site - The site to return a list of clinics for
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.getOSyncClinicsBySite = function(site, callback) {
    this.log.debug('pjds-client.getOSyncClinicsBySite() %j', site);
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'getOSyncClinicsBySite',
        'site': site,
        'process': uuid.v4(),
        'timer': 'start'
    };
    this.metrics.debug('PJDS Get OSync Clinics By Site', metricsObj);

    var path = '/osynclinic/index/osynclinic-site?range=' + site;
    this.execute(path, null, 'GET', metricsObj, callback);
};

/**
 * Retrieves a single osync clinic
 * @param {string} uid - The UID of an osync clinic to retrieve the details for
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.getOSyncClinicsByUid = function(uid, callback) {
    this.log.debug('pjds-client.getOSyncClinicsBySite() %j', uid);
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'getOSyncClinicsByUid',
        'uid': uid,
        'process': uuid.v4(),
        'timer': 'start'
    };
    this.metrics.debug('PJDS Get OSync Clinics By Uid', metricsObj);

    var path = '/osynclinic/' + uid;
    this.execute(path, null, 'GET', metricsObj, callback);
};

/**
 * Add (Create) an osync clinic
 * @param {string} site - The site of the osync clinic to add
 * @param {string} uid - The UID of the osync clinic to add
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.createOSyncClinic = function(site, uid, callback) {
    this.log.debug('pjds-client.createOSyncClinic() site: %s uid: %s', site, uid);
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'createOSyncClinic',
        'site': site,
        'uid': uid,
        'process': uuid.v4(),
        'timer': 'start'
    };
    this.metrics.debug('PJDS Post Create OSync Clinic', metricsObj);

    if ((_.isEmpty(uid)) || (_.isEmpty(site))) {
        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Post Create OSync Clinic in Error', metricsObj);
        return setTimeout(callback, 0, errorUtil.createFatal('No uid or site passed in'));
    }

    var postBody = {
        'uid': uid,
        'site': site
    };

    var path = '/osynclinic';
    this.execute(path, postBody, 'POST', metricsObj, callback);
};

/**
 * Remove (delete) an osync clinic
 * @param {string} uid - The UID of the osync clinic to add
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.deleteOSyncClinic = function(uid, callback) {
    this.log.debug('pjds-client.createOSyncClinic() uid: %s', uid);
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'createOSyncClinic',
        'uid': uid,
        'process': uuid.v4(),
        'timer': 'start'
    };
    this.metrics.debug('PJDS delete OSync Clinic', metricsObj);

    if ((_.isEmpty(uid))) {
        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Delete OSync Clinic in Error', metricsObj);
        return setTimeout(callback, 0, errorUtil.createFatal('No uid passed in'));
    }

    var path = '/osynclinic/' + uid;
    this.execute(path, null, 'DELETE', metricsObj, callback);
};

/**
 * Add a user or patient to the osync blist
 * @param {string} id - The identifier of the user or patient to add to the osync blist
 * @param {string} site - The site hash of the user or patient to add to the osync blist
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.addToOsyncBlist = function(id, site, list, callback) {
    var uid = generateBlistUid(id, site, list);
    if (uid.substring(0,3) !== 'urn') {
    	return callback(uid);
    }

    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'addToOsyncBlist',
        'id': id,
        'process': uuid.v4(),
        'timer': 'start'
    };

    var payload = {
        'id': id,
        'uid': uid,
        'site': site
    };

    this.execute('/osyncBlist', payload, 'POST', metricsObj, callback);
};

/**
 * Remove (delete) a user or patient from the osync blist
 * @param {string} id - The identifier of the user or patient to delete from the osync blist
 * @param {string} site - The site hash of the user or patient to delete from the osync blist
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.removeFromOsyncBlist = function(id, site, list, callback) {
    var uid = generateBlistUid(id, site, list);
    if (uid.substring(0,3) !== 'urn') {
    	return callback(uid);
    }

    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'removeFromOsyncBlist',
        'id': id,
        'process': uuid.v4(),
        'timer': 'start'
    };

    this.execute('/osyncBlist/' + uid, null, 'DELETE', metricsObj, callback);
};

/**
 * Retrieve the user or patient osync blist
 * @param {string} list - The name of the osync blist to retrieve (either patient or user)
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.getOsyncBlist = function(list, callback) {
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'getOsyncBlist',
        'list': list,
        'process': uuid.v4(),
        'timer': 'start'
    };

    this.execute('/osyncBlist/index/osyncblist-' + list, null, 'GET', metricsObj, callback);
};


/**
 * Retrieve the user or patient from osync blist
 * @param {string} uid - The uid to retrieve
 * @param callback - The callback function that should be called when the action is completed
 **/
PjdsClient.prototype.getOsyncBlistByUid = function(uid, callback) {
    var metricsObj = {
        'subsystem': 'PJDS',
        'action': 'getOsyncBlistByUid',
        'uid': uid,
        'process': uuid.v4(),
        'timer': 'start'
    };

    this.execute('/osyncBlist/' + uid, null, 'GET', metricsObj, callback);
};

module.exports = PjdsClient;