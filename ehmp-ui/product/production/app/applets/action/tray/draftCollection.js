define([
    'main/ADK'
], function (ADK) {
    'use strict';

    var draftCollection = ADK.Resources.Writeback.Collection.extend({
        resource: 'clinical-object-find',
        vpr: 'clinical-objects',
        idAttribute: 'uid',

        parse: function (resp) {
            return _.get(resp, 'data.items', []);
        },
        getUrl: function (options) {
            var params = {
                pid: this.patient.get('pid')
            };

            var criteria = options.criteria || {};

            if (this.patient.has("acknowledged")) {
                criteria._ack = true;
            }

            var url = ADK.ResourceService.buildUrl(this.resource, criteria);
            return ADK.ResourceService.replaceURLRouteParams(unescape(url), params);
        },
        find: function(queryParams) {

            //used to form authorUid
            var site = ADK.UserService.getUserSession().get('site');
            var user = ADK.UserService.getUserSession().get('duz')[site];

            //default params
            var params = {
                patientUid: this.patient.get('uid'),
                ehmpState: 'draft',
                authorUid: 'urn:va:user:' + site + ':' + user
            };

            params = _.extend(params, queryParams);

            var attributes = {
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify(params)
            };

            return this.fetch(attributes);
        }
    });

    return draftCollection;
});
