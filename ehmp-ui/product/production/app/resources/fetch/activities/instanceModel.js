/* global ADK */

define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    "use strict";

    var Activity = Backbone.Model.extend({
        parse: function(response) {
            var activityRecord = response.consultOrder;
            if (activityRecord) {
                activityRecord.condition = _.get(activityRecord, 'conditions[0].code');
                activityRecord.destinationFacility = _.get(activityRecord, 'destinationFacility.code');
                var stateTokens = _.get(response, 'state', ':').split(':');
                activityRecord.state = stateTokens[0];
                activityRecord.subState = stateTokens[1];
                activityRecord.orderable = response.orderable;
                activityRecord.cdsIntentResult = JSON.parse(_.get(response, 'consultClinicalObject.data.consultOrders[0].cdsIntentResult', '{}'));
                activityRecord.formAction = response.formAction;
                activityRecord.acceptingProvider = this._buildAcceptingProvider(_.get(activityRecord, 'acceptingProvider.uid'));

                // Augment preReqOrder with domain and order action information
                var self = this;
                activityRecord.preReqOrders = _.map(activityRecord.preReqOrders, function(order) {
                    var orderRemediation = self._getOrderRemediation(order, _.get(activityRecord, 'cdsIntentResult.data.results'));
                    return self._augmentPreReqOrder(order, orderRemediation);
                });
            }
            return activityRecord;
        },
        _buildAcceptingProvider: function(uid) {
            var acceptingProvider = uid || '';
            var index = acceptingProvider.lastIndexOf('user:');
            return acceptingProvider.substring(index + 5);
        },
        _getOrderRemediation: function(order, cdsIntentResults) {
            var matchingResult = _.find(cdsIntentResults, function(result) {
                return order.orderName === _.get(result, 'detail.code.text') ||
                    order.orderName === _.get(result, 'detail.comments');
            });
            return _.isEmpty(matchingResult) ? null : matchingResult.remediation;
        },
        _augmentPreReqOrder: function(preReqOrder, orderRemediation) {
            if (_.isEmpty(orderRemediation)) {
                return preReqOrder;
            }
            return _.extend(preReqOrder, {
                domain: orderRemediation.domain,
                action: orderRemediation.action
            });
        }
    });
    return Activity;
});