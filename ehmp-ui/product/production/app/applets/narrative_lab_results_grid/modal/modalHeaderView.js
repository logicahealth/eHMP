/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/narrative_lab_results_grid/modal/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    //noinspection UnnecessaryLocalVariableJS
    var LabModalHeaderView = Backbone.Marionette.ItemView.extend({
        events: {
            'click #labssNext': 'getNextModal',
            'click #labssPrevious': 'getPrevModal'
        },
        template: HeaderTemplate,
        initialize: function(){
            this.getModals();
        },
        onAttach: function() {
            this.checkIfModalIsEnd();
        },
        checkIfModalIsEnd: function() {
            var next = _.indexOf(this.modals, this.model);
            if (next + 1 >= this.modals.length) {
                this.$el.closest('.modal').find('#labssNext').attr('disabled', true);
            }
            if (next - 1 < 0) {
                this.$el.closest('.modal').find('#labssPrevious').attr('disabled', true);
            }
        },
        getNextModal: function() {
            var next = _.indexOf(this.modals, this.model) + 1;
            var model = this.modals[next];
            this.setNextPrevModal(model);
        },
        getPrevModal: function() {
            var next = _.indexOf(this.modals, this.model) - 1;
            var model = this.modals[next];
            this.setNextPrevModal(model);
        },
        getModals: function() {
            this.modals = [];
            _.each(this.dataCollection.models, function(model) {
                if (model.get('labs')) {
                    var outerIndex = this.dataCollection.indexOf(model);
                    _.each(model.get('labs').models, function(labModel) {
                        labModel.set({
                            'inAPanel': true,
                            'parentIndex': outerIndex,
                            'parentModel': model
                        });
                        this.modals.push(labModel);

                    }, this);
                } else {
                    this.modals.push(model);
                }
            }, this);
        },
        setNextPrevModal: function(model) {
            if (_.get(this, 'showNavHeader')) {
                model.set('navHeader', true);
            }
            var results = model.get('results') || {};
            var resultUID = _.get(results, '[0].resultUid');
            var channel = ADK.Messaging.getChannel('narrative_lab_results');
            if (resultUID) {
                return channel.trigger('showExternalModalView', resultUID, model, this.dataCollection, ADK.PatientRecordService.getCurrentPatient(), this.triggerElement);
            }
            channel.trigger('showErrorView', model, this.dataCollection, this.triggerElement);
        }
    });

    return LabModalHeaderView;

});
