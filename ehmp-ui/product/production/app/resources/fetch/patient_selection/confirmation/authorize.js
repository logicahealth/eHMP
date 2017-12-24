define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var Authorize = BaseCollection.extend({
        resource: 'authorize-authorize',
        model: ADK.Resources.Model.extend({
            parse: ADK.ResourceService.DomainModel.prototype.parse
        })
    });

    return Authorize;
});
