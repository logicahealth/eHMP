define([
    'backbone',
    'jquery',
    'underscore',
    'handlebars',
    'gridster',
    'api/Messaging',
    'api/UserDefinedScreens',
    'main/api/WorkspaceFilters',
    'api/ResourceService',
    'api/SessionStorage',
    'main/components/views/appletViews/TileSortManager'
], function(Backbone, $, _, Handlebars, Gridster, Messaging, UserDefinedScreens, WorkspaceFilters, ResourceService, SessionStorage, TileSortManager) {
    'use strict';

    function saveGridsterAppletsConfig(callback) {
        var $gridsterEl = $(".gridster");
        if ($('#gridster2').length)
            $gridsterEl = $('#gridster2');
        var screen = Messaging.request('get:current:screen').id;
        var appletsConfig = UserDefinedScreens.serializeGridsterScreen($gridsterEl, screen);
        if (callback)
            UserDefinedScreens.saveGridsterConfig(appletsConfig, screen, callback);
        else
            UserDefinedScreens.saveGridsterConfig(appletsConfig, screen);
    }


    function getViewTypeDisplay(type) {
        //'trend' views were originally called 'gist' view.
        //The name displayed in the UI was changed to 'trend' on 2/25/2015
        //However, currently (as of 2/25/2015) all other references are still to the 'gist' view
        if (type === "gist") {
            return "trend";
        } else {
            return type;
        }
    }

    function removeNonStandardViews(collection) {
        var filteredCollection = collection;
        _.each(filteredCollection.models, function(model) {
            if (model.get('type') !== 'gist' && model.get('type') !== 'trend' && model.get('type') !== 'summary' && model.get('type') !== 'expanded') {
                filteredCollection.remove(model);
            }
        });
        return filteredCollection;
    }

    var NoSwitchView = Backbone.Marionette.ItemView;

    var SingleViewType = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'viewType-optionsBox col-xs-3 text-center',
        initialize: function() {
            var displayType = getViewTypeDisplay(this.model.get('type'));
            this.template = Handlebars.compile('<button type="button" aria-label="Press enter to select ' + displayType + ' view." class="btn btn-icon options-box {{type}}" data-viewtype="{{type}}"></button><p class="top-margin-xs">' + _.capitalize(displayType) + ' View</p>');

            var offset = this.model.get('paddingOffset');
            if (offset !== 0 && !_.isUndefined(offset)) {
                this.$el.addClass("col-xs-offset-" + offset);
            }
        }
    });

    var OptionsSelectionView = Backbone.Marionette.CollectionView.extend({
        initialize: function(options) {
            this.appletController = options.appletController;

            this.displayRegion = options.region;
            if (options.appletChrome) {
                this.appletChrome = options.appletChrome;
            }
            this.containerRegion = this.options.containerRegion || this.displayRegion;
            this.appletConfig = options.appletConfig;
            this.appletId = options.appletId;
            this.workspaceId = Messaging.request('get:current:screen').config.id;
            this.onChangeView = options.onChangeView;
            if (options.switchOnClick === undefined) {
                this.switchOnClick = true;
            } else {
                this.switchOnClick = options.switchOnClick;
            }
            if (options.appletTitle !== undefined) {
                this.appletTitle = options.appletTitle;
            }

            this.collection = new Backbone.Collection(Messaging.getChannel(this.appletId).request('viewTypes'));
            this.collection = removeNonStandardViews(this.collection);
            this.collection.comparator = function(model) {
                var type = model.get('type');
                var orderNum;
                switch (type.toLowerCase()) {
                    case 'gist':
                        orderNum = 1;
                        break;
                    case 'trend':
                        orderNum = 1;
                        break;
                    case 'summary':
                        orderNum = 2;
                        break;
                    case 'expanded':
                        orderNum = 3;
                        break;
                    default:
                        orderNum = 10;
                }
                return orderNum;
            };
            this.collection.sort();

            switch (this.collection.length) {
                case 1:
                    this.collection.models[0].set('paddingOffset', 3);
                    break;
                case 2:
                    this.collection.models[0].set('paddingOffset', 1);
                    break;
                default:
                    this.collection.models[0].set('paddingOffset', 0);
            }
        },
        events: {
            'click .viewType-optionsBox': 'changeView',
            'click .remove-applet-option-box': 'removeApplet'
        },
        removeApplet: function() {
            var self = this;
            var gridster = this.returnGridster();

            this.$el.parent().html('');

            var removeAllGraphs = function() {

                //if no stacked graph for this applet, do nothing
                if (!UserDefinedScreens.hasStackedGraphForApplet(self.workspaceId, self.appletConfig.instanceId))
                    return;
                var fetchOptions = {
                    resourceTitle: 'user-defined-stack-all',
                    fetchType: 'DELETE',
                    criteria: {
                        id: self.workspaceId,
                        instanceId: self.appletConfig.instanceId
                    }
                };
                ResourceService.fetchCollection(fetchOptions);
                ADK.UserDefinedScreens.removeAllStackedGraphFromSession(self.workspaceId, self.appletConfig.instanceId);
            };

            //remove region from gridster
            if (gridster !== null && gridster !== undefined) { //this if is just for the screens that aren't gridster
                gridster.remove_widget($(this.containerRegion.el), function() {
                    saveGridsterAppletsConfig(function() {
                        //Remove persisted graphed items from JDS for stack graph applet
                        if (self.appletConfig.id === 'stackedGraph') {
                            removeAllGraphs();
                        } else {
                            var instanceId = self.appletConfig.instanceId + '_' + self.appletId;
                            TileSortManager.removeSort(instanceId, function() {
                                WorkspaceFilters.removeAllFiltersFromApplet(self.workspaceId, self.appletConfig.instanceId);
                            });
                        }
                    });
                });
            }
            if (self.onChangeView) {
                self.onChangeView();
            }

            SessionStorage.clearAppletStorageModel(this.appletConfig.instanceId);
            SessionStorage.clearAppletStorageModel(this.appletConfig.id);
            this.options.region.$el.closest(".workspace-editor-container").find('button:first').focus();
        },
        returnGridster: function() {
            if (this.switchOnClick) {
                return $('.gridster').data('gridster');
            }
            return $('#gridster2 ul').gridster().data('gridster');
        },
        changeView: function(e) {
            var gridster = this.returnGridster();
            var self = this;
            var viewType = $(e.currentTarget).find(".options-box").attr('data-viewtype');
            var model = this.collection.find(function(model) {
                return model.get('type') == viewType;
            });
            if (this.switchOnClick) {
                this.appletController.changeView(viewType);
                $(this.displayRegion.el).attr('data-view-type', viewType);
            } else {
                var displayType = getViewTypeDisplay(model.get('type'));
                var appletHtml = '<button type="button" aria-label="Press enter to open view options." class="btn btn-icon edit-applet applet-options-button"><i class="fa fa-cog"></i></button><br><h5 class="applet-title all-margin-no all-padding-no">' + this.appletTitle + '</h5><span class="right-padding-lg">' + _.capitalize(displayType) + '</span>';
                appletHtml += '<span class="gs-resize-handle gs-resize-handle-both"></span><span class="gs-resize-handle gs-resize-handle-both"></span>';
                NoSwitchView = NoSwitchView.extend({
                    template: _.template(appletHtml)
                });
                this.displayRegion.show(new NoSwitchView());
            }
            var callback = function() {
                if (self.onChangeView) {
                    self.onChangeView();
                }
                gridster.arrange_widgets_no_vertical_clipping(gridster.$widgets.toArray());
                saveGridsterAppletsConfig();
            };
            $(this.containerRegion.el).attr('data-view-type', viewType);

            var containerElement = this.containerRegion.$el;

            var maxSize = ADK.utils.getViewTypeMaxSize(viewType);
            var minSize = ADK.utils.getViewTypeMinSize(viewType);
            var size = ADK.utils.getViewTypeSize(viewType);
            gridster.resize_widget(containerElement, size.x, size.y, callback);
            gridster.set_widget_max_size(containerElement, [maxSize.x, maxSize.y]);
            gridster.set_widget_min_size(containerElement, [minSize.x, minSize.y]);
            this.forceInlineWidgetBounds(containerElement, minSize, maxSize); // Because Gridster doesn't do this on its own

            containerElement.find('.applet-options-button').focus();
        },
        addLi: function(collectionView, buffer, options) {
            collectionView.$el.append(buffer).append('<li class="col-xs-' + options.width + ' ' + options.divClass + '-box text-center"><button type="button" aria-label="Press enter to remove applet." class="btn btn-icon options-box ' + options.divClass + '" data-viewtype="' + options.dataViewType + '"><i class="' + options.iconClass + '"></i></button><p>' + options.buttonText + '</p></li>');
        },
        forceInlineWidgetBounds: function($widget, minSize, maxSize) {
            $widget.data('minSizex', minSize.x).attr('data-min-sizex', minSize.x);
            $widget.data('minSizey', minSize.y).attr('data-min-sizey', minSize.y);
            $widget.data('maxSizex', maxSize.x).attr('data-max-sizex', maxSize.x);
            $widget.data('maxSizey', maxSize.y).attr('data-max-sizey', maxSize.y);
        },
        attachBuffer: function(collectionView, buffer) {
            this.addLi(collectionView, buffer, {
                width: 2,
                divClass: 'remove-applet-option',
                dataViewType: 'removeApplet',
                iconClass: 'fa fa-trash-o fa-lg',
                buttonText: 'Remove'
            });
        },
        tagName: 'ul',
        className: 'options-panel col-xs-12 background-color-pure-white',
        onRender: function() {},
        childView: SingleViewType
    });

    Messaging.reply('switchboard : display', function(options) {
        return new OptionsSelectionView(options);
    });
    return OptionsSelectionView;

});