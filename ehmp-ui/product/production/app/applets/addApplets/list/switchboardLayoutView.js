define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/addApplets/templates/switchboardTemplate'
], function(_, Backbone, Marionette, Handlebars, switchboardTemplate) {
    'use strict';

    var LEFT_BUFFER_PIXELS = 10;
    var MAX_COLUMN_FOR_LEFT_OVERFLOW = 3;


    var TitleView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{title}} - SELECT A VIEW'),
        tagName: 'h5',
        className: 'top-padding-no bottom-padding-no',
        serializeData: function() {
            return {
                title: this.getOption('title')
            };
        }
    });


    return Backbone.Marionette.LayoutView.extend({
        template: switchboardTemplate,

        className: 'view-switchboard',

        regions: {
            viewOptionsRegion: '.options-list',
            titleRegion: '.applet-title-switchboard'
        },

        ui: {
            exitButton: '.applet-exit-options-button'
        },
        events: {
            'click @ui.exitButton': 'closeSwitchboard'
        },

        onBeforeShow: function() {
            var isClosable = this.getOption('isCloseable');
            if (isClosable) {
                this.ui.exitButton.removeClass('hide');
            }
            this.switchboardOptions = this._configFactory();
            var viewOptionsButtons = ADK.Messaging.request('switchboard : display', this.switchboardOptions );
            this.viewOptionsRegion.show(viewOptionsButtons);
            this.titleRegion.show(new TitleView({
                title: this.switchboardOptions.appletTitle
            }));
        },

        onShow: function() {
            this.$('button.options-box:first').focus();
        },

        onAttach: function() {
            var parent = this.$el.parent();
            var col = parent.attr('data-col');
            col = parseInt(col);
            if (col <= MAX_COLUMN_FOR_LEFT_OVERFLOW) {
                var width = this.$el.width();
                this.$el.css('left', Math.ceil(width / 2) + LEFT_BUFFER_PIXELS);
            }
        },

        /**
         * This is a hack, we are stealing the events from the ADK and sneaking in one of
         * our own.  Then triggering an event down to the place we really wanted it.
         * @param event
         * @private
         */
        _handleSwitchBoardSelect: function(event) {
            var buttonAttributes = _.get(event, 'currentTarget.attributes', {});
            if (_.isFunction(buttonAttributes.getNamedItem)) {
                var buttonType = buttonAttributes.getNamedItem('data-viewType').value;
                var parent = this.getOption('parent');
                parent.onSwitchBoardSelect(buttonType);
                return;

            }
            console.error('Unknown view type selected');
        },

        /**
         * This is dirty and potentially confusing trick, and should be removed if
         * the ADK OptionSelect View is ever changed to be more Marionette compatible
         * @return {{region: *, appletId, switchOnClick: boolean, appletTitle, appletConfig: {id, instanceId}, events: events}}
         * @private
         */
        _configFactory: function() {
            var onSelect = this._handleSwitchBoardSelect.bind(this);
            return {
                region: this.getOption('region'),
                appletId: this.model.get('id'),
                switchOnClick: false,
                appletTitle: this.model.get('title'),
                currentVew: this.getOption('parent'),
                appletConfig: {
                    id: this.model.get('id'),
                    instanceId: this.model.get('region')
                },
                events: function() {
                    var orig = this.constructor.prototype.events;
                    return _.extend({}, orig, {
                        'click button.options-box': onSelect
                    });
                }
            };
        },

        closeSwitchboard: function() {
            var viewButton = this.$('[data-viewtype=' + this.model.get('viewType') + ']');
            if(viewButton.length) {
                viewButton.click();
            }
        },

        onBeforeDestroy: function() {
            this.switchboardOptions.events = null;
            this.switchboardOptions = null;
            this.options = null;
        }
    });
});