define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/lab_results_grid/details/singleLabResultTemplateForPanelExtendedRow",
    "app/applets/lab_results_grid/appletUiHelpers"
], function(Backbone, Marionette, _, rowTemplate, AppletUiHelper) {
    "use strict";

    return Backbone.Marionette.LayoutView.extend({
        tagName: "tr",
        AppletID: 'lab_results_grid',
        behaviors: {
            FloatingToolbar: {
                DialogContainer: '.toolbar-container',
                buttonTypes: ['infobutton', 'detailsviewbutton', 'notesobjectbutton'],
            }
        },
        attributes: {
            'tabindex': '0'
        },
        initialize: function(options) {
            var listen = ADK.Messaging.getChannel('lab_results');
            this.gridCollection = listen.request('gridCollection');
            this.model.set('isFullscreen', options.isFullscreen);
            this.model.set('applet_id', this.AppletID);
            ADK.utils.crsUtil.applyConceptCodeId(this.model);
            this.$el.attr('data-code', this.model.get('dataCode'));
        },
        template: rowTemplate,
        events: {
            'before:showtoolbar': function() {
                this.listenTo(ADK.Messaging.getChannel(this.AppletID), 'detailView', this.displayModal);
            },
            'before:hidetoolbar': function() {
                this.stopListening(ADK.Messaging.getChannel(this.AppletID), 'detailView');
            }
        },
        displayModal: function(e) {
            if (e.model !== this.model) return;
            if (!this.model.get('pathology')) {
                AppletUiHelper.getDetailView(this.model, this.el, this.gridCollection, true, AppletUiHelper.showModal, AppletUiHelper.showErrorModal);
            } else {
                var uid = this.model.get('results')[0].resultUid;
                var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                ADK.Messaging.getChannel(this.AppletID).trigger('resultClicked', {
                    uid: uid,
                    patient: {
                        icn: currentPatient.attributes.icn,
                        pid: currentPatient.attributes.pid
                    }
                });
            }
        }
    });
});