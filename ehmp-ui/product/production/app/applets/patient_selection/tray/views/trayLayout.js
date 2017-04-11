define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "hbs!app/applets/patient_selection/tray/templates/trayLayout"
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    TrayLayoutTemplate
) {
    "use strict";

    var HeaderView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '<div data-flex-width="1" class="header-title-container">',
            '<h4 class="panel-title">{{searchType}}</h4>',
            '</div>',
            '<div class="header-help-button-container top-padding-xs flex-width-none"></div>',
            '<button type="button" class="btn btn-icon btn-xs left-margin-xs close-tray color-pure-white" title="Press enter to close."><i class="fa fa-times fa-lg" aria-hidden="true"></i></button>'
        ].join('\n')),
        behaviors: function() {
            return {
                FlexContainer: {
                    direction: 'row'
                },
                HelpLink: {
                    container: '.header-help-button-container',
                    mapping: this.getOption('helpMapping'),
                    buttonOptions: {
                        colorClass: 'bgc-primary-dark'
                    }
                }
            };
        },
        className: 'left-padding-sm right-padding-sm',
        events: {
            'click button.close-tray': function() {
                this.$el.trigger('patientSearchTray.hide');
            }
        }
    });

    var patientHeaderDetailView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            FlexContainer: {
                direction: 'column',
                container: [true, {
                    container: '[data-flex-width="1"]',
                    direction: 'column'
                }]
            }
        },
        template: TrayLayoutTemplate,
        className: 'container-fluid panel panel-default',
        regions: {
            headerRegion: '.header-content-container',
            contentRegion: '.content-container'
        },
        onBeforeShow: function() {
            this.showChildView('headerRegion', new HeaderView({
                model: this.model,
                helpMapping: this.model.get('helpMapping')
            }));
            var SearchView = this.model.get('view');
            if (SearchView) {
                this.showChildView('contentRegion', new SearchView({
                    searchType: this.model.get('searchType')
                }));
            }
        }
    });
    return patientHeaderDetailView;
});