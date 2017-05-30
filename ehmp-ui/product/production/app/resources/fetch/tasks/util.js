define([
    'underscore',
    'moment'
], function(_, moment) {
    'use strict';
    return {
        setOverdueText: function(dueDate, pastDueDate) {
            var ret = {
                '-1': {
                    dueText: 'Past due',
                    dueTextClass: 'text-danger',
                    dueTextValue: -1
                },
                '0': {
                    dueText: 'Due',
                    dueTextClass: '',
                    dueTextValue: 0
                },
                '1': {
                    dueText: '',
                    dueTextClass: '',
                    dueTextValue: 1
                }
            };

            var now = moment.utc();
            var isDue = now.isSameOrAfter(dueDate, 'day') && (now.isSameOrBefore(pastDueDate, 'day') || !moment(pastDueDate).isValid());
            var isPastDue = now.isAfter(pastDueDate, 'day');

            var index;
            if (isPastDue) {
                index = -1;
            } else {
                index = isDue ? 0 : 1;
            }
            return ret[index];
        },
        hasPermissions: function(task) {
            var isRequestReview = (_.get(task, 'taskName') === 'Review') || (_.get(task, 'TASKNAME') === 'Review');
            var hasEditRequestPermission = ADK.UserService.hasPermissions('edit-coordination-request');
            if (isRequestReview && !hasEditRequestPermission) {
                return false;
            }

            var isResponseReview = (_.get(task, 'taskName') === 'Response') || (_.get(task, 'TASKNAME') === 'Response');
            var hasRespondRequestPermission = ADK.UserService.hasPermissions('respond-coordination-request');
            if (isResponseReview && !hasRespondRequestPermission) {
                return false;
            }

            var permission = task.PERMISSION;
            if (_.isUndefined(permission) || _.isNull(permission)) {
                return true;
            }
            if (_.isEmpty(permission.ehmp) && _.isEmpty(permission.user)) {
                return true;
            }
            var userSession = ADK.UserService.getUserSession();
            var userId = userSession.get('site') + ';' + userSession.get('duz')[userSession.get('site')];
            if (ADK.UserService.hasPermissions(permission.ehmp.join('|'))) {
                if (_.isEmpty(permission.user) || _.contains(permission.user, userId)) {
                    return true;
                }
            }
            if (_.contains(permission.user, userId)) {
                if (_.isEmpty(permission.ehmp)) {
                    return true;
                }
            }
            return false;
        },
        taskComparator: function(model) {
            var dueDateVal = 0;
            var activeSort = model.get('ACTIVE') ? 0 : 1;

            // dueStatusVal - only positive numbers. (0, 1, 2 instead of -1, 0, 1)
            var dueStatusVal = model.get('dueTextValue') + 1;

            // Splits the priority intervals in 3 parts. [0,3] is 0, [4,6] is 1, [7,10] is 2.
            var priorityVal = Math.floor((model.get('PRIORITY')) / 3.5);

            if (!_.isNull(model.get('DUE'))) {
                dueDateVal = model.get('earliestDateMilliseconds');
            }

            // sortValue is a concatenated string converted to integer
            return parseInt('1' + activeSort + dueStatusVal + priorityVal + dueDateVal);
        },
        priorityMappings: {
            0: 'High',
            1: 'High',
            2: 'High',
            3: 'High',
            4: 'Medium',
            5: 'Medium',
            6: 'Medium',
            7: 'Low',
            8: 'Low',
            9: 'Low',
            10: 'Low'
        }
    };
});
