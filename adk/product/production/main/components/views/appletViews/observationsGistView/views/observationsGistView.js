define('main/components/views/appletViews/observationsGistView/views/observationsGistView', [
    "jquery",
    "underscore",
    "backbone",
    "main/Utils",
    "hbs!main/components/views/appletViews/observationsGistView/templates/observationsGistLayout",
    "hbs!main/components/views/appletViews/observationsGistView/templates/observationsGistChild",
    "hbs!main/components/views/appletViews/sharedTemplates/gistPopover",
    "api/ResourceService",
    "api/Messaging",
    "main/components/appletToolbar/appletToolbarView",
    "main/components/views/appletViews/TileSortManager",
    "main/components/applets/baseDisplayApplet/baseDisplayAppletItem",
    "main/components/applets/baseDisplayApplet/baseGistView",
    '_assets/js/tooltipMappings'
], function($, _, Backbone, Utils, observationsGistLayoutTemplate, observationsGistChildTemplate, popoverTemplate, ResourceService, Messaging, ToolbarView, TileSortManager, BaseAppletItem, BaseGistView, TooltipMappings) {
    'use strict';

    var ObservationsGistItem = BaseAppletItem.extend({
        template: observationsGistChildTemplate,
        disableNoRecordClick: function() {
            var gistItem = this.$el;
            if (gistItem.find('.no-record').length > 0) {
                //remove the selectable class if no-record
                gistItem.find('.selectable').removeClass('selectable');
                //remove the tooltip if no-record (this is a workaround till the toolbar will be able to disable buttons)
                gistItem.find('[data-toggle]').removeAttr('data-toggle').removeAttr('data-content');
            }
        },
        onRender: function() {
            this.disableNoRecordClick();
        },
        initialize: function(options) {
            var buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton'];
            if (options.AppletID === 'lab_results_grid' || options.AppletID === 'applet-5'){
                buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton', 'notesobjectbutton'];
            }

            if (!Messaging.request('get:current:screen').config.predefined) {
                buttonTypes.unshift('tilesortbutton');
            }

            var toolbarButtonsDisabled = this.model.get('resultUnitsMetricResultUnits') === 'No Records Found';
            this.toolbarOptions = {
                buttonTypes: buttonTypes,
                quickLooksDisabled: toolbarButtonsDisabled,
                detailsViewDisabled: toolbarButtonsDisabled
            };
            if (this.model.get('displayName')) {
                this.$el.attr('data-row-instanceid', this.model.get('displayName'));
            }
            this.model.set('uniqueName', this.model.get('displayName')+'-'+this.cid);
        },
        onDomRefresh: function() {
            this.$('svg.gist-trend-graph').attr('focusable', 'false');
            this.$('svg.gist-trend-graph').attr('aria-hidden', 'true');
        }
    });

    var ObservationsGist = BaseGistView.extend({
        template: observationsGistLayoutTemplate,
        childView: ObservationsGistItem,
        className: 'faux-table-container',
        events: {
            'after:hidetoolbar': function(e) {
                this.$el.find('.dragging-row').removeClass('dragging-row');
            }
        },
        attributes: function(){
            var gridTitle = '';
            if(this.options) {
                gridTitle = this.options.appletConfig.title + ' Grid';
            }
            return {
                'role': 'grid',
                'aria-label': gridTitle
            };
        },
        initialize: function(options) {
            this.childViewOptions = {
                AppletID: this.AppletID,
                collection: options.collection,
                appletOptions: options
            };
            this.gistModel = options.gistModel;
            this.collectionParser = options.collectionParser || function(collection) {
                return collection;
            };

            this.collection = options.collection;

            //this is the model for the outer part of the composite view
            this.model = new Backbone.Model();
            this.model.set('gistHeaders', options.gistHeaders);
            this.model.set('AppletID', this.AppletID);
            this.childViewContainer = ".gist-item-list";
        },
        onRender: function(){
            _.each(this.$('.toolbar-508'), function(span) {
                var tooltipKey = span.innerHTML;
                span.innerHTML = '( ' + TooltipMappings[tooltipKey] + ' )';
            });
        }
    });

    var ObservationsGistView = {
        create: function(options) {
            var observationsGistView = new ObservationsGist(options);
            return observationsGistView;
        },
        getView: function() {
            return ObservationsGist;
        }
    };

    return ObservationsGistView;
});