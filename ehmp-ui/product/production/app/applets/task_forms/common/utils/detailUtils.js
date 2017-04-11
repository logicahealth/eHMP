define([
    'moment'
], function (moment) {
    'use strict';

    var APPOINTMENT_IN_PAST_SUBSTATE = 'Appt. in Past';
    var AMENDED_APPOINTMENT_IN_PAST_SUBSTATE = APPOINTMENT_IN_PAST_SUBSTATE + ', Action Required';

    var Utils = {
        enrichSingleActivityModel: function (model, facilityMonikers, contextViewType, readOnly) {
            var age = '';
            if (!_.isUndefined(model.get('DOB'))) {
                var momentDob = moment(model.get('DOB'), 'YYYYMMDD');
                age = moment().diff(momentDob, 'years');
            }
            var state = model.get('state');
            var substate = '';

            if(!_.isEmpty(state)){
                var stateParts = state.split(':');
                if (_.isArray(stateParts) && stateParts.length === 2) {
                    state = stateParts[0];
                    substate = stateParts[1];
                }
                if (substate === APPOINTMENT_IN_PAST_SUBSTATE) {
                    substate = AMENDED_APPOINTMENT_IN_PAST_SUBSTATE;
                }
                model.set('state', state);
                model.set('substate', substate);
            }

            var facilityRequestedName = '';
            if (!_.isNull(model.get('facilityRequestDivisionId'))) {
                var facility = facilityMonikers.findWhere({
                    facilityCode: model.get('facilityRequestDivisionId')
                });

                if (!_.isUndefined(facility)) {
                    facilityRequestedName = facility.get('facilityName');
                }
            }

            var healthIndicator = model.get('healthIndicator');
            if (_.isNull(model.get('healthIndicator')) || model.get('healthIndicator') === 1) {
                healthIndicator = false;
            } else {
                healthIndicator = true;
            }

            var urgency = '';
            switch(model.get('urgency')){
                case 2:
                    urgency = 'Emergent';
                    break;
                case 4:
                    urgency = 'Urgent';
                    break;
                case 9:
                    urgency = 'Routine';
                    break;
            }

            var isStaffView = contextViewType === 'staff';
            model.set({
                'age': age,
                'facilityRequestedName': facilityRequestedName,
                'healthIndicator': healthIndicator,
                'isStaffView': isStaffView,
                'urgency': urgency,
                'readOnly': readOnly
            });

            if(!_.isEmpty(model.get('taskHistory'))){
                _.each(model.get('taskHistory'), function(historyItem){
                    if(!_.isNull(historyItem.signalStatusTimestamp)){
                        historyItem.formattedStatusTimestamp = moment.utc(historyItem.signalStatusTimestamp, 'YYYY-MM-DD[T]HH:mm[Z]').local().format('MM/DD/YYYY HH:mm');
                    }
                });
            }
        }
    };
    return Utils;
});
