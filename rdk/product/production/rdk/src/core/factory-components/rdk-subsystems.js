'use strict';

var _ = require('lodash');
var rdk = require('../rdk');

module.exports.registerAppSubsystems = registerAppSubsystems;
module.exports.registerSubsystem = registerSubsystem;

function registerAppSubsystems(app) {
    app.subsystems = {};
    app.subsystems.register = registerSubsystem.bind(null, app);

    app.subsystems.register('jds', require('../../subsystems/jds/jds-subsystem'));
    app.subsystems.register('jdsSync', require('../../subsystems/jds/jds-sync-subsystem'));
    app.subsystems.register('solr', require('../../subsystems/solr-subsystem'));
    app.subsystems.register('patientrecord', require('../../subsystems/patient-record-subsystem'));
    app.subsystems.register('mvi', require('../../subsystems/mvi-subsystem'));
    app.subsystems.register('vxSync', require('../../subsystems/vx-sync-subsystem'));
    app.subsystems.register('asu', require('../../subsystems/asu/asu-subsystem'));
    app.subsystems.register('authorization', require('../../subsystems/pep/pep-subsystem'));
    app.subsystems.register('pjds', require('../../subsystems/pjds/pjds-subsystem'));
    app.subsystems.register('quickorder', require('../../subsystems/orderables/quickorder-subsystem'));
    app.subsystems.register('orderset', require('../../subsystems/orderables/orderset-subsystem'));
    app.subsystems.register('favoriteOrderable', require('../../subsystems/orderables/favorite-orderable-subsystem'));
    app.subsystems.register('enterpriseOrderable', require('../../subsystems/orderables/enterprise-orderable-subsystem'));
    app.subsystems.register('vistaReadOnly', require('../../subsystems/vista-read-only-subsystem'));
    if (_.get(app, 'config.vix')) {
        app.subsystems.register('vix', require('../../subsystems/vix/vix-subsystem'));
    }
    if (_.get(app, 'config.jbpm')) {
        app.subsystems.register('jbpm', require('../../subsystems/jbpm/jbpm-subsystem'));
        app.subsystems.register('pcmm', require('../../subsystems/jbpm/pcmm-subsystem'));
    }
    if (_.get(app, 'config.cdsInvocationServer') || _.get(app, 'config.cdsMongoServer')) {
        app.subsystems.register('cds', require('../../subsystems/cds/cds-subsystem'));
    }
}

function registerSubsystem(app, subsystemName, subsystem) {
    app.subsystems[subsystemName] = subsystem;
    var subsystemLogger = app.logger.child({subsystem: subsystemName});
    rdk.health.registerSubsystem(
        subsystem.getSubsystemConfig(app, subsystemLogger),
        subsystemName,
        subsystemLogger);
}
