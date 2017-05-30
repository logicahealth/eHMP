define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars"
], function(
    Backbone,
    Marionette,
    _,
    Handlebars
) {
    'use strict';

    var ConfirmationErrorView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile(
            '<div class="confirmHeader">' +
            '<button type="button" class="close btn btn-icon btn-xs left-margin-sm" data-dismiss="modal" title="Press enter to close.">' +
            '<i class="fa fa-times fa-lg"></i>' +
            '</button>' +
            '</div>' +
            '<div class="fixedHeightZone"></div>'
        ),
        regions: {
            errorRegion: '.fixedHeightZone'
        },
        onBeforeShow: function() {
            this.errorRegion.show(new ADK.UI.Error({
                headingLevel: 2,
                model: new Backbone.Model(_.defaults((_.isEmpty(_.omit(this.options, 'message')) ? {} : {
                    error: this.options
                }), this.options))
            }));
        }
    });
    return ConfirmationErrorView;
});
