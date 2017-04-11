'use strict';

module.exports.health = require('../resources/healthcheck-resource');
module.exports.apiBlueprint = require('./api-blueprint/api-blueprint');

module.exports.logging = require('./logger/logging-service');

module.exports.utils = {};
module.exports.utils.nullchecker = require('../utils/nullchecker');
module.exports.utils.uriBuilder = require('../utils/uri-builder');
module.exports.utils.commandlineparser = require('yargs').alias('c', 'config');
module.exports.utils.configLoader = require('./config-loader');
module.exports.utils.underscoreString = require('underscore.string');
module.exports.utils.http = require('../utils/http');
module.exports.utils.rpc = require('../utils/rpc-config');
module.exports.utils.namecase = require('../utils/namecase-utils');
module.exports.utils.pjdsStore = require('../utils/pjds-store');
module.exports.utils.results = require('../utils/result-utils');
module.exports.utils.sensitivity = require('../utils/sensitivity-utils');
module.exports.utils.pidValidator = require('../utils/pid-validator');

module.exports.node = {};
module.exports.node.util = require('util');

module.exports.httpstatus = require('./httpstatus');
module.exports.patientCache = require('memory-cache');

module.exports.rolesConfig = require('../../config/rolesConfig');
module.exports.patienttimelineResourceConfig = require('../../config/patienttimelineResourceConfig');

// TODO decide how to handle subsystem utilities (this code is temporary)
module.exports.utils.jds = {};
module.exports.utils.jds.getPatientDomainData = require('../subsystems/jds/jds-subsystem').getPatientDomainData;
module.exports.utils.jds.Domains = require('../subsystems/jds/jds-domains');

// keep app-factory as last item in this list
// moving above causes some issues with loading of app-factory
// because it references RDK
module.exports.appfactory = require('./app-factory');
