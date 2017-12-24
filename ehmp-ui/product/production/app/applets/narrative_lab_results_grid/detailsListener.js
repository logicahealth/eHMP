/* global ADK */
define([
    "backbone",
    "marionette",
    'underscore',
    "./modal/modalHeaderView",
    "./modal/modalFooterView"
], function createDetailsListener(Backbone, Marionette, _, ModalHeaderView, modalFooterView) {
    'use strict';

    //noinspection UnnecessaryLocalVariableJS
    var EventHandler = Backbone.Marionette.Object.extend({
        channel: ADK.Messaging.getChannel('narrative_lab_results'),
        channelEvents: {
            detailView: 'showDetails',
            showExternalModalView: 'showExternalModalView',
            showErrorView: 'showErrorModal'
        },
        initialize: function initialize() {
            Backbone.Marionette.bindEntityEvents(this, this.channel, this.channelEvents);
        },
        onBeforeDestroy: function onBeforeDestroy() {
            Backbone.Marionette.unbindEntityEvents(this, this.channel, this.channelEvents);
        },
        showDetails: function showDetails(channelObj) {
            var model = _.get(channelObj, 'model');
            var results = model.get('results')[0];
            var resultUID = _.get(results, 'resultUid');
            var patient = _.get(channelObj, 'patient') || ADK.PatientRecordService.getCurrentPatient();
            var triggerElement = _.get(channelObj, '$el');
            if (resultUID) {
                return this.showExternalModalView(resultUID, model, _.get(channelObj, 'collection'), patient, triggerElement);
            }
            return this.showErrorModal(model, _.get(channelObj, 'collection'), triggerElement);
        },
        showExternalModalView: function showExternalModalView(resultUID, model, collection, patient, triggerElement) {
            var domainName = resultUID.split(":")[2];
            var domainChannel = _.isEqual(domainName, 'document') ? 'documents' : 'medication_review';
            var channel = ADK.Messaging.getChannel(domainChannel);
            var request = {
                uid: resultUID,
                model: model,
                patient: patient
            };
            var details = channel.request('detailView', request);
            var view = new details.view();
            var options = {
                title: details.title,
                size: 'large',
                footerView: modalFooterView,
                showLoading: true,
                triggerElement: triggerElement,
                headerView: ModalHeaderView.extend({
                    model: model,
                    theView: view,
                    dataCollection: collection,
                    navHeader: true,
                    triggerElement: triggerElement
                })
            };
            var modal = new ADK.UI.Modal({
                view: view,
                options: options
            });
            modal.show();
        },
        showErrorModal: function showErrorModal(model, collection, triggerElement) {
            var error = "Lab has no link to a result document";
            var header = ModalHeaderView.extend({
                model: model,
                theView: ModalHeaderView,
                dataCollection: collection,
                navHeader: true
            });
            var errorView = ADK.Views.Error.create({
                model: new Backbone.Model({error: error})
            });
            var modalOptions = {
                title: "An Error Occurred",
                size: 'large',
                triggerElement: triggerElement,
                footerView: modalFooterView,
                headerView: header
            };
            var modal = new ADK.UI.Modal({
                view: errorView,
                options: modalOptions
            });
            ADK.UI.Modal.hide();
            modal.show();
        }
    });

    return EventHandler;
});
