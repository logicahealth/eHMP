define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'main/Utils'
], function(Backbone, Marionette, Handlebars, _, Utils) {
    "use strict";

    var HelpIconButton = Backbone.Marionette.ItemView.extend({
        behaviors: {
            Tooltip: {}
        },
        modelEvents: {
            'change:url': 'render'
        },
        events: {
            'click': function(event) {
                event.preventDefault();
                Utils.helpUtils.popupCenter(this.model.get('url'), 'helpIconUniqueWindow', '715', '300');
            }
        },
        tagName: 'button',
        className: function() {
            var buttonOptions = this.getOption('buttonOptions') || {};
            var fontSizeClass = (_.isString(_.get(buttonOptions, 'fontSize')) || _.isNumber(_.get(buttonOptions, 'fontSize'))) ?
                ' font-size-' + _.get(buttonOptions, 'fontSize') : '';
            var colorClass = _.isString(_.get(buttonOptions, 'colorClass')) ?
                ' ' + _.get(buttonOptions, 'colorClass') : '';
            var paddingClass = _.isString(_.get(buttonOptions, 'paddingClass')) ?
                ' ' + _.get(buttonOptions, 'paddingClass') : '';
            return 'help-icon-link btn btn-icon' + fontSizeClass + colorClass + paddingClass;
        },
        id: function() {
            return 'ehmp' + this.cid;
        },
        attributes: function() {
            var buttonOptions = this.getOption('buttonOptions') || {};
            return {
                target: "helpIconUniqueWindow",
                role: "link",
                href: this.model.get('url'),
                title: _.isString(_.get(buttonOptions, 'title')) ? _.get(buttonOptions, 'title') : 'Help',
                'aria-label': 'Access Help content. External link.',
                'data-toggle': 'tooltip'
            };
        },
        templateHelpers: function() {
            var self = this;
            return {
                getIcon: function() {
                    return _.get((self.getOption('buttonOptions') || {}), 'icon') || 'fa-question';
                }
            };
        },
        template: Handlebars.compile('<i class="fa {{getIcon}} fa-lg"></i>') //add icon option support
    });

    var HelpLinkBehavior = Backbone.Marionette.Behavior.extend({
        events: {
            'update:help:mapping': function(event, newHelpMapping) {
                this.options.mapping = newHelpMapping;
                this.cleanUpNewRegion();
                this.setUrlModel(newHelpMapping);
                this.showHelpIconButton();
            },
            'update:help:url': function(event, newHelpUrl) {
                this.options.url = newHelpUrl;
                this.cleanUpNewRegion();
                this.setUrlModel(newHelpUrl);
                this.showHelpIconButton();
            },
            'update:help:button:options': function(event, newButtonOptions) {
                this.options.buttonOptions = _.isObject(newButtonOptions) ? newButtonOptions : this.options.buttonOptions;
                this.cleanUpNewRegion();
                this.showHelpIconButton();
            }
        },
        initialize: function() {
            this.urlModel = new Backbone.Model();
            this._helpIconRegionManager = new Backbone.Marionette.RegionManager();
        },
        showHelpIconButton: function() {
            var hasUrlMapping = (_.isString(this.getOption('url')) && this.getOption('url').length > 0) ||
                (_.isString(this.getOption('mapping')) && this.getOption('mapping').length > 0);
            if (!hasUrlMapping || (_.isString(this.getOption('mapping')) && !Utils.helpUtils.mappingExist(this.getOption('mapping')))) {
                console.warn('HelpLink Behavior: No URL or Mapping found: "' + (this.getOption('url') || this.getOption('mapping')) + '"');
                return;
            }
            var containerSelector = this.getOption('container');
            // default to appending to $el
            this.$container = _.isString(containerSelector) ? this.$(containerSelector) : this.$el;
            if (this.$container instanceof jQuery && this.$container.length > 0) {
                this.$container.append('<span class="help-icon-button-container"></span>');
                var HelpButtonRegion = Backbone.Marionette.Region.extend({
                    el: this.$container.find('.help-icon-button-container')
                });
                // find out default (would take to top of help page)
                this.setUrlModel();
                this._helpIconRegionManager.addRegions({
                    'helpIconButton': HelpButtonRegion
                });
                this._helpIconRegionManager.get('helpIconButton').show(new HelpIconButton({
                    model: this.urlModel,
                    buttonOptions: this.getOption('buttonOptions')
                }));
            } else {
                console.warn('HelpLink Behavior: Not valid jquery selector', containerSelector, this.getOption('mapping'));
            }
        },
        setUrlModel: function(newHelpString) {
            var url = this.getOption('url') || Utils.helpUtils.getUrl(this.getOption('mapping'));
            this.urlModel.set('url', url);
        },
        onBeforeShow: function() {
            this.showHelpIconButton();
        },
        onDomRefresh: function() {
            this.cleanUpNewRegion();
            this.showHelpIconButton();
        },
        onBeforeDestroy: function() {
            this.cleanUpNewRegion();
        },
        cleanUpNewRegion: function() {
            if (this._helpIconRegionManager && this._helpIconRegionManager.get('helpIconButton')) {
                this._helpIconRegionManager.removeRegion('helpIconButton');
            }
            if (this.$container && this.$container.children('.help-icon-button-container').length > 0) {
                this.$container.children('.help-icon-button-container').remove();
            }
        }
    });

    return HelpLinkBehavior;
});
