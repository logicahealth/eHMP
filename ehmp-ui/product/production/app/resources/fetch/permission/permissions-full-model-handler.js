define([
    'underscore',
    'app/resources/fetch/permission/permissions-full-model'
], function(_, SharedModel) {
    'use strict';

    var sharedModel = null;
    var counter = 0;

    /**
     * Handles the clean up because this model is shared between more than one applet
     */
    return function mutualAssuredDestruction(view) {
        if (_.isNull(sharedModel)) {
            sharedModel = new SharedModel();
            sharedModel.fetch();
        }
        counter += 1;
        view.listenTo(view, 'destroy', function() {
            counter -= 1;
            if (counter === 0) {
                sharedModel = null;
            }
        });
        return sharedModel;
    };
});