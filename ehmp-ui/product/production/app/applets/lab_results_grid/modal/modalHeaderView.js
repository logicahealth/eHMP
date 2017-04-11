define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/lab_results_grid/modal/headerTemplate',
    'app/applets/lab_results_grid/modal/modalView',
    'app/applets/lab_results_grid/appletUiHelpers'
], function(Backbone, Marionette, _, HeaderTemplate, modalView, AppletUiHelpersUndef) {
    'use strict';

    var theView,
        modals = [],
        dataCollection,
        LabModalHeaderView;

    //Modal Navigation Item View
    LabModalHeaderView = Backbone.Marionette.ItemView.extend({
        events: {
            'click #labssPrevious, #labssNext': 'navigateModal',
            'click #smClose': 'closeModal'
        },
        closeModal: function(e) {
            modalView.resetSharedModalDateRangeOptions();
        },
        initialize: function(){
            dataCollection = this.dataCollection;
            this.getModals();
        },
        navigateModal: function(e) {
            var $target = $(e.currentTarget),
                id = $target.attr('id');
            id === 'labssPrevious' ? this.getPrevModal(id) : this.getNextModal(id);
        },

        template: HeaderTemplate,
        getNextModal: function(id) {
            var next = _.indexOf(modals, this.model) + 1;
            if (next >= modals.length) {
                this.getModals();
                next = 0;
            }
            var model = modals[next];
            this.setNextPrevModal(model, id);
        },
        getPrevModal: function(id) {
            var next = _.indexOf(modals, this.model) - 1;
            if (next < 0) {
                this.getModals();
                next = modals.length - 1;
            }
            var model = modals[next];
            this.setNextPrevModal(model, id);
        },
        getModals: function() {
            modals = [];
            _.each(dataCollection.models, function(m, key) {

                if (m.get('labs')) {
                    var outterIndex = dataCollection.indexOf(m);
                    _.each(m.get('labs').models, function(m2, key) {
                        m2.set({
                            'inAPanel': true,
                            'parentIndex': outterIndex,
                            'parentModel': m
                        });
                        modals.push(m2);

                    });
                } else {
                    modals.push(m);
                }

            });
        },
        setNextPrevModal: function(model, id) {

            if (this.showNavHeader) {
                model.attributes.navHeader = true;
            }
            if (model.get('inAPanel')) {
                var tr = $('#data-grid-' + this.appletOptions.instanceId + ' > tbody>tr.selectable').eq(model.get('parentIndex'));
                if (!tr.data('isOpen')) {
                    tr.trigger('click');
                }
                $('#data-grid-' + this.appletOptions.instanceId + ' > tbody>tr.selectable').not(tr).each(function() {
                    var $this = $(this);
                    if ($this.data('isOpen')) {
                        $this.trigger('click');
                    }

                });

            }

            var AppletUiHelper = require('app/applets/lab_results_grid/appletUiHelpers');
            AppletUiHelper.getDetailView(model, null, this.appletOptions, true, AppletUiHelper.showModal, AppletUiHelper.showErrorModal, id);
        }

    });
    return LabModalHeaderView;

});
