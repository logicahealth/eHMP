'use strict';

const qs = require('querystring');
const _ = require('underscore');

function addIcn(request, response){
	let query = request.query;
	if(!query || !query.icn){
		return response.status(400).json({
			error: '"icn" is a required parameter'
		});
	}
	let icn = query.icn;

	this.emptyResponseList.push(icn);
	response.status(200).json({message: 'Added ' + icn, emptyResponseList: this.emptyResponseList});
}

function removeIcn(request, response){
	let query = request.query;
	if(!query || !query.icn){
		return response.status(400).json({
			error: '"icn" is a required parameter'
		});
	}
	let icn = query.icn;

	this.emptyResponseList = _.without(this.emptyResponseList, icn);
	response.status(200).json({message: 'Removed ' + icn, emptyResponseList: this.emptyResponseList});
}

function check(request, response){
	response.status(200).json({emptyResponseList: this.emptyResponseList});
}

module.exports = {
	addIcn: addIcn,
	removeIcn: removeIcn,
	check: check
};