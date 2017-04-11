'use strict';

function Constants() {
    this.RESOURCE_TYPE = 'CommunicationRequest';

    this.CATEGORIES = ['ehmp/msg/category/clinical', 'ehmp/msg/category/administrative', 'ehmp/msg/category/operational'];

    this.MEDIUMS = ['ehmp/msg/medium/ui/todo', 'ehmp/msg/medium/ui/inline', 'ehmp/msg/medium/ui/overlay',
        'ehmp/msg/medium/ui/dialog', 'ehmp/msg/medium/email', 'ehmp/msg/medium/sms', 'ehmp/msg/medium/secure'];

    this.PRIORITIES_ALERT = 'ehmp/msg/priority/alert';
    this.PRIORITIES_ALERT_ALARM = [this.PRIORITIES_ALERT, 'ehmp/msg/priority/alarm'];
    this.PRIORITIES_COMMON = ['ehmp/msg/priority/high', 'ehmp/msg/priority/medium', 'ehmp/msg/priority/low'];
    this.PRIORITIES_COMMON_WARN = this.PRIORITIES_COMMON.slice();
    this.PRIORITIES_COMMON_WARN.push('ehmp/msg/priority/warning');
    this.PRIORITIES = this.PRIORITIES_COMMON_WARN.slice();
    this.PRIORITIES = this.PRIORITIES.concat(this.PRIORITIES_ALERT_ALARM.slice());

    this.REASONS =  ['ehmp/msg/reason/information', 'ehmp/msg/reason/decision', 'ehmp/msg/reason/review',
        'ehmp/msg/reason/update/[message_id]', 'ehmp/msg/reason/advice', 'ehmp/msg/reason/task',
        'ehmp/msg/reason/exception'];

    this.STATUSES = ['proposed', 'planned', 'requested', 'received', 'accepted', 'in-progress', 'completed', 'suspended',
        'rejected', 'failed'];
}

module.exports = new Constants();
