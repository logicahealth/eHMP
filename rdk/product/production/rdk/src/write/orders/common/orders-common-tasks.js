'use strict';

var validTasks = {
	// commonTaskName: [writeback tasks]
	discontinueDetails: [require('./orders-common-discontinue-details-vista-writer')],
	discontinue: [require('./orders-common-discontinue-vista-writer')],
	edit: [require('./orders-common-edit-vista-writer')],
	detail: [require('./orders-common-detail-vista-writer')],
	signDetails: [require('./orders-common-sign-details-vista-writer')],
	signOrders: [require('./orders-common-sign-vista-writer')],
	saveDraftOrder: [require('./orders-common-save-draft-write')],
	findDraftOrders: [require('./orders-common-find-draft')]
};

/**
 * Some tasks may have the same handling across all order types.
 * This determines if the request is for one of those tasks.
 *
 * @param {String} action may be 'create' or 'update'
 * @param model The validated request body
 * @returns {*} Array of tasks, only if applicable
 */
module.exports = function getCommonOrderTasks(action, model) {
	return validTasks[action];
};