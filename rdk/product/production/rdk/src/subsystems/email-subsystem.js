'use strict';

var _ = require('lodash');
var net = require('net');
var nodemailer = require('nodemailer');
module.exports.getSubsystemConfig = getSubsystemConfig;

module.exports.__transport = null;
module.exports.__emailSubsystemEnabled = false;
module.exports._transportOk = transportOk;

function getSubsystemConfig(app, logger) {
    module.exports.__emailSubsystemEnabled = true;
    var emailTransport = _.get(app, 'config.emailTransport');
    // {
    //     host: 'localhost',
    //     port: 25,
    //     // port: 465,
    //     // secure: true
    // }
    if (!_.isObject(emailTransport)) {
        logger.info('config.emailTransport is not an object; email subsystem disabled');
        module.exports.__emailSubsystemEnabled = false;
    } else {
        logger.debug('creating email subsystem transport');
        module.exports.__transport = nodemailer.createTransport(emailTransport);
        module.exports.__emailSubsystemEnabled = true;
    }

    return {
        healthcheck: {
            name: 'email',
            interval: 60000,
            check: function(callback) {
                if (!module.exports.__emailSubsystemEnabled) {
                    return callback(false);
                }
                if (!transportOk()) {
                    return callback(false);
                }
                var client = new net.Socket();
                var ok = false;
                var returned = false;
                client.on('data', function(data) {
                    var xclientOkRegex = /^220/;
                    if (xclientOkRegex.test(data)) {
                        ok = true;
                        client.write('QUIT\n');
                    }
                    return done();
                });
                client.on('error', done);
                client.on('close', done);
                client.on('timeout', done);
                client.connect(emailTransport.port, emailTransport.host);
                function done() {
                    client.destroy();
                    if (!returned) {
                        returned = true;
                        return callback(ok);
                    }
                }

            }
        }
    };
}

function transportOk() {
    return /nodemailer/i.test(_.result(module.exports.__transport, '_getVersionString'));
}

module.exports.sendMail = function sendMail() {
    if (!module.exports.__emailSubsystemEnabled) {
        return _.last(arguments)(new Error('email subsystem is not enabled'));
    }

    if (!transportOk()) {
        return _.last(arguments)(new Error('email subsystem transport error'));
    }
    return module.exports.__transport.sendMail.apply(module.exports.__transport, arguments);
};
