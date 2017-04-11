'use strict';

var validTasks = {
	// commonTaskName: [writeback tasks]
	discontinueDetailsLab: [require('./orders-common-discontinue-details-vista-writer')],
	discontinueLab: [require('./orders-common-discontinue-vista-writer')],
	editLab: [require('./orders-common-edit-vista-writer')],
	detailLab: [require('./orders-common-detail-vista-writer')],
	signDetailsLab: [require('./orders-common-sign-details-vista-writer')],
	signOrdersLab: [require('./orders-common-sign-vista-writer')],
	saveDraftLabOrder: [require('./orders-common-save-draft-write')],
	findDraftOrders: [require('./orders-common-find-draft')],
	readDraftOrder: [require('./orders-common-read-draft')]
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
