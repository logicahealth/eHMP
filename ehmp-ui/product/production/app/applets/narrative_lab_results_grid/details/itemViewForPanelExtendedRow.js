define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/narrative_lab_results_grid/details/singleLabResultTemplateForPanelExtendedRow",
    "app/applets/narrative_lab_results_grid/appletUiHelpers"
], function(Backbone, Marionette, _, rowTemplate, AppletUiHelper) {
    "use strict";

    return Backbone.Marionette.ItemView.extend({
        tagName: "tr",
        attributes: {
            'tabindex': '0'
        },
        initialize: function(options) {
            var listen = ADK.Messaging.getChannel('narrative_lab_results');
            this.gridCollection = listen.request('gridCollection');
            this.model.set('isFullscreen', options.isFullscreen);
            this.$el.data('model', this.model);
        },
        template: rowTemplate,
        events: {
            'click': 'displayModal',
            'keyup': 'triggerClick'
        },
        triggerClick: function(e) {
            if (e.keyCode === 13) {
                this.$el.trigger('click');
            }
        },
        displayModal: function(e) {

            ADK.utils.infoButtonUtils.onClickFunc(this, e, baseDisplayModal);

            function baseDisplayModal(that, event) {
                var self = that;
                event.preventDefault();
                if (!self.model.get('pathology')) {
                    AppletUiHelper.getDetailView(self.model, event.currentTarget, self.gridCollection, true, AppletUiHelper.showModal, AppletUiHelper.showErrorModal);
                } else {
                    var uid = model.get('results')[0].resultUid;
                    var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                    ADK.Messaging.getChannel("narrative_lab_results_grid").trigger('resultClicked', {
                        uid: uid,
                        patient: {
                            icn: currentPatient.attributes.icn,
                            pid: currentPatient.attributes.pid
                        }
                    });
                }
            }

        }
    });
});