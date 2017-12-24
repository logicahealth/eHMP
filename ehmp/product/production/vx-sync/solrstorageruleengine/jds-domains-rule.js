'use strict';

require('../env-setup');

var _ = require('underscore');
var domainUtil = require(global.VX_UTILS + 'domain');

function store(log, config, environment, dataDomain, record, callback) {
	if (log.level() === 'debug') {
		log.debug('jds-domains-rule.store: Entered function.   record: %j', record);
	}

	callback(null, _.contains(domainUtil.getSolrDomainList(), dataDomain));
}

module.exports = store;