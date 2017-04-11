'use strict';
var nconf = require('nconf');
require('./env-setup');
var _ = require('underscore');
var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
var workerConfigUtil = require(global.VX_UTILS + 'worker-config-utils');

nconf
	.argv()
	.env()
	.file('conf', './worker-config.json');

var config = nconf.get('vxsync');


// Create an index to VistA Sites via station number.
//----------------------------------------------------
config = workerConfigUtil.createVistaSitesByStationCombined(config);

var cachedConfig = JSON.stringify(config);
var configChangeCallback = null;

// I don't like doing things this way, fix this later:


if (process.env.VXSYNC_IP) {
	console.log('Using environment variable for VX-SYNC: %s', process.env.VXSYNC_IP);
	var vxsync = nconf.get('VXSYNC_IP');
	vxsync = process.env.VXSYNC_IP;
}
var reloadTimer;
if(config.configRefresh && config.configRefresh > 0) {
    reloadTimer = setInterval(reloadConfig, config.configRefresh);
}

function reloadConfig() {
    try {
        if(config.configOverride){
            console.log('Config overridden. Cancelling refresh.');
            clearInterval(reloadTimer);
            return;
        }

        var newconfig;
        nconf.remove('conf');
        nconf.add('conf', {type:'file', file: './worker-config.json'});
        newconfig = nconf.get('vxsync');

        // Create an index to VistA Sites via station number.
        //----------------------------------------------------
        newconfig = workerConfigUtil.createVistaSitesByStationCombined(newconfig);

        var refreshTime = config.configRefresh;
        var configChange = false;
        // console.log('refreshing config');
        //if file refresh changed, redo the file polling
        if(newconfig.configRefresh !== config.configRefresh) {
            console.log('updating refresh timer');
            clearInterval(reloadTimer);
            reloadTimer = setInterval(reloadConfig, newconfig.configRefresh);
        }
        //update configuration with new settings
        var newConfigString = JSON.stringify(newconfig);
        if(cachedConfig !== newConfigString) {
            console.log('Config changed - updating in-memory instances of config');
            var keys = _.keys(newconfig);
            _.each(keys, function(key){
                config[key] = newconfig[key];
            });
            config.beanstalk = queueConfig.createFullBeanstalkConfig(config.beanstalk);
            cachedConfig = newConfigString;
            configChange = true;
        }
        //run any registered callbacks
        if(configChangeCallback !== null) {
            if(configChange) {
                console.log('running callbacks');
                _.each(configChangeCallback, function(callbackConfig){
                        var delay = refreshTime; //use the old refresh time to ensure cross process coordination
                        if(!callbackConfig.useDelay) {
                            delay = 0;
                        }
                        setTimeout(callbackConfig.function, delay);
                    }
                );
            }
        }
    } catch (e) {}
}

function addChangeCallback(requesterName, callback , useDelay) {
    if(configChangeCallback === null) {
        configChangeCallback = [];
    }
    console.log('Registering config change callback: requesterName: %s', requesterName);
    configChangeCallback.push({requesterName: requesterName, function: callback, delay: (useDelay || true)});
}


// if(process.env.PANORAMA_IP) {
// 	console.log('Using environment variable for PANORAMA: %s', process.env.PANORAMA_IP);
// 	config.vistaSites['9E7A'].host = process.env.PANORAMA_IP;
// }

// if(process.env.KODAK_IP) {
// 	console.log('Using environment variable for KODAK: %s', process.env.KODAK_IP);
// 	config.vistaSites.C877.host = process.env.KODAK_IP;
// }

// if(process.env.JDS_IP) {
// 	console.log('Using environment variable for JDS: %s', process.env.JDS_IP);
// 	config.jds.host = process.env.JDS_IP;
// }

// if(process.env.SOLR_IP) {
// 	console.log('Using environment variable for SOLR: %s', process.env.SOLR_IP);
// 	config.solrClient.host = process.env.SOLR_IP;
// }

// process.env.JMEADOWS_IP
// process.env.MVI_IP
// process.env.HDR_IP
// process.env.VLER_IP
// process.env.PGD_IP

config.beanstalk = queueConfig.createFullBeanstalkConfig(config.beanstalk);

module.exports = config;
module.exports.addChangeCallback = addChangeCallback;
