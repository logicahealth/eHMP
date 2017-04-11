'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');
var filemanDateUtil = require('../../../utils/fileman-date-converter');
var nullchecker = require('../../../core/rdk').utils.nullchecker;

module.exports.check = function(writebackContext, callback) {
    writebackContext.model.dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    if(nullchecker.isNullish(writebackContext.model.dfn)){
        return callback('Missing required patient identifiers');
    }

    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDXC ACCEPT';
        rpcClient.execute(rpcName, getParameters(writebackContext.model), function(err, data) {
                if (data) {
                    return callback(err, '' + data);
                } else {
                    return callback(err, data);
                }});
    });
};

function getParameters(model) {
    var parameters = [];
    if (model && model.dfn && model.orderDialog && model.location && model.inputList) {
        parameters.push(model.dfn);
        var fillerId = model.orderDialog.substring(0, model.orderDialog.indexOf(' '));
        parameters.push(fillerId);
        var inputList = model.inputList;
        var collectionDateTime, labTest, specimen, i;
        for (i = 0; i < inputList.length; i++) {
            if (inputList[i].inputKey === '6') {
                if (isNaN(inputList[i].inputValue)) {
                    collectionDateTime = inputList[i].inputValue;
                } else {
                    collectionDateTime = filemanDateUtil.getFilemanDateWithArgAsStr(inputList[i].inputValue);
                }
            } else if (inputList[i].inputKey === '4') {
                labTest = inputList[i].inputValue;
            } else if (inputList[i].inputKey === '127') {
                specimen = inputList[i].inputValue;
            }
        }
        parameters.push(collectionDateTime);
        parameters.push(model.location);
        var orderList = {};
        orderList['1'] = labTest + '^' + fillerId + '^' + specimen;
        parameters.push(orderList);
        if (model.orderId) {
            parameters.push(model.orderId);
        } else {
            parameters.push('');
        }
        parameters.push('0');
    }
    return parameters;
}

module.exports._getParameters = getParameters;
