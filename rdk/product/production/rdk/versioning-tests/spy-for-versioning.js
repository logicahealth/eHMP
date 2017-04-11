'use strict';

var fs = require('fs');
var argv = require('yargs').argv;
var httpSpy = require('./http-spy');
var vistajsSpy = require('./vistajs-spy');
var repository = require('./recorded-response-repository');
var recordSchemas = require('./record-schemas-outerceptor');

var spying = 0;

module.exports = function(app) {
    if (app.config.environment === 'development') {
        createRecordToDirectory(app.logger);
        httpSpy.startSpying();
        vistajsSpy.startSpying();
        recordSchemas.startRecording(app);
// FUTURE-TODO: start spying on mongodb

        var alwaysEnabled = !!argv['spy-for-versioning'];
        enable(alwaysEnabled);

        app.use(function (req, res, next) {
            if (req.query['spy-for-versioning']) {
                spying++;
                enable(alwaysEnabled || spying > 0);
            }

            res.on('finish', onFinish);

            function onFinish(params) {
                res.removeListener('finish', onFinish);
                spying--;
                enable(alwaysEnabled || spying > 0);
            }

            next();
        });
    }
};

function createRecordToDirectory(logger) {
    fs.mkdir(repository.recordToDirectory, function(error) {
        if (error && error.code !== 'EEXIST') {
            logger.error({error: error}, 'spy-for-versioning.js: unable to create the directory for spying');
        }
    });
}

function enable(enabled) {
    httpSpy.enabled = enabled;
    vistajsSpy.enabled = enabled;
    recordSchemas.enabled = enabled;
}
