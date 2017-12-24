define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/workspaceManager/list/PreviewWorkspaceView',
    'app/applets/workspaceManager/list/row_cells/customizeButton'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    PreviewWorkspaceView,
    CustomizeButton
) {
    'use strict';
    var PreviewButton = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<button type="button" class="previewWorkspace btn btn-sm btn-icon" title="{{getTitle}}" aria-label="{{getAriaLabel}}" {{#if isEnabled}}{{else}}disabled aria-hidden="true" size="sm"{{/if}}>Preview</button>'),
        templateHelpers: function() {
            var emptyWorkspaceMessage = 'Unable to preview an empty workspace';
            return {
                isEnabled: this.model.get('hasApplets'),
                getTitle: function() {
                    if(!this.isEnabled) return emptyWorkspaceMessage;
                },
                getAriaLabel: function() {
                    return this.isEnabled ? 'Preview ' + (this.title || 'this workspace') : emptyWorkspaceMessage;
                }
            };
        },
        events: {
            'click button': 'showPreview'
        },
        showPreview: function() {
            var title = this.model.get('title');
            var PreviewBody = PreviewWorkspaceView.extend({
                screenId: this.model.get('id'),
                screenTitle: title
            });
            var isEditable = !(!!this.model.get('predefined'));
            var PreviewFooter = Backbone.Marionette.LayoutView.extend({
                workspaceModel: this.model,
                template: Handlebars.compile([
                    isEditable ? '<div class="customize-button-region inline-display"></div>' : '',
                    '<div class="inline-display">',
                    '{{ui-button "Close" classes="btn-primary btn-sm close-button"}}',
                    '</div>'
                ].join('\n')),
                events: {
                    'click .close-button': function() {
                        ADK.UI.Alert.hide();
                    }
                },
                regions: {
                    CustomizeButtonRegion: '.customize-button-region'
                },
                onRender: function() {
                    if (this.getOption('isEditable')) {
                        var PreviewCustomizeButton = CustomizeButton.extend({
                            className: 'inline-display',
                            template: Handlebars.compile('{{ui-button "Customize" classes="btn-primary btn-sm customize-screen" title=getTitle}}'),
                            events: {
                                'click .customize-screen': function() {
                                    ADK.UI.Alert.hide();
                                    this.customizeWorkspace.apply(this, arguments);
                                }
                            }
                        });
                        this.showChildView('CustomizeButtonRegion', new PreviewCustomizeButton({
                            model: this.getOption('workspaceModel')
                        }));
                    }
                },
                isEditable: isEditable
            });
            var alertView = new ADK.UI.Alert({
                title: title,
                icon: "",
                messageView: PreviewBody,
                footerView: PreviewFooter
            });
            alertView.show();
            alertView.$('button').focus();
        }
    });
    return PreviewButton;
});
