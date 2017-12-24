'use strict';

/*
 * Author: David Wicksell
 */

const _ = require('lodash');
const uuid = require('node-uuid');

const errorUtil = require('../utils/error');
const clientUtils = require('./client-utils');
const CacheConnector = require('./cache-connector');
const VxSyncMetricsShim = require('./vx-sync-metrics-shim');

const memberMap = new WeakMap();

/**
 * @external Logger Bunyan logger instance
 * @see {@link https://github.com/trentm/node-bunyan}
 */

/**
 * @external VxSyncMetrics VxSync Metrics instance
 */

/**
 * @typedef {object} JdsClientConfig
 *
 * @property {string} ip_address
 * @property {number} tcp_port
 * @property {string} username Base64-encoded username. echo -n username | base64
 * @property {string} password Base64-encoded password. echo -n password | base64
 * @property {string} namespace Namespace. Example: "JSONVPR"
 */

/**
 * JdsClient is the publicly exposed part of this node module for accessing JDS.
 */
class JdsClient {
    /**
     * Create a new JdsClient.
     *
     * Variadic Constructor
     *
     * The _cacheConnector argument is intended for internal use for the purpose
     * of reducing the number of Cache connections and required licenses.
     *
     * @param {Logger} log
     * @param {VxSyncMetrics} [metrics] Only VxSync should supply this parameter
     * @param {JdsClientConfig} config
     * @param {CacheConnector} _cacheConnector
     * @return {JdsClient}
     */
    constructor(log, metrics, config, _cacheConnector = new CacheConnector()) {
        if (typeof new.target === 'undefined') {
            return new JdsClient(log, metrics, config);
        }

        // Handle optional arguments
        if (arguments.length === 2) {
            //noinspection JSValidateTypes
            config = metrics;
            //noinspection JSValidateTypes
            metrics = new VxSyncMetricsShim(log);
        }

        this.log = log;
        this.metrics = metrics;
        this.config = config;

        // memberMap is used to create private scope for methods without
        // creating new instances of functions. We want to hide cache
        // to prevent consumers from accidentally destroying data.
        memberMap.set(this, {
            cacheConnector: _cacheConnector
        });

        const result = memberMap.get(this).cacheConnector.connect(this.config);

        if (!result.ok) {
            throw new Error(result.ErrorCode + ': ' + result.ErrorMessage);
        }
    }


    /**
     * Create a new instance of the JdsClient class with a new child logger
     *
     * @param {Logger} childLog The child logger
     * @return {JdsClient} A new instance of this class using the supplied logger
     */
    childInstance(childLog) {
        const cacheConnector = memberMap.get(this).cacheConnector;
        return new JdsClient(childLog, this.metrics, this.config, cacheConnector);
    }

    connect() {
        return memberMap.get(this).cacheConnector.connect(this.config);
    }

    disconnect() {
        return memberMap.get(this).cacheConnector.disconnect();
    }


    /**
     * @callback jdsClientRequestCallback
     * @param {object|null} error
     * @param {object} [response] A statusCode property emulating HTTP status codes, and a body property with the JSON response
     * @param {object} [parsedData] The parsed data received from JDS
     */

    /**
     * Retrieve patientDemographics data using the patient's pid.  Note this is demographics
     * that comes from patient domain (NOT operational pt-select data)
     *
     * @param {string} pid The pid to use to retrieve the data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getPtDemographicsByPid(pid, callback) {
        this.log.debug('jds-client.getPtDemographicsByPid() pid: %s', pid);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getPtDemographicsByPid',
            'pid': pid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(pid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get PT Demographics by PID in Error', metricsObj);
            this.log.error('jds-client.getPtDemographicsByPid: No pid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No pid passed in'));
        }

        this.metrics.debug('JDS get PT Demographics by PID', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'GETPT^VPRJPRN',
            arguments: [pid]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPtDemographicsByPid complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve patientDemographics data using the patient's icn.  Note this is demographics
     * that comes from patient domain (NOT operational pt-select data)
     *
     * Variadic Function
     *     getPtDemographicsByIcn(icn, params, callback)
     *     getPtDemographicsByIcn(icn, callback)
     *
     * @param {string} icn The icn to use to retrieve the data
     * @param {object} [params] Pagination parameters
     * @param {number} [params.start] The offset (by count of items) to begin at for returning items
     * @param {number} [params.limit] Limit of items (by count) to add to returning items
     * @param {string} [params.startId] The first item (by item number or uid) to add to returning items
     * @param {boolean} [params.returnCounts] Whether to return a header with the totalItems and currentItemCount
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getPtDemographicsByIcn(icn, params, callback) {
        this.log.debug('jds-client.getPtDemographicsByIcn() icn: %s params: %j', icn, params);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getPtDemographicsByIcn',
            'icn': icn,
            'params': params,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic arguments
        const args = _.toArray(arguments);
        callback = args.pop();
        params = args.length > 1 ? args.pop() : {};

        const {
            start = 0,
            limit = 999999,
            startId = '',
            returnCounts = false
        } = params;

        if (_.isEmpty(icn)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get PT Demographics by ICN in Error', metricsObj);
            this.log.error('jds-client.getPtDemographicsByIcn: No icn passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No icn passed in'));
        }

        this.metrics.debug('JDS get PT Demographics by ICN', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'GETPT^VPRJPRN',
            arguments: [icn, start, limit, startId, returnCounts]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPtDemographicsByIcn complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve patient data using the patient's pid and index
     *
     * Variadic Function
     *     getPatientIndexData(pid, index, template, callback)
     *     getPatientIndexData(pid, index, callback)
     *
     * @param {string} pid The pid to use to retrieve the index data
     * @param {string} index The index name
     * @param {string} [template] The template to use to format the returned data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getPatientIndexData(pid, index, template, callback) {
        this.log.debug('jds-client.getPatientIndexData() pid: %s index: %s template: %s', pid, index, template);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getPatientIndexData',
            'pid': pid,
            'index': index,
            'template': template,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        template = args.length > 2 ? args.pop() : '';

        if (_.isEmpty(pid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Index Data in Error', metricsObj);
            this.log.error('jds-client.getPatientIndexData: No pid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No pid passed in'));
        }

        if (_.isEmpty(index)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Index Data in Error', metricsObj);
            this.log.error('jds-client.getPatientIndexData: No index passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No index passed in'));
        }

        this.metrics.debug('JDS get Patient Index Data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'INDEX^VPRJPRN',
            arguments: [pid, index, template]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPatientIndexData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve patient domain data using the patient's pid and domain
     *
     * Variadic Function
     *     getPatientDomainData(pid, domain, template, callback)
     *     getPatientDomainData(pid, domain, callback)
     *
     * @param {string} pid The pid to use to retrieve the domain data
     * @param {string} domain The domain or collection
     * @param {string} [template] The template to use to format the returned data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getPatientDomainData(pid, domain, template, callback) {
        this.log.debug('jds-client.getPatientDomainData() pid: %s domain: %s template: %s', pid, domain, template);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getPatientDomainData',
            'pid': pid,
            'domain': domain,
            'template': template,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        template = args.length > 2 ? args.pop() : '';

        if (_.isEmpty(pid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Domain Data in Error', metricsObj);
            this.log.error('jds-client.getPatientDomainData: No pid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No pid passed in'));
        }

        if (_.isEmpty(domain)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Domain Data in Error', metricsObj);
            this.log.error('jds-client.getPatientDomainData: No domain passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No domain passed in'));
        }

        this.metrics.debug('JDS get Patient Domain Data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'FIND^VPRJPRN',
            arguments: [pid, domain, template]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPatientDomainData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve patient count data using the patient's pid and count name
     *
     * @param {string} pid The pid to use to retrieve the count index data
     * @param {string} countName The count name to use to retrieve the data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getPatientCountData(pid, countName, callback) {
        this.log.debug('jds-client.getPatientCountData() pid: %s countName: %s', pid, countName);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getPatientCountData',
            'pid': pid,
            'countName': countName,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(pid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Domain Count Data in Error', metricsObj);
            this.log.error('jds-client.getPatientCountData: No pid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No pid passed in'));
        }

        if (_.isEmpty(countName)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Count Data in Error', metricsObj);
            this.log.error('jds-client.getPatientCountData: No countName passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No countName passed in'));
        }

        this.metrics.debug('JDS get Domain Count Data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'COUNT^VPRJPRN',
            arguments: [pid, countName]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPatientCountData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve patient data using the patient's pid and uid
     *
     * Variadic Function
     *     getPatientDataByPidAndUid(pid, uid, template, callback)
     *     getPatientDataByPidAndUid(pid, uid, callback)
     *
     * @param {string} pid The pid to use to retrieve the data
     * @param {string} uid The patient data key to use to retrieve the data
     * @param {string} [template] The template to use to format the returned data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getPatientDataByPidAndUid(pid, uid, template, callback) {
        this.log.debug('jds-client.getPatientDataByPidAndUid() pid: %s uid: %s template: %s', pid, uid, template);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getPatientDataByPidAndUid',
            'pid': pid,
            'uid': uid,
            'template': template,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        template = args.length > 2 ? args.pop() : '';

        if (_.isEmpty(pid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Data by PID and UID in Error', metricsObj);
            this.log.error('jds-client.getPatientDataByPidAndUid: No pid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No pid passed in'));
        }

        if (_.isEmpty(uid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Data by PID and UID in Error', metricsObj);
            this.log.error('jds-client.getPatientDataByPidAndUid: No uid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No uid passed in'));
        }

        this.metrics.debug('JDS get Patient Data by PID and UID', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'GETOBJ^VPRJPRN',
            arguments: [pid, uid, template]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPatientDataByPidAndUid complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve patient data using the data's uid
     *
     * Variadic Function
     *     getPatientDataByUid(uid, params, callback)
     *     getPatientDataByUid(uid, callback)
     *
     * @param {string} uid The patient data key to use to retrieve the data
     * @param {object} [params]
     * @param {string} [params.template] Template to use to format the returned data
     * @param {number} [params.start] The offset (by count of items) to begin at for returning items
     * @param {number} [params.limit] Limit of items (by count) to add to returning items
     * @param {string} [params.startId] The first item (by item number or uid) to add to returning items
     * @param {boolean} [params.returnCounts] Whether to return a header with the totalItems and currentItemCount
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getPatientDataByUid(uid, params, callback) {
        this.log.debug('jds-client.getPatientDataByUid() uid: %s params: %j', uid, params);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getPatientDataByUid',
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic arguments
        const args = _.toArray(arguments);
        callback = args.pop();
        params = args.length > 1 ? args.pop() : '';

        const {
            template = '',
            start = 0,
            limit = 999999,
            startId = '',
            returnCounts = false
        } = params;

        if (_.isEmpty(uid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Patient Domain Data in Error', metricsObj);
            this.log.error('jds-client.getPatientDataByUid: No uid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No uid passed in'));
        }

        this.metrics.debug('JDS get Patient Data by UID', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'GETUID^VPRJPRN',
            arguments: [uid, template, start, limit, startId, returnCounts]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPatientDataByUid complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve all index data of an index name
     *
     * Variadic Function
     *     getAllPatientIndexData(index, params, callback)
     *     getAllPatientIndexData(index, callback)
     *
     * @param {string} index The index name
     * @param {object} [params]
     * @param {string} [params.template] Template to use to format the returned data
     * @param {string} [params.order] Order of the data items returned [asc|desc] [ci|cs]
     * @param {string} [params.range] A range of keys to limit the returning items
     * @param {string} [params.bail] Similar to limit, but faster, and is unable to calculate totalItems in returnCounts
     * @param {string} [params.filter] Filter expression E.g. eq(uid,urn:va:datastore:1)
     * @param {number} [params.start] The offset (by count of items) to begin at for returning items
     * @param {number} [params.limit] Limit of items (by count) to add to returning items
     * @param {string} [params.startId] The first item (by item number or uid) to add to returning items
     * @param {boolean} [params.returnCounts] Whether to return a header with the totalItems and currentItemCount
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getAllPatientIndexData(index, params, callback) {
        this.log.debug('jds-client.getAllPatientIndexData() index: %s params: %j', index, params);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getAllPatientIndexData',
            'index': index,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic arguments
        const args = _.toArray(arguments);
        callback = args.pop();
        params = args.length > 1 ? args.pop() : {};

        const {
            template = '',
            order = '',
            range = '',
            bail = '',
            filter = '',
            start = 0,
            limit = 999999,
            startId = '',
            returnCounts = false
        } = params;

        if (_.isEmpty(index)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get All Index Data in Error', metricsObj);
            this.log.error('jds-client.getAllPatientIndexData: No index passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No index passed in'));
        }

        this.metrics.debug('JDS get All Index Data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'ALLINDEX^VPRJPRN',
            arguments: [index, template, order, range, bail, filter, start, limit, startId, returnCounts]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getAllPatientIndexData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve all domain data of a collection
     *
     * Variadic Function
     *     getAllPatientDomainData(domain, filter, template, callback)
     *     getAllPatientDomainData(domain, filter, callback)
     *
     * @param {string} domain The domain or collection
     * @param {string} filter Filter expression E.g. eq(uid,urn:va:datastore:1)
     * @param {object} [params]
     * @param {string} [params.template] Template to use to format the returned data
     * @param {string} [params.order] Order of the data items returned [asc|desc] [ci|cs]
     * @param {string} [params.bail] Similar to limit, but faster, and is unable to calculate totalItems in returnCounts
     * @param {number} [params.start] The offset (by count of items) to begin at for returning items
     * @param {number} [params.limit] Limit of items (by count) to add to returning items
     * @param {string} [params.startId] The first item (by item number or uid) to add to returning items
     * @param {boolean} [params.returnCounts] Whether to return a header with the totalItems and currentItemCount
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getAllPatientDomainData(domain, filter, params, callback) {
        this.log.debug('jds-client.getAllPatientDomainData() domain: %s filter: %s params: %j', domain, filter, params);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getAllPatientDomainData',
            'domain': domain,
            'filter': filter,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic arguments
        const args = _.toArray(arguments);
        callback = args.pop();
        params = args.length > 2 ? args.pop() : {};

        const {
            template = '',
            order = '',
            bail = '',
            start = 0,
            limit = 999999,
            startId = '',
            returnCounts = false
        } = params;

        if (_.isEmpty(domain)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get All Domain Data in Error', metricsObj);
            this.log.error('jds-client.getAllPatientDomainData: No domain passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No domain passed in'));
        }

        if (_.isEmpty(filter)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get All Domain Data in Error', metricsObj);
            this.log.error('jds-client.getAllPatientDomainData: No filter passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No filter passed in'));
        }

        this.metrics.debug('JDS get All Domain Data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'ALLFIND^VPRJPRN',
            arguments: [domain, template, order, bail, filter, start, limit, startId, returnCounts]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getAllPatientDomainData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve all count data of a count name
     *
     * @param {string} countName The count name to use to retrieve the data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getAllPatientCountData(countName, callback) {
        this.log.debug('jds-client.getAllPatientCountData() countName: %s', countName);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getAllPatientCountData',
            'countName': countName,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(countName)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get All Count Data in Error', metricsObj);
            this.log.error('jds-client.getAllPatientCountData: No countName passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No countName passed in'));
        }

        this.metrics.debug('JDS get All Count Data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'ALLCOUNT^VPRJPRN',
            arguments: [countName]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getAllPatientCountData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve operational data object data using a uid
     *
     * Variadic Function
     *     getOperationalDataByUid(uid, template, callback)
     *     getOperationalDataByUid(uid, callback)
     *
     * @param {string} uid The uid to use to retrieve the data
     * @param {string} [template] The template to use to format the returned data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getOperationalDataByUid(uid, template, callback) {
        this.log.debug('jds-client.getOperationalDataByUid() uid: %s template: %s', uid, template);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getOperationalDataByUid',
            'uid': uid,
            'template': template,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        template = args.length > 1 ? args.pop() : '';

        if (_.isEmpty(uid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Operational Data by UID in Error', metricsObj);
            this.log.error('jds-client.getOperationalDataByUid: No uid passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No uid passed in'));
        }

        this.metrics.debug('JDS get Operational Data by UID', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'GETOBJ^VPRJDRN',
            arguments: [uid, template]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getOperationalDataByUid complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve operational data object data using an index
     *
     * Variadic function
     *     getOperationalIndexData(index, template, callback)
     *     getOperationalIndexData(index, callback)
     *
     * @param {string} index The index to use to retrieve the data
     * @param {string} [template] The template to use to format the returned data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getOperationalIndexData(index, template, callback) {
        this.log.debug('jds-client.getOperationalIndexData() index: %s template: %s', index, template);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getOperationalIndexData',
            'index': index,
            'template': template,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        template = args.length > 1 ? args.pop() : '';

        if (_.isEmpty(index)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Operational Index Data in Error', metricsObj);
            this.log.error('jds-client.getOperationalIndexData: No index passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No index passed in'));
        }

        this.metrics.debug('JDS get Operational Index Data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'INDEX^VPRJDRN',
            arguments: [index, template]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getOperationalIndexData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve count of operational data objects against a given count
     *
     * Variadic function
     *     getOperationalDataCount(count, all, callback)
     *     getOperationalDataCount(count, callback)
     *
     * @param {string} countName The name of the count to use
     * @param {boolean} [all] Whether to count across patients, true if passed
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getOperationalDataCount(countName, all, callback) {
        this.log.debug('jds-client.getOperationalDataCount() countName: %s all: %s', countName, all);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getOperationalDataCount',
            'countName': countName,
            'all': all,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        all = args.length > 1 ? args.pop() : false;

        // Ensure that all is either true or false
        all = _.isBoolean(all) ? all : false;

        if (_.isEmpty(countName)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Operational Data Count in Error', metricsObj);
            this.log.error('jds-client.getOperationalDataCount: No countName passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No countName passed in'));
        }

        this.metrics.debug('JDS get Operational Data Count', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'COUNT^VPRJDRN',
            arguments: [countName, all]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getOperationalDataCount complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }

    /**
     * Retrieve operational data object data from a collection.
     *
     * Variadic function
     *     getOperationalDataCollection(collection, template, callback)
     *     getOperationalDataCollection(collection, callback)
     *
     * @param {string} collection The collection to use to retrieve the data
     * @param {string} [template] The template to use to format the returned data
     * @param {jdsClientRequestCallback} callback
     * @return {*}
     */
    getOperationalDataCollection(collection, template, callback) {
        this.log.debug('jds-client.getOperationalDataCollection() collcetion: %s template: %s', collection, template);

        const metricsObj = {
            'subsystem': 'JDS',
            'action': 'getOperationalDataCollection',
            'collection': collection,
            'template': template,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        template = args.length > 1 ? args.pop() : '';

        if (_.isEmpty(collection)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('JDS get Operational Data Collection in Error', metricsObj);
            this.log.error('jds-client.getOperationalDataCollection: No collection passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No collection passed in'));
        }

        this.metrics.debug('JDS get Operational Data Collection', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'FIND^VPRJDRN',
            arguments: [collection, template]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getOperationalDataCollection complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }
}


module.exports = JdsClient;
