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
        behaviors: {
            FloatingToolbar: {
                DialogContainer: '.toolbar-container',
                buttonTypes: ['infobutton', 'detailsviewbutton', 'notesobjectbutton']
            }
        },
        attributes: function() {
            return {
                'data-code': this.model.get('dataCode'),
                'tabindex': '0'
            };
        },
        template: rowTemplate,
        events: {
            'before:showtoolbar': function () {
                this.listenTo(ADK.Messaging.getChannel(this.AppletID), 'detailView');
            },
            'before:hidetoolbar': function () {
                this.stopListening(ADK.Messaging.getChannel(this.AppletID), 'detailView');
            }
        },
        initialize: function (options) {
            this.model.set('isFullscreen', options.isFullscreen);
            this.model.set('applet_id', this.AppletID);
            ADK.utils.crsUtil.applyConceptCodeId(this.model);
        },
        serializeModel: function() {
            return Utils.prepareNonPanelForRender(this.model);
        }
    });
});