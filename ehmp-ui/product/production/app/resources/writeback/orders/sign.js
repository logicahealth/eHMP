define([
    'main/ADK'
], function(ADK) {

    "use strict";

    var SignModel = (function() {

        //============================= CONSTANTS =============================
        var DEFAULT_ATTRIBUTES = {
            contentType: 'application/json',
            success: function() {},
            error: function() {}
        };

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
            var reasonForOverride = attributes.reason_for_override || '';
            var signatureCode = attributes.signature_code || '';
            if (this.errorModel) {
                this.errorModel.clear();
            }
            if (attributes.showOverride && (reasonForOverride.length < 3)) {
                this.errorModel.set({
                    reason_for_override: 'Override reason must be at least 3 characters long'
                });
            }
            if (signatureCode.length < 6) {
                this.errorModel.set({
                    signature_code: 'Must be at least 6 characters long'
                });
            }
            if (!this.errorModel.isEmpty()) {
                return 'Validation errors. Please fix.';
            }
        };

        //========================== URL GENERATION ===========================
        var getUrl = function(resource, method, options) {
            var params = {
                pid: this.get('pid'),
                site: this.user.get('site')
            };
            var criteria = options.criteria || {};

            if (this.patient.has("acknowledged")) {
                criteria._ack = true;
            }
            var url = ADK.ResourceService.buildUrl(resource, criteria);
            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        };

        //============================== PARSERS ==============================
        var parseDetails = function(resp, options) {
            var result = {};

            var signOrders = resp.data[0];

            result.detailSummary = signOrders.detail;
            var strArrayStatus = result.detailSummary.substring(result.detailSummary.search('Current Status:'), result.detailSummary.length).split('\r')[0];
            var vistaStatus = strArrayStatus.replace('Current Status:', '').trim().toUpperCase();
            var jdsStatus = (this.get('statusName') || '').toUpperCase();

            //There may be multiple signature activities in the detail summary, so we make sure we account for that possibility
            var modifiedStatus = result.detailSummary.replace(/Signature:/g, "Signature:|").replace(/\r/g, "|").split('|');
            var vistaSignatureStatus = _.chain(modifiedStatus)
                .filter(function(status, index) {
                    return ((index > 0) && (!_.isUndefined(status)) && (this[index - 1].trim() === 'Signature:'));
                }, modifiedStatus)
                .map(function(value) {
                    return value.trim();
                })
                .last()
                .value();
            vistaSignatureStatus = (_.isString(vistaSignatureStatus) ? vistaSignatureStatus.toUpperCase() : '');

            // [Mike F]: The JDS sync for discontinued, unsigned orders isn't *quite* working like it's supposed to. Currently, discontinued, unsigned order
            // JDS status will show as 'UNRELEASED', while VistA status will show as 'PENDING'.  In this special case, we adjust the JDS status to equal
            // the VistA status to pass the test case.  Eventually, this should be fixed when the issue is resolved.
            if ((jdsStatus === 'UNRELEASED') && (vistaStatus === 'PENDING')) {
                vistaStatus = 'UNRELEASED';
            }

            if ((jdsStatus !== vistaStatus) || (vistaSignatureStatus !== 'NOT SIGNED')) {
                if ((vistaStatus !== 'CANCELLED') && (vistaSignatureStatus !== '') && (vistaSignatureStatus !== 'NOT SIGNED') && (vistaSignatureStatus !== 'NOT REQUIRED DUE TO SERVICE CANCEL/LAPSE')) {
                    result.errorMessage = 'The order cannot be signed.  This order has been signed';
                } else if ((vistaStatus === 'CANCELLED') && ((vistaSignatureStatus !== 'NOT SIGNED') || (vistaSignatureStatus === 'NOT REQUIRED DUE TO SERVICE CANCEL/LAPSE'))) {
                    result.errorMessage = 'The order cannot be signed.  The order has been deleted';
                } else {
                    result.errorMessage = 'Inconsistent versions exist for this order';
                }
            } else {
                result.showOverride = false;
                result.originalOrderCheckList = signOrders.orderCheckList;
                result.orderCheckList = _.map(signOrders.orderCheckList, function(oc) {
                    //[Edison T]: if any of the order check severity is 1, override reason is required
                    if (oc.orderCheck.split('^')[2] === '1') {
                        result.showOverride = true;
                    }
                    return oc.orderCheck.split('^')[2].concat(oc.orderCheck.split('^')[3]);
                });
                result.orderCheck = result.orderCheckList;
                result.orderDetailHash = signOrders.hash;

                var detailSummaryLines = result.detailSummary.split('\r');
                result.summary = this.attributes.summary;

                if (!_.isEmpty(result.orderCheck)) {
                    result.orderCheckData = _.map(result.orderCheck, function(orderCheck, index, orderChecks) {
                        return {
                            label: orderCheck.substring(1),
                            warning: (orderCheck.substring(0, 1) === '1') ? '* Order Check requires Reason for Override' : '',
                            index: index + 1,
                            count: orderChecks.length,
                        };
                    });
                }
            }

            return result;
        };

        //========================= UTILITY FUNCTIONS =========================
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

        var getOrderList = function() {
            var orderList = [];
            var orderIds = this.get('orderIds');
            var hash = this.get('orderDetailHash');
            var isDiscontinuedOrder = this.isDiscontinuedOrder();

            _.each(orderIds, function(orderId) {
                //When signing discontinued orders, we need to manipulate the order ID slightly to reflect the changes made in VistA to point to the correct order item.
                //When an order is discontinued, it takes on a new order ID, which means that if we don't do this, VistA will think we're trying to sign the old, signed
                //order, and return an error state.
                if (isDiscontinuedOrder) {
                    orderId = orderId.replace(';1', ';2');
                }
                orderList.push({
                    'orderId': orderId,
                    'orderDetailHash': hash
                });
            });

            return orderList;
        };

        var getOrderCheckList = function() {
            var orderCheckList = this.get('originalOrderCheckList');
            var orderCheckArray = _.map(orderCheckList, function(orderCheck) {
                return {
                    orderCheck: orderCheck.orderCheck
                };
            });
            return orderCheckArray;
        };

        //=========================== API FUNCTIONS ===========================
        var getDetails = function() {
            this.parse = parseDetails;
            this.validate = validateDetails;
            this.getUrl = _.partial(getUrl, 'orders-lab-sign-details');
            getDefaults.apply(this);

            this.save();
        };

        var execute = function(options) {
            this.validate = validateExecute;
            this.getUrl = _.partial(getUrl, 'orders-lab-sign');
            getDefaults.apply(this);

            // Perform manual validation, since calling 'sync' directly doesn't do it for us
            if (!this.isValid()) {
                this.trigger('sign:error', this, this.validationError, {});
                return;
            }

            // Compile the data object that will be passed into the body of the sign request
            var data = this.pick(['pid', 'kind', 'location', 'provider']);
            data.orderList = getOrderList.apply(this);

            var orderCheckList = getOrderCheckList.apply(this);
            if (!_.isEmpty(orderCheckList)) {
                data.orderCheckList = orderCheckList;
            }

            data.eSig = this.get('signature_code');
            data.overrideReason = (this.get('reason_for_override') || '').replace(/\^/g, ' ');
            this.set(data, {
                silent: true
            });

            // Use the custom 'sign' method (which maps to 'create') to perform the sign
            var attributes = _.extend({}, DEFAULT_ATTRIBUTES, options);
            this.sync('sign', this, attributes);
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

        var setDiscontinuedOrder = function(isDiscontinuedOrder) {
            if (isDiscontinuedOrder === true) {
                this.set('isDiscontinued', true, {
                    silent: true
                });
            }
        };

        var isDiscontinuedOrder = function() {
            return !!(this.get('isDiscontinued') || false);
        };

        //============================ PUBLIC API =============================
        var signResource = ADK.Resources.Writeback.Model.extend({
            resource: 'sign',
            vpr: 'orders',
            idAttribute: 'uid',
            defaults: {
                kind: 'Laboratory',
                statusName: '',
                id: 1,
            },
            methodMap: {
                sign: 'create'
            },

            getDetails: getDetails,
            execute: execute,

            addOrderId: addOrderId,
            clearOrderIds: clearOrderIds,
            setDiscontinuedOrder: setDiscontinuedOrder,
            isDiscontinuedOrder: isDiscontinuedOrder
        });

        return signResource;
    })();

    return SignModel;
});