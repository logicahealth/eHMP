define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/narrative_lab_results_grid/modal/headerTemplate',
    'app/applets/narrative_lab_results_grid/modal/modalView',
    'app/applets/narrative_lab_results_grid/appletUiHelpers'
], function(Backbone, Marionette, _, HeaderTemplate, modalView, AppletUiHelpersUndef) {
    'use strict';

    //Modal Navigation Item View
    var LabModalHeaderView = Backbone.Marionette.ItemView.extend({
        events: {
            'click #labssPrevious, #labssNext': 'navigateModal',
            'click #smClose': 'closeModal'
        },
        closeModal: function(e) {
            modalView.resetSharedModalDateRangeOptions();
        },
        initialize: function(){
            this.getModals();
        },
        navigateModal: function(e) {
            var $target = $(e.currentTarget),
                id = $target.attr('id');
            id === 'labssPrevious' ? this.getPrevModal() : this.getNextModal();
        },
        template: HeaderTemplate,
        onAttach: function() {
            this.checkIfModalIsEnd();
        },
        checkIfModalIsEnd: function() {
            var next = _.indexOf(this.modals, this.model) + 1;
            if (next >= this.modals.length) {
                this.$el.closest('.modal').find('#labssNext').attr('disabled', true);
            }

            next = _.indexOf(this.modals, this.model) - 1;
            if (next < 0) {
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
            _.each(this.dataCollection.models, function(m, key) {

                if (m.get('labs')) {
                    var outterIndex = this.dataCollection.indexOf(m);
                    _.each(m.get('labs').models, function(m2, key) {
                        m2.set({
                            'inAPanel': true,
                            'parentIndex': outterIndex,
                            'parentModel': m
                        });
                        this.modals.push(m2);

                    });
                } else {
                    this.modals.push(m);
                }

            }, this);
        },
        setNextPrevModal: function(model) {

            if (this.showNavHeader) {
                model.attributes.navHeader = true;
            }
            if (model.get('inAPanel')) {
                var tr = $('#data-grid-' + this.appletOptions.instanceID + ' > tbody>tr.selectable').eq(model.get('parentIndex'));
                if (!tr.data('isOpen')) {
                    tr.trigger('click');
                }
                $('#data-grid-' + this.appletOptions.instanceID + ' > tbody>tr.selectable').not(tr).each(function() {
                    var $this = $(this);
                    if ($this.data('isOpen')) {
                        $this.trigger('click');
                    }

                });

            }

            var AppletUiHelper = require('app/applets/narrative_lab_results_grid/appletUiHelpers');
            AppletUiHelper.getDetailView(model, null, this.appletOptions, true, AppletUiHelper.showModal, AppletUiHelper.showErrorModal);
        }

    });
    return LabModalHeaderView;

});
