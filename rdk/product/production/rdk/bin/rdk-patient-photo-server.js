#!/usr/bin/env node

'use strict';

var path = require('path');
var rdk = require('../src/core/rdk');

var ROOT = path.resolve(__dirname, '..');

var patientPhotoApp = rdk.appfactory().defaultConfigFilename(ROOT + '/config/patient-photo-config.js').argv(process.argv).build();
var patientPhotoPort = patientPhotoApp.config.patientPhotoServer.port;

patientPhotoApp.register('/patientphoto', ROOT + '/src/resources/patient-photo/patient-photo-resource');

patientPhotoApp.rdkListen(patientPhotoPort, function(){
    patientPhotoApp.logger.info('Patient photo now listening on %s', patientPhotoPort);
});
