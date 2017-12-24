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
 * @typedef {object} PjdsClientConfig
 *
 * @property {string} ip_address
 * @property {number} tcp_port
 * @property {string} username Base64-encoded username. echo -n username | base64
 * @property {string} password Base64-encoded password. echo -n password | base64
 * @property {string} namespace Namespace. Example: "JSONVPR"
 */

/**
 * PjdsClient is the publicly exposed part of this node module for accessing PJDS.
 */
class PjdsClient {
    /**
     * Create a new PjdsClient.
     *
     * Variadic Constructor
     *
     * The _cacheConnector argument is intended for internal use for the purpose
     * of reducing the number of Cache connections and required licenses.
     *
     * @param {Logger} log
     * @param {VxSyncMetrics} [metrics] Only VxSync should supply this parameter
     * @param {PjdsClientConfig} config
     * @param {CacheConnector} _cacheConnector
     * @return {PjdsClient}
     */
    constructor(log, metrics, config, _cacheConnector = new CacheConnector()) {
        if (typeof new.target === 'undefined') {
            return new PjdsClient(log, metrics, config);
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
     * Create a new instance of the PjdsClient class with a new child logger
     *
     * @param {Logger} childLog the child logger
     * @return {PjdsClient} a new instance of this class using the supplied logger
     */
    childInstance(childLog) {
        const cacheConnector = memberMap.get(this).cacheConnector;
        return new PjdsClient(childLog, this.metrics, this.config, cacheConnector);
    }

    connect() {
        return memberMap.get(this).cacheConnector.connect(this.config);
    }

    disconnect() {
        return memberMap.get(this).cacheConnector.disconnect();
    }


    /**
     * @callback pjdsClientRequestCallback
     * @param {object|null} error
     * @param {object} [response] A statusCode property emulating HTTP status codes, and a body property with the JSON response
     * @param {object} [parsedData] The parsed data received from PJDS
     */

    /**
     * Retrieves a list of EHMP active users
     *
     * Variadic Function
     *     getActiveUsers(filter, callback)
     *     getActiveUsers(callback)
     *
     * @param {object} [filter] Filter expression in the filter property E.g. {filter: 'filter=eq(uid,urn:va:datastore:1)'}
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getActiveUsers(filter, callback) {
        this.log.debug('pjds-client.getActiveUsers() filter: %s', filter);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getActiveUsers',
            'filter': filter,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        filter = args.length > 0 ? args.pop() : '';

        if (typeof filter === 'object' && _.isString(_.get(filter, 'filter'))) {
            filter = filter.filter;
        } else if (typeof filter === 'object') {
            filter = '';
        }

        filter = _.startsWith(filter, '?') ? filter.slice(1, filter.length) : filter;
        filter = _.startsWith(filter, 'filter=') ? filter.slice(7, filter.length) : filter;

        // Set up optional arguments
        const options = {
            filter: filter
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get OSync Active Users', metricsObj);

        return this.getPjdsStoreData('activeusr', null, options, callback);
    }

    /**
     * Add an active user to the list of EHMP active users
     *
     * @param {object} activeUser
     * @param {string} activeUser.uid The identifier of the user to add to the EHMP active user list
     * @param {string} [activeUser.site]
     * @param {string} [activeUser.id]
     * @param {string} [activeUser.lastSuccessfulLogin]
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    addActiveUser(activeUser, callback) {
        this.log.debug('pjds-client.addActiveUser() activeUser: %j', activeUser);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'addActiveUser',
            'activeUser': activeUser,
            'process': uuid.v4(),
            'timer': 'start'
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Add OSync Active User by UID', metricsObj);

        return this.setPjdsStoreData('activeusr', activeUser.uid, activeUser, callback);
    }

    /**
     * Remove (delete) a user from the EHMP active user list
     *
     * @param {string} uid The identifier of the user to delete from the EHMP active user list
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    removeActiveUser(uid, callback) {
        this.log.debug('pjds-client.removeActiveUser() uid: %s', uid);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'removeActiveUser',
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Remove OSync Active User by UID', metricsObj);

        return this.deletePjdsStoreData('activeusr', uid, callback);
    }

    /**
     * Retrieves a list of osync clinics for a given site
     *
     * @param {string} site The site to return a list of clinics for
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getOSyncClinicsBySite(site, callback) {
        this.log.debug('pjds-client.getOSyncClinicsBySite() site: %s', site);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getOSyncClinicsBySite',
            'site': site,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Set up optional arguments
        const options = {
            range: site
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get OSync Clinics by Site', metricsObj);

        return this.getPjdsStoreIndexData('osynclinic', 'osynclinic-site', options, callback);
    }

    /**
     * Retrieves a single osync clinic
     *
     * @param {string} uid The identifier of an osync clinic to retrieve the details for
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getOSyncClinicsByUid(uid, callback) {
        this.log.debug('pjds-client.getOSyncClinicsByUid() uid: %s', uid);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getOSyncClinicsByUid',
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get OSync Clinics by UID', metricsObj);

        return this.getPjdsStoreData('osynclinic', uid, callback);
    }

    /**
     * Retrieves all osync clinics
     *
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getAllOSyncClinics(callback) {
        this.log.debug('pjds-client.getAllOSyncClinics()');

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getAllOSyncClinics',
            'process': uuid.v4(),
            'timer': 'start'
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get All OSync Clinics', metricsObj);

        return this.getPjdsStoreData('osynclinic', null, callback);
    }

    /**
     * Add (create) an osync clinic
     *
     * @param {string} site The site of the osync clinic to add
     * @param {string} uid The identifier of the osync clinic to add
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    createOSyncClinic(site, uid, callback) {
        this.log.debug('pjds-client.createOSyncClinic() site: %s uid: %s', site, uid);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'createOSyncClinic',
            'site': site,
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if ((_.isEmpty(uid)) || (_.isEmpty(site))) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Post Create OSync Clinic in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No uid or site passed in'));
        }

        const data = {
            site: site,
            uid: uid
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Post Create OSync Clinic', metricsObj);

        return this.setPjdsStoreData('osynclinic', uid, data, callback);
    }

    /**
     * Remove (delete) an osync clinic
     *
     * @param {string} uid The identifier of the osync clinic to delete
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    deleteOSyncClinic(uid, callback) {
        this.log.debug('pjds-client.deleteOSyncClinic() uid: %s', uid);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'deleteOSyncClinic',
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(uid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Delete OSync Clinic in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No uid passed in'));
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Delete OSync Clinic', metricsObj);

        return this.deletePjdsStoreData('osynclinic', uid, callback);
    }

    /**
     * Add a user or patient to the osync blist
     *
     * @param {string} id The identifier of the user or patient to add to the osync blist
     * @param {string} site The site hash of the user or patient to add to the osync blist
     * @param {string} list The name of the osync blist to add to
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    addToOsyncBlist(id, site, list, callback) {
        this.log.debug('pjds-client.addToOsyncBlist() id: %s site: %s list: %s', id, site, list);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'addToOsyncBlist',
            'id': id,
            'site': site,
            'list': list,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(id) && (list === 'user')) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Add User or Patient to OSync Clinic in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No id passed in'));
        }

        const uid = clientUtils.generateBlistUid(id, site, list);

        if (uid.substring(0, 3) !== 'urn') {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Add User or Patient to OSync Clinic in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal(uid));
        }

        const data = {
            id: id,
            uid: uid,
            site: site
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Add User or Patient to OSync Clinic', metricsObj);

        return this.setPjdsStoreData('osyncBlist', uid, data, callback);
    }

    /**
     * Remove (delete) a user or patient from the osync blist
     *
     * @param {string} id The identifier of the user or patient to delete from the osync blist
     * @param {string} site The site hash of the user or patient to delete from the osync blist
     * @param {string} list The name of the osync blist to delete from
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    removeFromOsyncBlist(id, site, list, callback) {
        this.log.debug('pjds-client.removeFromOsyncBlist() id: %s site: %s list: %s', id, site, list);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'removeFromOsyncBlist',
            'id': id,
            'site': site,
            'list': list,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(id) && (list === 'user')) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Delete User or Patient to OSync Clinic in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No id passed in'));
        }

        const uid = clientUtils.generateBlistUid(id, site, list);

        if (uid.substring(0,3) !== 'urn') {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Delete User or Patient to OSync Clinic in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal(uid));
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Delete User or Patient from OSync Clinic', metricsObj);

        return this.deletePjdsStoreData('osyncBlist', uid, callback);
    }

    /**
     * Retrieve the user or patient osync blist
     *
     * @param {string} list The name of the osync blist to retrieve (either patient or user)
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getOsyncBlist(list, callback) {
        this.log.debug('pjds-client.getOsyncBlist() list: %s', list);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getOsyncBlist',
            'list': list,
            'process': uuid.v4(),
            'timer': 'start'
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get User or Patient OSync Blist', metricsObj);

        return this.getPjdsStoreIndexData('osyncBlist', 'osyncblist-' + list, callback);
    }


    /**
     * Retrieve the user or patient from osync blist
     *
     * @param {string} uid The identifier to retrieve from the Blist
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getOsyncBlistByUid(uid, callback) {
        this.log.debug('pjds-client.getOsyncBlistByUid() uid: %s', uid);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getOsyncBlistByUid',
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get User or Patient OSync Blist', metricsObj);

        return this.getPjdsStoreData('osyncBlist', uid, callback);
    }

    /**
     * Add (create) a clinical object
     *
     * @param {object} document The clinical object document to be stored
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    createClinicalObject(document, callback) {
        this.log.debug('pjds-client.createClinicalObject() document: %j', document);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'createClinicalObject',
            'document': document,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(document)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Post Create Clinical Object in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No document passed in'));
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Post Create Clinical Object', metricsObj);

        return this.setPjdsStoreData('clinicobj', null, document, callback);
    }

    /**
     * Update a clinical object
     *
     * @param {string} uid The identifier of the clinical object to be stored
     * @param {object} document The clinical object document to be stored
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    updateClinicalObject(uid, document, callback) {
        this.log.debug('pjds-client.updateClinicalObject() uid: %s document: %j', uid, document);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'updateClinicalObject',
            'uid': uid,
            'document': document,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if ((_.isEmpty(document)) || (_.isEmpty(uid))) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Post Update Clinical Object in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No document or uid passed in'));
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Post Update Clinical Object', metricsObj);

        return this.setPjdsStoreData('clinicobj', uid, document, callback);
    }

    /**
     * Delete a clinical object
     *
     * @param {string} uid The identifier of the clinical object to be deleted
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    deleteClinicalObject(uid, callback) {
        this.log.debug('pjds-client.deleteClinicalObject() uid: %s', uid);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'deleteClinicalObject',
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(uid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Delete Clinical Object in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No uid passed in'));
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Delete Clinical Object', metricsObj);

        return this.deletePjdsStoreData('clinicobj', uid, callback);
    }

    /**
     * Retrieves clinic objects for a patient by a filter
     *
     * Variadic Function
     *     getClinicalObject(filter, index, callback)
     *     getClinicalObject(filter, callback)
     *
     * @param {string} filter The required filter to use that narrows down search
     * @param {string} [index] An optional index to use on query to improve search performance
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getClinicalObject(filter, index, callback) {
        this.log.debug('pjds-client.getClinicalObject() filter: %s index: %s', filter, index);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getClinicalObject',
            'filter' : filter,
            'index' : index,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        if (!(_.last(args) instanceof Function)) {
            throw new Error('No callback function was passed to getClinicalObject()');
        }

        callback = args.pop();

        if (_.isEmpty(filter)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Get Clinical Objects in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No filter passed in'));
        }

        filter = _.startsWith(filter, '?') ? filter.slice(1, filter.length) : filter;
        filter = _.startsWith(filter, 'filter=') ? filter.slice(7, filter.length) : filter;
        filter = _.startsWith(filter, 'range=') ? filter.slice(6, filter.length) : filter;

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get Clinical Objects', metricsObj);

        const options = {};

        if (args.length === 2 && index) {
            // Set up optional arguments for index
            options.range = filter;

            return this.getPjdsStoreIndexData('clinicobj', index, options, callback);
        }

        // Set up optional arguments for find
        options.filter = filter;

        return this.getPjdsStoreData('clinicobj', null, options, callback);
    }

    /**
     * Retrieves prefetch patients by filter, and/or by an index and/or with a template
     *
     * Variadic Function
     *     getPrefetchPatients(filter, index, template, callback)
     *     getPrefetchPatients(filter, index, callback)
     *     getPrefetchPatients(filter, callback)
     *
     * @param {string} filter A required filter used to narrows down search
     * @param {string} [index] An optional index to use on query to improve search performance
     * @param {string} [template] An optional template used to limit the fields returned by the query
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getPrefetchPatients(filter, index, template, callback) {
        this.log.debug('pjds-client.getPrefetchPatients() filter: %s index: %s template: %s', filter, index, template);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getPrefetchPatients',
            'filter': filter,
            'index': index,
            'template': template,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        if (!(_.last(args) instanceof Function)) {
            throw new Error('No callback function was passed to getPrefetchPatients()');
        }

        callback = args.pop();

        if (_.isEmpty(filter)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Get Prefetch Patients Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No filter passed in'));
        }

        filter = _.startsWith(filter, '?') ? filter.slice(1, filter.length) : filter;
        filter = _.startsWith(filter, 'filter=') ? filter.slice(7, filter.length) : filter;
        filter = _.startsWith(filter, 'range=') ? filter.slice(6, filter.length) : filter;

        const options = {};

        if (args.length === 3 && template) {
            options.template = template;
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Get Prefetch Patients', metricsObj);

        if (args.length >= 2 && index) {
            // Set up optional arguments for index
            options.range = filter;

            return this.getPjdsStoreIndexData('prefetch', index, options, callback);
        }

        // Set up optional arguments for find
        options.filter = filter;

        return this.getPjdsStoreData('prefetch', null, options, callback);
    }

    /**
     * Update a prefetch patient
     *
     * @param {string} uid The identifier of the prefetch patient to be stored
     * @param {object} document The prefetch patient document to be stored
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    updatePrefetchPatient(uid, document, callback) {
        this.log.debug('pjds-client.updatePrefetchPatient() uid: %s document: %j', uid, document);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'updatePrefetchPatient',
            'uid': uid,
            'document': document,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if ((_.isEmpty(document)) || (_.isEmpty(uid))) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Update Prefetch Patient in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No document or uid passed in'));
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Update Prefetch Patient', metricsObj);

        return this.setPjdsStoreData('prefetch', uid, document, true, callback);
    }

    /**
     * Delete a Prefetch Patient
     *
     * @param {string} uid The prefetch patient identifier to be stored
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    removePrefetchPatient(uid, callback) {
        this.log.debug('pjds-client.removePrefetchPatient() uid: %s', uid);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'removePrefetchPatient',
            'uid': uid,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(uid)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS Remove Prefetch Patient in Error', metricsObj);

            return setTimeout(callback, 0, errorUtil.createFatal('No uid passed in'));
        }

        metricsObj.timer = 'stop';
        this.metrics.debug('PJDS Remove Prefetch Patient', metricsObj);

        return this.deletePjdsStoreData('prefetch', uid, callback);
    }

    // Generic Data Store methods

    /**
     * Create persistent data store
     *
     * @param {string} store The store name to create
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    createPjdsStore(store, callback) {
        this.log.debug('pjds-client.createPjdsStore() store: %s', store);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'createPjdsStore',
            'store': store,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS create store in Error', metricsObj);
            this.log.error('pjds-client.createPjdsStore: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        this.metrics.debug('PJDS create store', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'CREATEDB^VPRJGDSN',
            arguments: [store]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.createPjdsStore complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }


    /**
     * Remove persistent data store
     *
     * @param {string} store The store name to clear and remove
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    clearPjdsStore(store, callback) {
        this.log.debug('pjds-client.clearPjdsStore() store: %s', store);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'clearPjdsStore',
            'store': store,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS clear store in Error', metricsObj);
            this.log.error('pjds-client.clearPjdsStore: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        this.metrics.debug('PJDS clear store', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'CLR^VPRJGDSN',
            arguments: [store]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.clearPjdsStore complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }


    /**
     * Get info about a persistent data store
     *
     * @param {string} store The store name to retrieve information about
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getPjdsStoreInfo(store, callback) {
        this.log.debug('pjds-client.getPjdsStoreInfo() store: %s', store);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getPjdsStoreInfo',
            'store': store,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS get store info in Error', metricsObj);
            this.log.error('pjds-client.getPjdsStoreInfo: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        this.metrics.debug('PJDS get store info', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'INFO^VPRJGDSN',
            arguments: [store]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPjdsStoreInfo complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }


    /**
     * Get persistent data store item
     *
     * Variadic Function
     *     getPjdsStoreData(store, uid, params, callback)
     *     getPjdsStoreData(store, uid, callback)
     *
     * @param {string} store The store name to retrieve data from
     * @param {string} uid The identifier of the data item to retrieve, or null or undefined to retrieve all data items
     * @param {object} [params]
     * @param {string} [params.template] Template to use to format the returned data
     * @param {string} [params.order] Order of the data items returned [asc|desc] [ci|cs]
     * @param {boolean} [params.skipLocked] Whether to skip locked data store items
     * @param {string} [params.filter] Filter expression E.g. eq(uid,urn:va:datastore:1)
     * @param {number} [params.start] The offset (by count of items) to begin at for returning items
     * @param {number} [params.limit] Limit of items (by count) to add to returning items
     * @param {string} [params.startId] The first item (by item number or uid) to add to returning items
     * @param {boolean} [params.returnCounts] Whether to return a header with the totalItems and currentItemCount
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getPjdsStoreData(store, uid, params, callback) {
        this.log.debug('pjds-client.getPjdsStoreData() store: %s uid: %s params: %j', store, uid, params);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getPjdsStoreData',
            'store': store,
            'uid': uid,
            'params': params,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        params = args.length > 2 ? args.pop() : {};

        // Destructure params in to variables that can be passed to Cache, using defaults if properties are missing from params
        const {
            template = '',
            order = '',
            skipLocked = false,
            filter = '',
            start = 0,
            limit = 999999,
            startId = '',
            returnCounts = false
        } = params;

        // If uid is not passed in, need to make it the empty string to retrieve all items
        uid = uid || '';

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS get store data in Error', metricsObj);
            this.log.error('pjds-client.getPjdsStoreData: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        this.metrics.debug('PJDS get store data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'GET^VPRJGDSN',
            arguments: [store, uid, template, order, skipLocked, filter, start, limit, startId, returnCounts]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPjdsStoreData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }


    /**
     * Add item to persistent data store
     *
     * Variadic Function
     *     setPjdsStoreData(store, uid, data, patch, callback)
     *     setPjdsStoreData(store, uid, data, callback)
     *
     * @param {string} store The store name to add data to
     * @param {string|null} uid The identifier of the data item to add, or null or undefined to allow PJDS to create a uid for it
     * @param {object} data The data to be stored in the PJDS store
     * @param {boolean} [patch] Whether to patch the data or not
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    setPjdsStoreData(store, uid, data, patch, callback) {
        this.log.debug('pjds-client.setPjdsStoreData() store: %s uid: %s data: %j patch: %s', store, uid, data, patch);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'setPjdsStoreData',
            'store': store,
            'uid': uid,
            'data': data,
            'patch': patch,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        patch = args.length > 3 ? args.pop() : false;

        // If uid is not passed in, a uid will be assigned by PJDS
        uid = uid || '';

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS set store data in Error', metricsObj);
            this.log.error('pjds-client.setPjdsStoreData: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        if (_.isEmpty(data)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS set store data in Error', metricsObj);
            this.log.error('pjds-client.setPjdsStoreData: No data passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No data passed in'));
        }

        if (!_.isObject(data)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS set store data in Error', metricsObj);
            this.log.error('pjds-client.setPjdsStoreData: Data passed in not in correct format');

            return setTimeout(callback, 0, errorUtil.createFatal('Data passed in not in correct format'));
        }

        this.metrics.debug('PJDS set store data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        clientUtils.setStoreData(cacheConnector, data, (setError, setResult) => {
            if (setError) {
                metricsObj.timer = 'stop';
                this.metrics.debug('PJDS set store data in Error', metricsObj);

                return callback(errorUtil.createTransient(setResult.ErrorMessage || 'Unknown Error'));
            }

            cacheConnector.function({
                function: 'SET^VPRJGDSN',
                arguments: [store, uid, patch, setResult.nodeUuid]
            }, (funcError, funcResult) => {
                metricsObj.timer = 'stop';
                this.metrics.debug('jds-client.setPjdsStoreData complete', metricsObj);

                return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
            });
        });
    }


    /**
     * Remove persistent data store item, or delete all items, while leaving empty store
     *
     * Variadic Function
     *     deletePjdsStoreData(store, uid, deleteAll, filter, callback)
     *     deletePjdsStoreData(store, uid, deleteAll, callback)
     *     deletePjdsStoreData(store, uid, callback)
     *
     * @param {string} store The store name to delete data from
     * @param {string|null} uid The identifier of the data item to remove, or null or undefined to remove all data items
     * @param {boolean} deleteAll Whether to delete every item from the store (requires uid to be undefined or null)
     * @param {string} [filter] Filter expression E.g. eq(uid,urn:va:datastore:1)
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    deletePjdsStoreData(store, uid, deleteAll, filter, callback) {
        this.log.debug('pjds-client.deletePjdsStoreData() store: %s uid: %s deleteAll: %s filter: %s', store, uid, deleteAll, filter);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'deletePjdsStoreData',
            'store': store,
            'uid': uid,
            'deleteAll': deleteAll,
            'filter': filter,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        filter = args.length > 3 ? args.pop() : '';
        deleteAll = args.length > 2 ? args.pop() : false;

        // If uid is not passed in, need to make it the empty string as the combination of empty string
        // and deleteAll set to true is necessary to remove all data items from the store
        uid = uid || '';

        // Ensure that deleteAll is either true or false
        if (args.length >= 3) {
            deleteAll = _.isBoolean(deleteAll) ? deleteAll : false;
        }

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS delete store item in Error', metricsObj);
            this.log.error('pjds-client.deletePjdsStoreData: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        this.metrics.debug('PJDS delete store item', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'DEL^VPRJGDSN',
            arguments: [store, uid, deleteAll, filter]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.deletePjdsStoreData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }


    /**
     * Create persistent data store index
     *
     * @param {string} store The store name to create an index on
     * @param {object} indexData The data containing the index definition
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    createPjdsStoreIndex(store, indexData, callback) {
        this.log.debug('pjds-client.createPjdsStoreIndex() store: %s indexData: %j', store, indexData);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'createPjdsStoreIndex',
            'store': store,
            'indexData': indexData,
            'process': uuid.v4(),
            'timer': 'start'
        };

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS create store index in Error', metricsObj);
            this.log.error('pjds-client.createPjdsStoreIndex: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        if (_.isEmpty(indexData)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS create store index in Error', metricsObj);
            this.log.error('pjds-client.createPjdsStoreIndex: No index data passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No index data passed in'));
        }

        if (!_.isObject(indexData)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS create store index in Error', metricsObj);
            this.log.error('pjds-client.createPjdsStoreIndex: Data passed in not in correct format');

            return setTimeout(callback, 0, errorUtil.createFatal('Data passed in not in correct format'));
        }

        this.metrics.debug('PJDS create store index', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        clientUtils.setStoreData(cacheConnector, indexData, (setError, setResult) => {
            if (setError) {
                metricsObj.timer = 'stop';
                this.metrics.debug('PJDS create store index in Error', metricsObj);

                return callback(errorUtil.createTransient(setResult.ErrorMessage || 'Unknown Error'));
            }

            cacheConnector.function({
                function: 'CINDEX^VPRJGDSN',
                arguments: [store, setResult.nodeUuid]
            }, (funcError, funcResult) => {
                metricsObj.timer = 'stop';
                this.metrics.debug('jds-client.createPjdsStoreIndex complete', metricsObj);

                return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
            });
        });
    }


    /**
     * Get persistent data from index
     *
     * Variadic Function
     *     getPjdsStoreIndexData(store, index, params, callback)
     *     getPjdsStoreIndexData(store, index, callback)
     *
     * @param {string} store The store name to retrieve index data from
     * @param {string} index The name of the index to retrieve data from
     * @param {object} [params]
     * @param {string} [params.template] Template to use to format the returned data
     * @param {string} [params.order] Order of the data items returned [asc|desc] [ci|cs]
     * @param {string} [params.range] A range of keys to limit the returning items
     * @param {string} [params.bail] Similar to limit, but faster, and is unable to calculate totalItems in returnCounts
     * @param {boolean} [params.skipLocked] Whether to skip locked data store items
     * @param {string} [params.filter] Filter expression E.g. eq(uid,urn:va:datastore:1)
     * @param {number} [params.start] The offset (by count of items) to begin at for returning items
     * @param {number} [params.limit] Limit of items (by count) to add to returning items
     * @param {string} [params.startId] The first item (by item number or uid) to add to returning items
     * @param {boolean} [params.returnCounts] Whether to return a header with the totalItems and currentItemCount
     * @param {pjdsClientRequestCallback} callback
     * @return {*}
     */
    getPjdsStoreIndexData(store, index, params, callback) {
        this.log.debug('pjds-client.getPjdsStoreIndexData() store: %s index: %s params: %j', store, index, params);

        const metricsObj = {
            'subsystem': 'PJDS',
            'action': 'getPjdsStoreIndexData',
            'store': store,
            'index': index,
            'params': params,
            'process': uuid.v4(),
            'timer': 'start'
        };

        // Handle variadic argument passing
        const args = _.toArray(arguments);
        callback = args.pop();
        params = args.length > 2 ? args.pop() : {};

        // Destructure params in to variables that can be passed to Cache, using defaults if properties are missing from params
        const {
            template = '',
            order = '',
            range = '',
            bail = '',
            skipLocked = false,
            filter = '',
            start = 0,
            limit = 999999,
            startId = '',
            returnCounts = false
        } = params;

        if (_.isEmpty(store)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS get store index data in Error', metricsObj);
            this.log.error('pjds-client.getPjdsStoreIndexData: No store name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No store name passed in'));
        }

        if (_.isEmpty(index)) {
            metricsObj.timer = 'stop';
            this.metrics.debug('PJDS get store index data in Error', metricsObj);
            this.log.error('pjds-client.getPjdsStoreIndexData: No index name passed in');

            return setTimeout(callback, 0, errorUtil.createFatal('No index name passed in'));
        }

        this.metrics.debug('PJDS get store index data', metricsObj);

        const cacheConnector = memberMap.get(this).cacheConnector;

        cacheConnector.function({
            function: 'INDEX^VPRJGDSN',
            arguments: [store, index, template, order, range, bail, skipLocked, filter, start, limit, startId, returnCounts]
        }, (funcError, funcResult) => {
            metricsObj.timer = 'stop';
            this.metrics.debug('jds-client.getPjdsStoreIndexData complete', metricsObj);

            return clientUtils.retrieveQueryResult(cacheConnector, funcError, funcResult, callback);
        });
    }
}


module.exports = PjdsClient;
