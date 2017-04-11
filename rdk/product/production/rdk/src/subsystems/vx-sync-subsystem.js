'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var http = rdk.utils.http;

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'vxSync',
            interval: 100000,
            check: function(callback){
                 //  console.log(1);
                 var vxSyncOptions = _.extend({}, app.config.vxSyncServer, {
                    url: '/ping',
                    timeout: 5000,
                    logger: logger
                });
                //console.log(2);

                http.get(vxSyncOptions, function(err) {
                 //  console.log(3);
                    if(err) {
                        // do stuff to handle error or pass it up
                        return callback(false);
                    }
                    // do stuff to handle success
                    callback(true);
                });
            }
        }
    };
}

module.exports.getSubsystemConfig = getSubsystemConfig;
