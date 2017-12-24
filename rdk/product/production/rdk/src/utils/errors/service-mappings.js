'use strict';

var _ = require('lodash');

var services = {
    //100's vista related systems
    100: 'vista',
    //200's eHMP related systems
    200: 'rdk',
    201: 'jds',
    202: 'pjds',
    203: 'vxsync',
    204: 'cds',
    205: 'jbpm',
    206: 'oracledb',
    //300's dod related systems
    300: 'dod',
    301: 'jmeadows',
    302: 'solr',
    303: 'mvi',
    //400's third party systems
    400: 'vvs',
    401: 'pps'
};

_.each(services, function mapDescriptionToServicesCode(value, key, object) {
    object[value] = _.parseInt(key);
});

module.exports = services;
