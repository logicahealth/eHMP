'use strict';

var net = require('net');
var async = require('async');

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'zookeeper',
            interval: 100000,
            check: function(callback) {
                async.every(
                    app.config.solrClient.zooKeeperConnection.split(','),
                    function(zookeeperServer, callback) {

                        var zooKeeperParameters = zookeeperServer.split(':');
                        var zooKeeperHost = zooKeeperParameters[0];
                        var zooKeeperPort = zooKeeperParameters[1];

                        var client = new net.Socket();
                        var ok = false;
                        var returned = false;
                        client.on('data', function(data) {
                            var clientOk = /^imok$/;
                            if (clientOk.test(data)) {
                                ok = true;
                            }
                            return done();
                        });
                        client.on('error', done);
                        client.on('close', done);
                        client.on('timeout', done);
                        client.connect(zooKeeperPort, zooKeeperHost);
                        client.write('ruok\n');

                        function done() {
                            client.destroy();
                            if (!returned) {
                                returned = true;
                                callback(null, ok);
                            }
                        }
                    },
                    function(err, result) {
                        // if result is true then every server is reachable
                        if (err) {
                            return callback(false);
                        }
                        return callback(result);
                    }
                );
            }
        }
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;