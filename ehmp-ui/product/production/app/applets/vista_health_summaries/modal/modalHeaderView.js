define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/vista_health_summaries/modal/headerTemplate',
    'app/applets/vista_health_summaries/modal/modalView',
    'app/applets/vista_health_summaries/appletUiHelpers'
], function(Backbone, Marionette, _, HeaderTemplate, ModalView, AppletUiHelpersUndef) {
    'use strict';

    var theView,
        modals = [],
        dataCollection;

    //Modal Navigation Item View
    var ModalHeaderView = Backbone.Marionette.ItemView.extend({
        events: {
            'click #vhsPrevious, #vhsNext': 'navigateModal'
        },
        initialize: function(){
            dataCollection = this.dataCollection;

            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            this.model.set('fullName', currentPatient.get('fullName'));
            this.model.set('birthDate', currentPatient.get('birthDate'));
            this.model.set('genderName', currentPatient.get('genderName'));
            this.model.set('ssn', currentPatient.get('ssn'));

            // disable prev/next buttons by group
            if (this.nextButtonDisable) {
                this.model.attributes.nextButtonDisable = 'disabled';
            } else {
                this.model.attributes.nextButtonDisable = '';
            }
            if (this.prevButtonDisable) {
                this.model.attributes.prevButtonDisable = 'disabled';
            } else {
                this.model.attributes.prevButtonDisable = '';
            }

            this.getModals();
        },
        navigateModal: function(e) {
            var $target = $(e.currentTarget),
                id = $target.attr('id');

            id === 'vhsPrevious' ? this.getPrevModal(id) : this.getNextModal(id);
        },

        template: HeaderTemplate,
        getNextModal: function(clickedBtn) {
            var next = _.indexOf(modals, this.model) + 1;
            if (next >= modals.length) {
                this.getModals();
                next = 0;
            }
            var model = modals[next];
            this.setNextPrevModal(model, clickedBtn);

        },
        getPrevModal: function(clickedBtn) {

            var next = _.indexOf(modals, this.model) - 1;
            if (next < 0) {
                this.getModals();
                next = modals.length - 1;
            }
            var model = modals[next];

            this.setNextPrevModal(model, clickedBtn);

        },
        getModals: function() {
            modals = [];
            _.each(dataCollection.models, function(m, key) {
                modals.push(m);
            });
        },
        setNextPrevModal: function(model, clickedBtn) {

            if (this.showNavHeader) {
                model.attributes.navHeader = true;
            }

            var AppletUiHelper = require('app/applets/vista_health_summaries/appletUiHelpers');
            AppletUiHelper.getDetailView(model, null, dataCollection, true, AppletUiHelper.showModal, clickedBtn);
        }

    });
    return ModalHeaderView;

});
