'use strict';
var _ = require('lodash');


//https://wiki.vistacore.us/pages/viewpage.action?pageId=15218069

function getParameters(row) {
    var parameterMapping = [{
        channel: 'activity-management',
        event: 'show:form',
        _parameters: [{
            name: 'activityId',
            property: 'PROCESSINSTANCEID'
        }, {
            name: 'taskId',
            property: 'TASKID'
        }, {
            name: 'taskDefinitionId',
            property: 'DEFINITIONID'
        }, {
            name: 'taskName',
            property: 'TASKNAME'
        }, {
            name: 'beforeEarliestDate',
            property: 'BEFOREEARLIESTDATE'
        }]
    }, {
        channel: 'notes',
        event: 'note:edit',
        _parameters: [{
            name: 'clinicalObjectUid',
            property: 'CLINICALOBJECTUID'
        }]
    }, {
        channel: 'notes',
        event: 'note:consult',
        _parameters: [{
            name: 'clinicalObjectUid',
            property: 'CLINICALOBJECTUID'
        }]
    }, {
        channel: 'orders',
        event: 'show:lab-sign',
        _parameters: [{
            name: 'clinicalObjectUid',
            property: 'CLINICALOBJECTUID'
        }]
    }];


    var element;
    element = _.find(parameterMapping, {
        'channel': row.NAVIGATION.channel,
        'event': row.NAVIGATION.event
    });
    if (!_.isUndefined(element)) {
        var params = {};
        _.each(element._parameters, function(x) {
            params[x.name] = (row.hasOwnProperty([x.property])) ? row[x.property] : undefined;
        });
        return params;
    }
    return undefined;
}
module.exports.getParameters = getParameters;
