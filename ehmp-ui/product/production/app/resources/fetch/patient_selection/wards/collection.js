define([], function() {

    var Ward = ADK.Resources.Model.extend({
        idAttribute: 'uid'
    });

    var Wards = ADK.Resources.Collection.extend({
        resource: 'write-pick-list-wards-fetch-list',
        model: Ward,
        parse: function(resp, options) {
            return resp.data || resp;
        },
    });

    return Wards;
});