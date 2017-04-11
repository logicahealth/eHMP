'use strict';

var fs = require('fs');
var argv = require('yargs').argv;
var httpSpy = require('./http-spy');
var vistajsSpy = require('./vistajs-spy');
var repository = require('./recorded-response-repository');
var recordSchemas = require('./record-schemas-outerceptor');

// Turn on spying if the --spy-for-versioning command-line argument is present.

module.exports = function(app) {
    if (argv['spy-for-versioning']) {
        createRecordToDirectory();
        httpSpy.startSpying();
        vistajsSpy.startSpying();
        recordSchemas.startRecording(app);
// TODO: start spying on mongodb
        return false;
    }
};

function createRecordToDirectory() {
    fs.mkdir(repository.recordToDirectory, function(error) {
        if (error && error.code !== 'EEXIST') {
            console.log('spy-for-versioning.js: unable to create the directory for spying: ' + error);
        }
    });
}
