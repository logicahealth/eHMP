'use strict';

module.exports.health = require('../resources/healthcheck-resource');
module.exports.apiBlueprint = require('./api-blueprint/api-blueprint');

module.exports.logging = require('./logger/logging-service');

module.exports.utils = {};
module.exports.utils.nullchecker = require('../utils/nullchecker');
module.exports.utils.uriBuilder = require('../utils/uri-builder');
module.exports.utils.commandlineparser = require('yargs').alias('c', 'config');
module.exports.utils.underscoreString = require('underscore.string');
module.exports.utils.http = require('../utils/http');
module.exports.utils.rpc = require('../utils/rpc-config');
module.exports.utils.namecase = require('../utils/namecase-utils');
module.exports.utils.RdkTimer = require('../utils/timer/timer');
module.exports.utils.RdkError = require('../utils/errors/rdk-error');
module.exports.utils.pjdsStore = require('../subsystems/pjds/pjds-store'); //TODO put into pjds subsystem and remove from util
module.exports.utils.pjdsUtil = require('../utils/pjds-utility');
module.exports.utils.results = require('../utils/result-utils');
module.exports.utils.sensitivity = require('../utils/sensitivity-utils');
module.exports.utils.pidValidator = require('../utils/pid-validator');
module.exports.utils.pooledJbpmDatabase = require('../utils/oracle-connection-pool');
module.exports.utils.locationUtil = require('../utils/location-util');
module.exports.utils.authentication = require('../utils/authentication-utils');
module.exports.utils.vistaConfig = require('../utils/rdk-vista-config-utility');
module.exports.utils.uidUtils = require('../utils/uid-utils');

module.exports.utils.jwt = {};
module.exports.utils.jwt.addJwtHeader = require('./factory-components/rdk-jwt').addJwtHeader;

module.exports.node = {};
module.exports.node.util = require('util');

module.exports.httpstatus = require('./httpstatus');
module.exports.patientCache = require('memory-cache');

module.exports.rolesConfig = require('../../config/rolesConfig');
module.exports.patienttimelineResourceConfig = require('../../config/patienttimelineResourceConfig');
module.exports.siteTimzonesConfig = require('../../config/siteTimezonesConfig');

// keep app-factory as last item in this list
// moving above causes some issues with loading of app-factory
// because it references RDK
module.exports.appfactory = require('./app-factory');
