'use strict';

function store(log, config, environment, dataDomain, record, callback) {
    log.debug('ehmp-activity-data-rule.store: Entered function.   record: %j', record);

    callback(null, record.ehmpState === 'active' && record.domain === 'ehmp-activity' && (record.subDomain === 'consult' || record.subDomain === 'request'));
}

module.exports = store;
