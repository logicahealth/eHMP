'use strict';

const _ = require('lodash');
const inspect = require(global.VX_UTILS + 'inspect');

function rapidFire(log, config, environment, patientIdentifiers, exceptions, callback) {
    log.debug('rapid-fire-rule.rapidFire(): Running rapid-fire-rule on ' + inspect(patientIdentifiers));
    log.debug('rapid-fire-rule.rapidFire(): Getting simple sync status for %s', patientIdentifiers[0].value);
    environment.jds.getSimpleSyncStatus(patientIdentifiers[0], function(error, response, result){
        if (error) {
            return callback('rapid-fire-rule.rapidFire(): JDS.getSimpleSyncStatus returned error: ' + inspect(error), []);
        }

        if (!_.get(result, 'latestSourceStampTime')){
            //First sync attempt for this patient. Let all patientIdentifiers through.
            return callback(null, patientIdentifiers);
        }

        let siteStatusCollection = _.get(result, 'sites');

        log.debug('rapid-fire-rule.rapidFire(): Got site statuses: %s. Now finding jobs in progress...', inspect(siteStatusCollection));
        let sitesStatusIncomplete = _.filter(siteStatusCollection, function(siteStatus){
            return !_.get(siteStatus, 'hasError') && !_.get(siteStatus, 'syncCompleted');
        });

        log.debug('rapid-fire-rule.rapidFire(): Found incomplete sites: %s. Extracting PIDs...', inspect(sitesStatusIncomplete));
        let incompletePids = _.pluck(sitesStatusIncomplete, 'pid');

        log.debug('rapid-fire-rule.rapidFire(): Found PIDs for incomplete sites, removing them from rule result: %s', inspect(incompletePids));
        patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
            return !_.contains(incompletePids, patientIdentifier.value);
        });

        log.debug('rapid-fire-rule.rapidFire(): Finished running rule. Remaining pids: %s', inspect(patientIdentifiers));
        return callback(null, patientIdentifiers);
    });
}

function loadRule() {
    return rapidFire;
}

module.exports = loadRule;