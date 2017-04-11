define([
    'main/ADK',
    'app/resources/writeback/orders/draft/model',
], function(ADK, DraftOrder) {

    'use strict';

    return (function() {

        //============================= CONSTANTS =============================
        var DEFAULT_ATTRIBUTES = {
            contentType: 'application/json',
            type: 'POST'
        };

        //============================= UTILITIES =============================
        var getDefaultQueryParams = function() {
            if (_.isUndefined(this.patient)) {
                return {};
            }

            return {
                patientUid: this.patient.get('pid'),
                domain: 'order',
                subDomain: this.subDomain,
                ehmpState: 'draft'
            };
        };

        var select = function(queryParams) {
            var params = _.extend(getDefaultQueryParams.call(this), queryParams);

            var attributes = DEFAULT_ATTRIBUTES;
            attributes.data = JSON.stringify(params);

            this.fetch(attributes);
        };

        //=========================== API FUNCTIONS ===========================
        var parse = function(resp, options) {
            return _.get(resp, 'data.items', {});
        };

        var getUrl = function(method, options) {
            var params = {
                pid: this.patient.get('pid')
            };

            var url = ADK.ResourceService.buildUrl(this.resource);
            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        };

        var selectAll = function() {
            select.call(this);
        };

        var selectWhere = function(queryParameters) {
            select.call(this, queryParameters);
        };

        //============================ PUBLIC API =============================
        var draftResources = ADK.Resources.Writeback.Collection.extend({
            resource: 'clinical-object-find',
            vpr: 'clinical-objects',
            idAttribute: 'uid',
            model: DraftOrder,

            parse: parse,
            getUrl: getUrl,

            selectAll: selectAll,
            selectWhere: selectWhere
        });

        return draftResources;
    })();
});
