/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/lab_results_grid/details/singleLabResultTemplateForPanelExtendedRow',
    'app/applets/lab_results_grid/appletHelpers'
], function (Backbone, Marionette, _, rowTemplate, Utils) {
    'use strict';

    return Backbone.Marionette.LayoutView.extend({
        tagName: 'tr',

        AppletID: 'lab_results_grid',

        tileOptions: {
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'infobutton'
                }, {
                    type: 'detailsviewbutton'
                }, {
                    type: 'notesobjectbutton',
                    shouldShow: function() {
                        return ADK.UserService.hasPermission('add-note') &&
                            ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista();
                    }
                }]
            }
        },

        behaviors: {
            QuickMenu: {}
        },

        events: {
            click: 'onRowClick'
        },

        attributes: function() {
            return {
                'data-code': this.model.get('dataCode')
            };
        },

        template: rowTemplate,

        initialize: function (options) {
            this.model.set('isFullscreen', options.isFullscreen);
            this.model.set('applet_id', this.AppletID);
            ADK.utils.crsUtil.applyConceptCodeId(this.model);
        },

        serializeModel: function() {
            return Utils.prepareNonPanelForRender(this.model);
        },

        onRowClick: function() {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var $el = this.$el.find('.dropdown--quickmenu > button');

            var channelObject = {
                model: this.model,
                collection: this.collection || this.model.collection,
                uid: this.model.get('uid'),
                patient: currentPatient.toJSON(),
                $el: $el
            };

            ADK.Messaging.getChannel(this.model.get('applet_id')).trigger('detailView', channelObject);
        }
    });
});