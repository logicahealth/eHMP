define([
    'moment'
], function (moment) {
    'use strict';

    var Utils = {
        enrichSingleActivityModel: function (model, facilityMonikers, contextViewType) {
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
            if (_.isNull(model.get('healthIndicator'))) {
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

            var isConsult = model.get('domain') && model.get('domain').toUpperCase() === 'CONSULT';
            var isStaffView = contextViewType === 'staff';
            model.set({
                'age': age,
                'isConsult': isConsult,
                'facilityRequestedName': facilityRequestedName,
                'healthIndicator': healthIndicator,
                'isStaffView': isStaffView,
                'urgency': urgency
            });

            Utils.setPrerequisiteData(model);
        },
        setPrerequisiteData: function (model) {
            var prerequisites = model.get('prerequisites');
            if (!_.isUndefined(prerequisites)) {
                var questionMetCounter = 0;
                var orderResultMetCounter = 0;

                if (!_.isUndefined(prerequisites.questions)) {
                    _.each(prerequisites.questions, function (question) {
                        if (!_.isUndefined(question.response) && (question.response.toUpperCase() === 'YES' || question.response.toUpperCase() === 'OVERRIDE')) {
                            question.met = true;
                            questionMetCounter++;
                        }
                    });

                    prerequisites.questionCount = prerequisites.questions.length;
                }

                if (!_.isUndefined(prerequisites.orderResults)) {
                    _.each(prerequisites.orderResults, function (orderResult) {
                        if (!_.isUndefined(orderResult.status) && (orderResult.status.toUpperCase() === 'COMPLETED' || orderResult.status.toUpperCase() === 'OVERRIDE' || orderResult.status.toUpperCase() === 'ORDERED')) {
                            orderResult.met = true;
                            orderResultMetCounter++;
                        }
                    });

                    prerequisites.orderResultCount = prerequisites.orderResults.length;
                }

                prerequisites.totalCount = prerequisites.questionCount + prerequisites.orderResultCount;
                prerequisites.totalMet = questionMetCounter + orderResultMetCounter;
            }
        }
    };
    return Utils;
});
