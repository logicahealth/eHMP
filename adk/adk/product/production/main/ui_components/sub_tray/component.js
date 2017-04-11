define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
    'main/ui_components/tray/component'
], function(Backbone, Marionette, $, _, Handlebars, Messaging, TrayComponent) {
    'use strict';

    var SubTrayView = TrayComponent.extend({
        _eventPrefix: 'subTray',
        template: Handlebars.compile([
            '<button type="button" id={{tray_id}} class="btn btn-default{{#if buttonClass}} {{buttonClass}}{{/if}}" data-toggle="sidebar-subTray" title="Press enter to activate menu" aria-expanded="false">{{#if iconClass}}<i class="{{iconClass}}" aria-hidden="true"></i> {{/if}}{{buttonLabel}}</button>',
            '<div role="region" class="sidebar-tray sidebar-sub-tray {{position}}" aria-labelledby="{{tray_id}}" aria-hidden="true" tabindex="-1"/>'
        ].join('\r\n')),
        className: 'sidebar inline-display',
        ui: {
            'ButtonContainer': '[data-toggle=sidebar-subTray]',
            'TrayContainer': '.sidebar-sub-tray'
        },
        regions: {
            'TrayRegion': '@ui.TrayContainer',
            'ButtonRegion': '@ui.ButtonContainer'
        },
        onEndOfInitialize: function() {
            this._maxHeight = this.getOption('maxHeight') || null;
            this._additionalTopPadding = this.getOption('additionalTopPadding') || 0;
            this.listenTo(Messaging, 'tray.closed', function(closedTrayId) {
                if (this.isOpen()) {
                    this.close(this, true);
                    this.listenTo(Messaging, 'tray.opened', function(openedTrayId) {
                        if (_.isEqual(closedTrayId, openedTrayId)) {
                            this.stopListening(Messaging, 'tray.opened');
                            this.open(null, true);
                        }
                    });
                }
            });
        },
        resetBounds: function() {
            //getBoundingClientRect is supposedly much faster than offset but it's read only hence why we need to clone it
            if (this.options.viewport) {
                this.containerBounds = _.pick($(this.options.viewport)[0].getBoundingClientRect(), ['bottom', 'height', 'left', 'right', 'top', 'width']);
            } else {
                //if viewport isn't specified, extend the tray from the bottom of the button to the bottom of the center region
                this.containerBounds = _.pick($('#center-region')[0].getBoundingClientRect(), ['bottom', 'height', 'left', 'right', 'top', 'width']);
            }
            var buttonBounds = this.ui.ButtonContainer[0].getBoundingClientRect(),
                ext = {
                    top: buttonBounds.top,
                    height: this.containerBounds.bottom - buttonBounds.bottom
                };
            _.extend(this.containerBounds, ext);
        },
        resetContainerPosition: function() {
            this.ui.TrayContainer.offset({
                top: this.containerBounds.top - this._additionalTopPadding
            }).css('max-height', this._maxHeight || this.containerBounds.height + 'px').width();
        }
    });

    return SubTrayView;
});