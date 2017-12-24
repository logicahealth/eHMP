define([
    'backbone',
    'moment',
    'underscore',
    'app/resources/fetch/tasks/util'
], function(Backbone, moment, _, Util) {
    'use strict';

    return Backbone.Model.extend({
        childParse: false,
        parse: function(response) {
            var momentDue = moment(response.DUE);
            response.TASKNAMEFORMATTED = _.trim((response.TASKNAME + ' - ' + response.INSTANCENAME), ' -');
            response.DUEDATEFORMATTED = momentDue.isValid() ? momentDue.format('MM/DD/YYYY') : 'N/A';
            response.EXPIRATIONTIMEFORMATTED = moment(response.EXPIRATIONTIME).isValid() ? moment(response.EXPIRATIONTIME).format('MM/DD/YYYY') : 'N/A';
            response.earliestDateMilliseconds = momentDue.valueOf();
            response.dueDateMilliseconds = moment(response.EXPIRATIONTIME).valueOf();
            _.extend(response, Util.setOverdueText(response.DUE, response.EXPIRATIONTIME));

            if (response.PRIORITY !== undefined) {
                response.priorityFormatted = Util.priorityMappings[response.PRIORITY];
            }

            if (response.STATUS === 'Created' || response.STATUS === 'Ready' || response.STATUS === 'Reserved' || response.STATUS === 'InProgress') {
                response.statusFormatted = 'Active';
            } else if (response.STATUS === 'Completed' || response.STATUS === 'Failed' || response.STATUS === 'Exited' || response.STATUS === 'Suspended') {
                response.statusFormatted = 'Inactive';
            }

            response.ACTIVE = (response.statusFormatted === 'Active');

            if (!_.isNull(response.PATIENTNAME) && !_.isUndefined(response.PATIENTNAME) && response.PATIENTNAME !== '') {
                response.PATIENTNAMESSN = response.PATIENTNAME + ' (' + response.LAST4 + ')';
            }

            response.actionable = Util.isActionable(response.ACTIVE, response.dueTextValue, response.hasPermissions, response.BEFOREEARLIESTDATE);

            var momentCreated = moment(response.TASKCREATEDON);
            if (momentCreated.isValid()) {
                response.createdOnDate = momentCreated.format('MM/DD/YYYY');
                response.createdOnTime = momentCreated.format('HH:mm');
            } else {
                response.createdOnDate = 'N/A';
            }

            return response;
        }
    });
});
