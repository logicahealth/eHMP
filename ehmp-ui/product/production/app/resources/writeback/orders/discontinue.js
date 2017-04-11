define([
    'main/ADK'
], function(ADK) {

    "use strict";

    var DiscontinueModel = (function() {
        //============================ VALIDATION =============================
        var validateDetails = function(attributes, options) {
            if (_.isEmpty(attributes.statusName)) {
                return 'JDS status must be included as "statusName" attribute';
            }
            if (_.isEmpty(attributes.orderIds)) {
                return 'Order ID list is invalid';
            }
        };

        var validateExecute = function(attributes, options) {
            if (this.errorModel) {
                this.errorModel.clear();
            }
            if (_.isEmpty(attributes.orderList)) {
                return 'Order list is invalid';
            }
            if ((attributes.action === 'discontinue') && (_.isEmpty(attributes.reason))) {
                this.errorModel.set({
                    reason: 'A reason for discontinue must be selected'
                });
                return 'Validation errors. Please fix.';
            }
        };

        //========================== URL GENERATION ===========================
        var getUrl = function(method, options) {
            var resource = '';
            var params = this.pick('pid');
            var queryParams = options.criteria || {};
            if (this.patient.has("acknowledged")) {
                queryParams._ack = true;
            }

            switch (method) {
                case 'read':
                    resource = 'lab-support-data';
                    queryParams.site = this.user.get('site');
                    queryParams.type = 'discontinue-reason';
                    break;
                case 'create':
                    resource = 'orders-lab-discontinue-details';
                    break;
                case 'delete':
                    resource = 'orders-lab-discontinue';
                    break;
            }
            var url = ADK.ResourceService.buildUrl(resource, queryParams);
            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        };

        //============================== PARSERS ==============================
        var parseDetails = function(resp, options) {
            var result = {};

            var detailSummary = resp.data[0].detail;
            var hash = resp.data[0].hash;

            var strArrayStatus = detailSummary.substring(detailSummary.search('Current Status:'), detailSummary.length).split('\r')[0];
            var vistaStatus = strArrayStatus.replace('Current Status:', '').trim().toUpperCase();
            var vistaSignatureStatus = strArrayStatus.replace('Signature:', '').trim().toUpperCase();
            var jdsStatus = (this.get('statusName') || '').toUpperCase();

            if (jdsStatus !== vistaStatus) {
                result.errorMessage = 'The order cannot be discontinued. ';
                if (vistaStatus === 'CANCELLED') {
                    result.errorMessage += 'This order has been deleted.';
                } else if (vistaStatus === 'DISCONTINUED') {
                    result.errorMessage += 'This order has been discontinued!';
                }
            } else {
                //[Edison] parsing out order check from the detail
                var orderChecksArray = detailSummary.substring(detailSummary.search('Order Checks:'), detailSummary.length);
                orderChecksArray = orderChecksArray.replace(/HIGH:/g, '|HIGH:').replace(/MODERATE:/g, '|MODERATE:').replace(/LOW:/g, '|LOW:').split('|');
                orderChecksArray.shift();
                result.orderCheck = orderChecksArray;
                result.hash = hash;
                result.action = (vistaStatus === 'PENDING') ? 'discontinue' : 'cancel';

                var detailSummaryLines = detailSummary.split('\r');
                result.summary = this.attributes.summary;

                // Parse the "order entered" date out from the activity section of the order detail text
                var detailIndex = -1;
                _.find(detailSummaryLines, function(str, index, arr) {
                    if (str.indexOf("Activity") >= 0) {
                        detailIndex = index + 1;
                        return true;
                    }
                });

                // Parse the line immediately after the one containing "Activity" in the array, then split the value using double-space as the token.
                // Note that if we couldn't find the "Activity" section string or if the index is invalid, we just use "N/A"
                var enterDetailStr = ((detailIndex >= 0) && (detailIndex < detailSummaryLines.length)) ? detailSummaryLines[detailIndex] : "N/A";
                result.entered = _.trim(enterDetailStr.split(/\s{2,}/)[0]);
            }

            return result;
        };

        var parseReasons = function(resp, options) {
            return {
                reasonListItems: [resp.data]
            };
        };

        //========================= UTILITY FUNCTIONS =========================
        var getOrderList = function() {
            var orderList = [];
            var orderIds = this.get('orderIds');
            var hash = this.get('hash');
            _.each(orderIds, function(orderId) {
                orderList.push({
                    'orderId': orderId,
                    'hash': hash
                });
            });
            return orderList;
        };

        var getDefaults = function() {
            if (_.isUndefined(this.patient)) {
                this.set('errorMessage', 'Patient is invalid');
                return;
            }
            if (_.isUndefined(this.user)) {
                this.set('errorMessage', 'User is invalid');
                return;
            }

            this.unset('errorMessage', {
                silent: true
            });

            var location = _.get(this.patient.get('visit'), 'locationUid', '').split(':').pop();
            var siteCode = this.user.get('site');
            this.set({
                pid: this.patient.get('pid'),
                location: location,
                siteCode: siteCode,
                provider: _.get(this.user.get('duz'), siteCode || '')
            }, {
                silent: true
            });
        };

        var addOrderId = function(orderId) {
            var orderIds = this.get('orderIds') || [];
            orderIds.push(orderId);
            this.set('orderIds', orderIds, {
                silent: true
            });
        };

        var clearOrderIds = function() {
            this.set('orderIds', [], {
                silent: true
            });
        };

        //=========================== API FUNCTIONS ===========================
        var getDetails = function() {
            this.parse = parseDetails;
            this.validate = validateDetails;
            getDefaults.apply(this);
            this.unset('uid', {
                silent: true
            });

            this.save();
        };

        var getReasons = function() {
            this.parse = parseReasons;
            this.validate = ADK.Resources.Writeback.Model.prototype.validate;

            this.fetch();
        };

        var execute = function() {
            this.parse = ADK.Resources.Writeback.Model.prototype.parse;
            this.validate = validateExecute;
            getDefaults.apply(this);

            this.set({
                uid: 1,
                orderList: getOrderList.apply(this)
            }, {
                silent: true
            });

            // Perform manual validation, since calling 'destroy' directly doesn't do it for us
            if (!this.isValid()) {
                this.trigger('delete:error', this, this.validationError, {});
                return;
            }

            var data = this.pick(['pid', 'kind', 'location', 'provider', 'orderList', 'reason']);
            this.destroy({
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        };

        //============================ PUBLIC API =============================
        var discontinueResource = ADK.Resources.Writeback.Model.extend({
            resource: 'discontinue',
            vpr: 'orders',
            idAttribute: 'uid',
            defaults: {
                kind: 'Laboratory',
                action: 'cancel',
                statusName: '',
                id: 1,
                reasonListItems: [],
                reason: ''
            },
            getUrl: getUrl,
            addOrderId: addOrderId,
            clearOrderIds: clearOrderIds,

            getDetails: getDetails,
            getReasons: getReasons,
            execute: execute,
        });

        return discontinueResource;
    })();

    return DiscontinueModel;
});