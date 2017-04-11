define([
    "backbone",
    "underscore"
], function(Backbone, _) {
    "use strict";

    var writebackUtils = {
        buildAcceptActionModel: function(model, acceptActionModel) {

            var deploymentId = model.get('deploymentId');
            var signalName = model.get('signalName');
            var processInstanceId = Number(model.get('processId'));
            var signalBody = new _.extend({
                'objectType': "signalBody"
            }, model.get('signalBody'));

            acceptActionModel.set({
                'deploymentId': deploymentId,
                'signalName': signalName,
                'processInstanceId': processInstanceId,
                'parameter': {
                    'signalBody': signalBody
                }
            });

            return acceptActionModel;
        },
        acceptAction: function(model, successCallback, errorCallback) {
            var acceptActionModel = new ADK.UIResources.Writeback.Activities.Signal.Model();

            this.buildAcceptActionModel(model, acceptActionModel);
            acceptActionModel.save(null, {
                success: function() {
                    successCallback();
                },
                error: function(model, error) {
                    errorCallback(error);
                }
            });
        },
        unregisterChecks: function() {

        }
    };

    return writebackUtils;
});