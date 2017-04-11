'use strict';

var writeVprToJds = require('../core/jds-direct-writer');

var noteTasks = {
	updateUnsigned: [
		require('./notes-validator').update,
		require('./notes-unsigned-pjds-writer').update
	]
};

/**
 * @param model unvalidated VPR+ model
 * @returns {*} Array of tasks if applicable
 */
module.exports.update = function getUpdateNoteTasks(model) {
	var taskName = 'updateUnsigned';
	return noteTasks[taskName];
};
