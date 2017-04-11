define([
    'underscore',
    'backbone',
    'marionette',
    'hbs!app/applets/addApplets/list/appletEditor',
    'app/applets/addApplets/list/appletSelectionSlider',
    'app/applets/addApplets/list/switchboardLayoutView',
    'gridster'
], function(_, Backbone, Marionette, appletEditor, AppletSelectionSlider, SwitchboardLayout, gridster) {

    'use strict';

    var deleteMessageItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '<p>Are you sure you want to delete <strong>{{screenTitle}}?</strong></p>'
        ].join('\n')),
    });
    var deleteFooterItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{ui-button "No" classes="btn-default btn-sm" title="Press enter to go back"}}',
            '{{ui-button "Yes" classes="btn-danger btn-sm" title="Press enter to delete"}}'
        ].join('\n')),
        events: {
            'click .btn-default': function() {
                ADK.UI.Alert.hide();
                this.model.get('buttonEl').focus();
            },
            'click .btn-danger': function() {
                ADK.UI.Alert.hide();
                ADK.UI.FullScreenOverlay.hide();
                ADK.ADKApp.ScreenPassthrough.deleteUserScreen(this.model.get('screenId'));
            }
        }
    });

    var GRIDSTER_CONTAINER_RIGHT_PADDING = 15;

    var isSwitchboardDisplayed = function() {
        var switchboardDiv = $('#gridster2').find($('.view-switchboard'));
        return switchboardDiv.is(':visible');
    };

    var Switchboard = Backbone.Marionette.CollectionView;
    var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
        template: appletEditor,
        appletUnderSwitchboard: '',
        modelEvents: {
            'change:gridsterTemplate': 'render'
        },
        initialize: function() {
            this.gridster = gridster;
            var self = this;
            this.rightmostWidgetGrid = undefined;
            this.hoverRow = undefined;

            // load configs from app.json
            var appConfig = new Backbone.Model();
            appConfig.fetch({
                url: 'app.json',
                async: false
            });
            this.maxMoves = appConfig.get("numMovesBeforeSaveUDSConfig");
            this.gracePeriod = appConfig.get("saveUDSConfigTimeout");
            if (typeof this.maxMoves != 'number') {
                this.maxMoves = 6;
            }
            if (typeof this.gracePeriod != 'number') {
                this.gracePeriod = 5000;
            }

            this.model = new Backbone.Model();
            var screenModule = ADK.ADKApp.Screens[Backbone.history.fragment.split("/").pop(-1)];
            this.lastSave.currentScreenModule = screenModule;
            var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();
            self.screenConfig = _.findWhere(screensConfig.screens, {
                id: screenModule.moduleName
            });
            screenModule.buildPromise.done(function() {
                var deferred = ADK.UserDefinedScreens.getGridsterTemplateForEditor(screenModule);
                deferred.done(function(template) {
                    self.model.set('gridsterTemplate', template);
                });
            });

            var addAppletsChannel = ADK.Messaging.getChannel('addApplets');
            addAppletsChannel.reply('addAppletToGridster', function(params) {
                var appletId = params.appletId;
                var appletTitle = params.appletTitle;
                var regionId = self.getNextAppletId();
                var defaultViewType = ADK.ADKApp.Applets[appletId] && ADK.ADKApp.Applets[appletId].appletConfig && ADK.ADKApp.Applets[appletId].appletConfig.defaultViewType || ADK.Messaging.getChannel(appletId).request('viewTypes')[0].type; // Failover if the default isn't set

                var maxSize = ADK.utils.getViewTypeMaxSize(defaultViewType);
                var minSize = ADK.utils.getViewTypeMinSize(defaultViewType);
                var size = ADK.utils.getViewTypeSize(defaultViewType);
                params.sizeX = size.x; // This overrides the default in the addAppletPlaceholder reply, because we now have enough info to set them to what they should be
                params.sizeY = size.y; //
                var appletHtml = '<li class="new" data-appletid="' + appletId + '" data-instanceid="' + regionId + '" data-view-type="default" data-min-sizex="' + minSize.x + '" data-min-sizey="' + minSize.y + '" data-max-sizex="' + maxSize.x + '" data-max-sizey="' + maxSize.y + '"><button type="button" aria-label="Press enter to open view options." class="btn btn-icon edit-applet applet-options-button"><i class="fa fa-cog"></i></button><br>' + appletTitle + '</li>';

                if (!isSwitchboardDisplayed()) {
                    window.requestAnimationFrame(function() {
                        var x = params.xPos;
                        var y = params.yPos;
                        var col;
                        var row;
                        var gridsterDimen = self.getGridsterDimension();
                        var $dragHere = self.$('.dragHere');
                        if ($dragHere.length !== 0) {
                            self.gridster.remove_widget($dragHere);
                        }
                        self.gridster.add_widget(appletHtml, params.sizeX, params.sizeY, col, row, [maxSize.x, maxSize.y], [minSize.x, minSize.y]);
                        self.displaySwitchboard(appletId, regionId, appletTitle, function() {
                            self.gridster.arrange_widgets_no_vertical_clipping(self.gridster.$widgets.toArray());
                            setTimeout(function() {
                                self.setGridsterBaseDimension();
                            }, 300);
                        });
                    });
                    if (!isSwitchboardDisplayed()) {
                        self.gridster.arrange_widgets_no_vertical_clipping(self.gridster.$widgets.toArray());
                        setTimeout(function() {
                            self.setGridsterBaseDimension();
                        }, 300);
                    }
                }
                if (!_.isUndefined(self.rightmostWidgetGrid)) {
                    self.rightmostWidgetGrid = undefined;
                }
            });

            addAppletsChannel.reply('addAppletPlaceholder', function(params) {
                var appletHtml = '<li class="preview-holder dragHere">Drag Applet Here</li>';
                var hoverOverRow = (params.hoverOverRow > 9 ? 9 : params.hoverOverRow);
                var placeholder_x = 4; // Can't change these yet (no data in params) see addAppletToGridster reply message (probably above)
                var placeholder_y = 4;
                var placeholderEl = $('.dragHere');
                var noCollisionCol;

                if (_.isUndefined(self.rightmostWidgetGrid)) {
                    self.rightmostWidgetGrid = self.get_highest_occupied_col_for_all_rows();
                }

                var placeholderCol = self.rightmostWidgetGrid[hoverOverRow - 1] + 1;

                if (placeholderEl.length === 0) {
                    placeholderCol = (hoverOverRow === 1 ? self.get_possible_col_for_placeholder_in_row(hoverOverRow + (placeholder_y - 1), placeholderCol, placeholder_x, placeholder_y) : placeholderCol);
                    self.gridster.add_widget(appletHtml, placeholder_x, placeholder_y, placeholderCol, hoverOverRow);
                } else if ($('#gridster2 [id^="applet-"]').length !== 0) {

                    if (Number(placeholderEl.attr('data-row')) !== hoverOverRow && self.hoverRow !== hoverOverRow) {

                        var topRowPossible = self.find_any_widgets_above(hoverOverRow, placeholderCol);
                        placeholderCol = self.rightmostWidgetGrid[topRowPossible - 1] + 1;
                        if (topRowPossible === 1) {
                            noCollisionCol = self.get_possible_col_for_placeholder_in_row(topRowPossible + (placeholder_y - 1), placeholderCol, placeholder_x, placeholder_y);

                        } else {
                            noCollisionCol = self.get_possible_col_for_placeholder_in_row(topRowPossible, placeholderCol, placeholder_x, placeholder_y);
                        }

                        placeholderEl.attr('data-row', topRowPossible);
                        placeholderEl.attr('data-col', noCollisionCol);
                        self.hoverRow = hoverOverRow;
                    }
                }
            });
        },
        get_highest_occupied_col_for_all_rows: function() {
            var row;
            var gm = this.gridster.gridmap;
            var numRows = gm[1].length;
            var rightmostWidgetGrid = [];
            for (row = 1; row <= numRows; row++) {
                var cols = [];
                for (var col = gm.length - 1; col >= 1; col--) {
                    if (this.gridster.is_widget(col, row)) {
                        cols.push(col);
                        break;
                    }
                }
                var highestCol = Math.max.apply(Math, cols);
                highestCol = (highestCol === -Infinity ? 0 : highestCol);
                rightmostWidgetGrid.push(highestCol);
            }
            return rightmostWidgetGrid;
        },
        find_any_widgets_above: function(startRow, col) {
            var row = startRow - 1;
            if (startRow === 1) {
                return startRow;
            }
            for (row; row >= 0; row--) {
                if (this.rightmostWidgetGrid[row - 1] >= col || row === 0) {
                    return row + 1;
                }
            }
        },
        get_possible_col_for_placeholder_in_row: function(startRow, startCol, placeholder_sizeX, placeholder_sizeY) {

            var row = startRow;
            var col = startCol;
            for (col; col <= startCol + (placeholder_sizeX - 1); col++) {
                for (row; row < startRow + (placeholder_sizeY - 1); row++) {
                    var cell = this.gridster.is_widget(col, row);
                    if (cell && !cell.hasClass('dragHere')) {
                        return this.get_possible_col_for_placeholder_in_row(startRow, startCol + 1, placeholder_sizeY, placeholder_sizeX);
                    }
                }
            }
            return startCol;
        },
        getNextAppletId: function() {
            var nextId = 0;
            this.$el.find('.gridsterContainer ul li').not('.gridsterContainer ul .dragHere, .gridsterContainer ul li li').each(function() {
                var idStr = $(this).attr('data-instanceid');
                var index = idStr.indexOf('applet-');
                if (index === 0) {
                    var id = parseInt(idStr.substring(7, idStr.length));
                    if (nextId < id)
                        nextId = id;
                }
            });
            ++nextId;
            return 'applet-' + nextId;
        },
        regions: {
            appletSlider: '.applet-tray'
        },
        events: {
            'click #editorFilterBtn': function(e) {               
                var filterContainer = $(e.currentTarget).closest('.workspace-editor-container');               
                filterContainer.one('shown.bs.collapse', function() {                   
                    filterContainer.find('input[type=search]').focus();               
                });           
            },
            'keyup #searchApplets': 'filterApplets',
            'keydown #searchApplets': function(evt) {
                if (evt.which == 13) {
                    evt.preventDefault();
                    this.filterApplets();
                }
            },
            'click #workspace-editor-filter .editor-clear-filter': 'clearFilterText',
            'click .delete-workspace': 'deleteWorkspace',
            'click .open-manager': 'navigateToManager',
            'click #exitEditing': 'hideOverlay',
            'click .edit-applet': 'editClicked',
            'keydown .options-box': 'handleSpacebarOrEnter',
            'keydown .applet-thumbnail': function(evt) {
                if (evt.which === 13) {
                    var $el = $(evt.currentTarget);
                    var addAppletsChannel = ADK.Messaging.getChannel('addApplets');
                    var d = addAppletsChannel.request('addAppletToGridster', {
                        appletId: $el.attr('data-appletid'),
                        appletTitle: $el.find('.applet-thumbnail-title').text(),
                        sizeX: 4,
                        sizeY: 4,
                        col: 4,
                        row: 4
                    });
                }
            }
        },
        clearFilterBtnDisplay: function(val) {
            if (val) {
                this.$('.editor-clear-filter').show();
            } else {
                this.$('.editor-clear-filter').hide();
            }
        },
        handleSpacebarOrEnter: function(e) {
            if (e.which === 13 || e.which === 32) {
                e.preventDefault();
                e.stopPropagation();
                $(e.target).click();
                return false;
            }
        },
        deleteWorkspace: function(e) {
            var deleteMessageModel = new Backbone.Model({
                screenTitle: this.screenConfig.title,
            });
            var deleteFooterModel = new Backbone.Model({
                screenId: this.screenConfig.id,
                buttonEl: this.$(e.target)
            });
            var deleteAlertView = new ADK.UI.Alert({
                title: 'Delete',
                icon: 'icon-triangle-exclamation',
                messageView: deleteMessageItemView.extend({
                    model: deleteMessageModel
                }),
                footerView: deleteFooterItemView.extend({
                    model: deleteFooterModel
                })
            });
            deleteAlertView.show();
        },
        navigateToManager: function() {
            ADK.UI.FullScreenOverlay.hide();
            var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
            channel.trigger('workspaceManager');
        },
        hideOverlay: function() {
            this.saveGridsterAppletsConfig(true);
            ADK.UI.FullScreenOverlay.hide();
            ADK.Navigation.navigate(ADK.ADKApp.currentScreen.id);
            $('.workspace-editor-trigger-button').focus();
        },
        onBeforeShow: function() {
            if (this.screenConfig) {
                $(this.el).find('#screen-title').text(this.screenConfig.title);
            }
            this.appletSlider.show(new AppletSelectionSlider());
            this.initGridster();

            this.listenTo(ADK.utils.resize.dimensions.gridsterWidget, 'change', function() {
                this.setGridsterBaseDimension();
            }, this);
        },
        getSwitchboard: function(appletId, region, appletTitle, regionId, onChangeView, currentView) {
            var switchboardOptions = {
                region: region,
                appletId: appletId,
                switchOnClick: false,
                appletTitle: appletTitle,
                appletConfig: {
                    id: appletId,
                    instanceId: regionId
                }
            };
            if (onChangeView) {
                switchboardOptions.onChangeView = onChangeView;
            }
            if (currentView) {
                switchboardOptions.currentView = currentView;
            }
            var SwitchboardView = new SwitchboardLayout(switchboardOptions);
            return SwitchboardView;
        },
        editClicked: function(e) {
            var self = this;
            if (isSwitchboardDisplayed()) {
                return;
            } else {
                var gridsterContainer = $(e.currentTarget).closest('[data-appletid]');

                var appletId = gridsterContainer.attr('data-appletid');
                var regionId = gridsterContainer.attr('data-instanceid');
                var appletTitle = gridsterContainer.find('.applet-title').text();
                var currentView = gridsterContainer.attr('data-view-type');

                this.addRegions({
                    appletRegion: {
                        selector: '[data-instanceid="' + regionId + '"]'
                    }
                });

                Switchboard = this.getSwitchboard(appletId, this.appletRegion, appletTitle, regionId, function() {
                    self.gridster.arrange_widgets_no_vertical_clipping(self.gridster.$widgets.toArray());
                    self.setGridsterBaseDimension();
                }, currentView);
                this.appletRegion.show(Switchboard);
                this.fixSwitchboardPosition();
                this.$('.view-switchboard').find('.applet-exit-options-button').removeClass('hide');
            }
        },
        displaySwitchboard: function(newAppletId, newRegionId, newAppletTitle, onChangeView) {
            this.addRegions({
                appletRegion: {
                    selector: '[data-instanceid="' + newRegionId + '"]'
                }
            });

            Switchboard = this.getSwitchboard(newAppletId, this.appletRegion, newAppletTitle, onChangeView);
            this.appletRegion.show(Switchboard);

            this.fixSwitchboardPosition();
        },
        fixSwitchboardPosition: function() {
            var $switchboard = $('div.view-switchboard');
            var leftOffset = $switchboard.offset().left;
            var rightOffset = $switchboard.offset().left + $switchboard.width();
            var windowWidth = $(self).width();

            if (leftOffset < 0) {
                $switchboard.css('margin-left', Math.abs(leftOffset) + 'px');
            } else if (rightOffset > windowWidth) {
                var rightMargin = rightOffset - windowWidth;
                $switchboard.css('right', rightMargin / 2 + 'px');
                $switchboard.css('left', '-10px');
            }
        },
        saveGridsterAppletsConfig: function(overrideThrottle) {
            var screen = ADK.ADKApp.currentScreen.id;
            var $gridsterEl = this.$el.find(".gridsterContainer");
            var appletsConfig = ADK.UserDefinedScreens.serializeGridsterScreen($gridsterEl, screen);

            //check if anything changed from last save
            if (ADK.UserDefinedScreens.getGridsterTemplate(this.lastSave.currentScreenModule) === ADK.UserDefinedScreens.getGridsterTemplate(appletsConfig)) {
                // nothing changed since last save, reset number of moves, skip save check
                this.lastSave.numMoves = 0;
                return;
            }

            //Removes Customize for copied UDS if the applets are changed
            if (this.screenConfig.hasCustomize) {
                ADK.UserDefinedScreens.setHasCustomize(this.screenConfig.id);
            }

            // save to the session
            ADK.UserDefinedScreens.saveGridsterConfigToSession(appletsConfig, screen);

            var currentTime = this.getSaveTime();
            var timeDiff = currentTime - this.lastSave.time;
            this.lastSave.numMoves++;
            if (this.lastSave.numMoves === 1 && !overrideThrottle) {
                // This is the first move so let's start a "timer"
                this.lastSave.time = currentTime;
            } else if (overrideThrottle || timeDiff > this.gracePeriod || this.lastSave.numMoves >= this.maxMoves) {
                // Force save, elapsed time longer than grace perieod, or more than enough moves to do the save
                // so save and reset the counters/"timer"
                ADK.UserDefinedScreens.saveGridsterConfig(appletsConfig, screen);
                this.lastSave.time = currentTime;
                this.lastSave.numMoves = 0;
                this.lastSave.currentScreenModule = appletsConfig;
            }
        },
        getGridsterDimension: function() {
            var windowWidth = $(window).width();
            var highestCol = this.gridster.get_highest_occupied_cell().col + GRIDSTER_CONTAINER_RIGHT_PADDING;
            if (highestCol < 1) {
                return [40, 20];
            }
            var x = Math.floor(windowWidth / highestCol) - 10;
            if (x > 40) x = 40;
            return [x, 20];
        },
        setGridsterBaseDimension: function() {
            this.gridster.resize_widget_dimensions({
                widget_base_dimensions: this.getGridsterDimension()
            });
            this.setBoundaryIndicator();
            this.$el.find('.gridsterContainer').css({
                left: '0px',
                position: 'relative'
            });
            this.$el.find('#gridster2').css({
                float: 'left',
                position: 'relative'
            });
            this.$el.find('#gridster2 > ul').css('position', '');
        },
        initGridster: function() {
            var self = this;
            this.gridster = this.$el.find(".gridsterContainer ul").gridster({
                namespace: '#gridster2',
                widget_selector: "li",
                widget_base_dimensions: [40, 20],
                widget_margins: [5, 5],
                helper: 'clone',
                avoid_overlapped_widgets: true,
                autogrow_cols: true,
                min_cols: 100,
                resize: {
                    enabled: true,
                    stop: function(e, ui, $widget) {
                        self.setGridsterBaseDimension();
                        self.saveGridsterAppletsConfig();
                    }
                },
                draggable: {
                    stop: function(e, ui) {
                        self.setGridsterBaseDimension();
                        self.saveGridsterAppletsConfig();
                    }
                }
            }).data('gridster');
            if (this.gridster) {
                this.setGridsterBaseDimension();
            }
        },
        filterApplets: function() {
            var filterText = this.$el.find('#searchApplets').val();
            this.appletSlider.currentView.filterApplets(filterText);
            this.clearFilterBtnDisplay(filterText);
        },
        clearFilterText: function() {
            this.$el.find('#searchApplets').val("");
            this.filterApplets();
        },

        lastSave: {
            time: 0,
            numMoves: 0
        },
        getSaveTime: function() {
            var d = new Date();
            return d.getTime();
        },
        setBoundaryIndicator: function() {
            var xSize = ADK.utils.resize.dimensions.gridsterWidget.get('width');

            var workspaceTotalApplets = Math.floor(ADK.utils.resize.dimensions.viewport.get('width') / (xSize * 5));
            var workspaceAppletsPerPage = workspaceTotalApplets < 3 ? 3 : workspaceTotalApplets;
            var workspaceScrollPosition = $('#content-region .jspContainer .jspPane').position();
            workspaceScrollPosition = _.isUndefined(workspaceScrollPosition) ? 0 : workspaceScrollPosition.left || 0;
            var workspaceWidth = $('#content-region').width() - 20;

            var editorAppletSize = (this.getGridsterDimension()[0] * 4) + 45;
            var editorIndicatorWidth = editorAppletSize * workspaceAppletsPerPage;

            var ratio = editorIndicatorWidth / workspaceWidth;

            ADK.UserDefinedScreens.saveScrollPositionToSession(workspaceScrollPosition);

            this.$('.boundary-indicator').css('width', editorIndicatorWidth + "px");
        },
        onBeforeDestroy: function() {
            var addAppletsChannel = ADK.Messaging.getChannel('addApplets');
            addAppletsChannel.stopReplying('addAppletToGridster');
            addAppletsChannel.stopReplying('addAppletPlaceholder');

            if (this.gridster) {
                this.gridster.destroy(true);
            }
            $(window).off("resize.appletLayoutView");
        }
    });

    return AppletLayoutView;
});