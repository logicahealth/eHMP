'use strict';

var rdkTimer = require('../../utils/timer/timer');
var connectionPool = require('../../utils/oracle-connection-pool');
var async = require('async');

module.exports.logKill = logKill;

function logKill(app, server) {
    var isProcessingTerm = false;
    var isProcessingQuit = false;

    //TODO need some way to shutdown all subsystems
    //  so they stop making heartbeat http calls while shutting down

    var shutdownCds = function(shutdownCdsCb) {
        if (app.hasOwnProperty('subsystems') && app.subsystems.hasOwnProperty('cds')) {
            var cdsAgenda = app.subsystems.cds.getAgenda();
            if (cdsAgenda) {
                cdsAgenda.stop(function() {
                    safeLog('CDS Agenda successfully closed.');
                    return shutdownCdsCb(null, true);
                });
            } else {
                safeLog('No CDS Agenda to close.');
                return shutdownCdsCb(null, true);
            }
        } else {
            safeLog('No CDS Agenda to close.');
            return shutdownCdsCb(null, true);
        }
    };

    var shutdownOracle = function(shutdownOracleCb) {
        connectionPool._closePool(function(err, res) {
            if (err) {
                safeLog('Error encountered closing connection pools.');
                safeLog(err);
            } else {
                if (res) {
                    safeLog(res + ' connection pool(s) closed.');
                } else {
                    safeLog('Connection pools closed.');
                }
            }
            return shutdownOracleCb(err, res);
        }, safeLog);
    };

    var shutdownExpress = function(shutdownWebserverCb) {
        if (server !== null) {
            server.getConnections(function(countError, count) {
                safeLog('Closing ' + count + ' TCP connection(s)');
                server.close(function(closeError) {
                    // this merely stops the server from accepting new connections
                    //   see: https://nodejs.org/docs/latest-v0.10.x/api/net.html#net_server_close_callback
                    // in practice, all connections likely aren't going to be closed within 10s
                    // if connections should be forced closed, perhaps try https://github.com/isaacs/server-destroy
                    safeLog('All TCP connections closed.');
                    return shutdownWebserverCb(closeError, count);
                });
            });
        } else {
            safeLog('No Express server to close.');
            return shutdownWebserverCb(null, 0);
        }
    };

    process.on('SIGQUIT', function() {
        if (!isProcessingQuit) {
            isProcessingQuit = true;

            safeLog('Received SIGQUIT. Attempting graceful exit.');

            async.parallel([shutdownCds, shutdownOracle, shutdownExpress],
                function(err, results) {
                    safeLog('Terminating process.');
                    process.exit(131);
                });
        } else {
            safeLog('Received duplicate SIGQUIT. Ignoring. To force quit, consider SIGTERM or SIGINT.');
        }
    });

    process.on('SIGTERM', function() {
        if (!isProcessingTerm) {
            isProcessingTerm = true;

            var timer = new rdkTimer({
                'name': 'shutdown',
                'start': true,
                'roundTo': 2
            });

            safeLog('Received SIGTERM. Attempting graceful exit.');
            var timeout = 10000; // TODO: replace with config app.config variable

            async.parallel([shutdownCds, shutdownOracle, shutdownExpress],
                function(err, results) {
                    timer.stop();
                    safeLog('Terminating process after ' + timer.elapsedMilliseconds + ' ms.');
                    process.exit(143);
                });

            setTimeout(function() {
                if (server !== null) {
                    server.getConnections(function(err, count) {
                        timer.stop();
                        safeLog('Could not shutdown in time. ' + count + ' TCP connection(s) left. Waited ' + timer.elapsedMilliseconds + 'ms.');
                        process.exit(143);
                    });
                } else {
                    timer.stop();
                    safeLog('Could not shutdown in time. Waited ' + timer.elapsedMilliseconds + 'ms.');
                    process.exit(143);
                }

            }, timeout);
        } else {
            safeLog('Received duplicate SIGTERM. Ignoring.');
        }
    });

    process.on('SIGINT', function() {
        safeLog('Received SIGINT. Not attempting graceful exit');
        process.exit(130);
    });

    function consoleErrorTimestamp() {
        Array.prototype.unshift.call(arguments, (new Date()).toISOString());
        console.error.apply(console, arguments);
    }

    function safeLog(message) {
        app.logger.info(message);
        consoleErrorTimestamp(message);
    }
}
