'use strict';
var _ = require('lodash');

var errorConstants = {};
errorConstants.serviceMappings = require('./service-mappings');
errorConstants.cds = require('./constants/cds-error-constants.json');
errorConstants.dod = require('./constants/dod-error-constants.json');
errorConstants.jds = require('./constants/jds-error-constants.json');
errorConstants.jbpm = require('./constants/jbpm-error-constants.json');
errorConstants.jmeadows = require('./constants/jmeadows-error-constants.json');
errorConstants.mvi = require('./constants/mvi-error-constants.json');
errorConstants.pjds = require('./constants/rdk-error-constants.json');
errorConstants.rdk = require('./constants/rdk-error-constants.json');
errorConstants.solr = require('./constants/solr-error-constants.json');
errorConstants.vista = require('./constants/vista-error-constants.json');
errorConstants.vxsync = require('./constants/vxsync-error-constants.json');

_.each(errorConstants, function mapItemToCode(value, key, object) {
    var newKey = _.parseInt(errorConstants.serviceMappings[key]);
    object[newKey] = value;
});

module.exports = errorConstants;
