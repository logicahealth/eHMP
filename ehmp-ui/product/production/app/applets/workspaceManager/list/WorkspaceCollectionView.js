define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/workspaceManager/list/workspaceRowView',
], function(
    $,
    _,
    Backbone,
    Marionette,
    Handlebars,
    RowView
) {
    'use strict';

    var screenManagerChannel = ADK.Messaging.getChannel('managerAddScreen');

    var EmptyView = Backbone.Marionette.ItemView.extend({
        getTemplate: function() {
            var xhr = this.getOption('xhr');
            if(xhr) {
                return (xhr.state() === 'pending') ? this.template : this.noResultsFilterTemplate;
            }
            return this.template;
        },
        template: Handlebars.compile('<p><i class="fa fa-spinner fa-spin"></i> Loading...</p>'),
        noResultsFilterTemplate: Handlebars.compile('<p>No Results Found</p>'),
        tagName: 'p',
        className: 'bold-font top-margin-sm left-margin-xl',
        attributes: {
            'aria-live': 'assertive'
        },
        onDestroy: function() {
            delete this.options.xhr;
        }
    });
    var deleteMessageItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<p>Are you sure you want to delete <strong>{{screenTitle}}?</strong></p>'),
    });
    var deleteFooterItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{ui-button "No" classes="btn-default btn-sm" title="Press enter to go back"}}',
            '{{ui-button "Yes" classes="btn-danger btn-sm" title="Press enter to delete"}}'
        ].join('\n')),
        events: {
            'click .btn-default': function() {
                ADK.UI.Alert.hide();
                this.model.get('deleteButtonEl').focus();
            },
            'click .btn-danger': function() {
                var currentScreenId = this.model.get('tableRow').$el.attr('data-screen-id');
                var model = ADK.UserDefinedScreens.model;

                this.listenToOnce(model, 'save:error', function() {
                    screenManagerChannel.trigger('show:error');
                    ADK.UI.Alert.hide();
                });

                this.listenToOnce(model, 'save:success', function() {
                    ADK.UI.Alert.hide();
                });
                ADK.ADKApp.ScreenPassthrough.deleteUserScreen(currentScreenId);
            }
        }
    });
    var generateScreenId = function(screenTitle) {
        var newId = screenTitle.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase().replace(/\s+/g, '-');
        var newScreenId = _.random(1048576);
        var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();
        var screenIdNotUnique = true;
        while (screenIdNotUnique) {
            if (generateRandomScreenId(newScreenId, screensConfig)) {
                newScreenId = _.random(1048576);
            } else {
                screenIdNotUnique = false;
            }
        }
        var newScreen = {
            newId: newId,
            newScreenId: newScreenId
        };

        var idExists = _.filter(screensConfig.screens, function(screen) {
            return screen.id === newId;
        });

        if (idExists.length === 0) {
            return newScreen;
        } else {
            console.error('Cannot create a screen ID that already exists: ' + newId);
        }
    };

    var generateRandomScreenId = function(screenId, screensConfig) {
        _.filter(screensConfig.screens, function(screen) {
            return screen.screenId === screenId;
        });
    };

    var DefaultScreenModel = Backbone.Model.extend({
        defaults: function() {
            return {
                defaultScreenId: ADK.WorkspaceContextRepository.currentContextDefaultScreen
            };
        }
    });

    var WorkspaceCollectionView = Backbone.Marionette.CollectionView.extend({
        emptyView: EmptyView,
        emptyViewOptions: function() {
            return {
                xhr: this.promise
            };
        },
        childView: RowView,
        childViewOptions: function() {
            return {
                defaultScreenModel: this.defaultScreenModel
            };
        },
        childEvents: {
            'set:last:focus:element': function(child, selector) {
                this.lastFocusElement = selector;
            },
            'click:makeDefault': function(child) {
                var userModel = ADK.UserService.getUserSession();
                var newDefaultScreenId = child.model.get('id');
                ADK.ADKApp.ScreenPassthrough.setNewDefaultScreen(newDefaultScreenId);
                this.stopListening(userModel, 'save:preferences:success');
                this.listenToOnce(userModel, 'save:preferences:success', function() {
                    this.defaultScreenModel.set('defaultScreenId', newDefaultScreenId);
                });
            },
            'click:setWorkspaceOrderSR': function(currWksp) {
                currWksp = this.getWorkspaceName(currWksp.$el);
                this.$('.workspace-manager-rearrangement').text(currWksp + ' workspace was successfully set');
            },
            'clone:screen': 'cloneScreen',
            'delete:screen': 'deleteScreen',
            saving: function() {
                this.triggerMethod('saving');
            },
            saved: function() {
                this.triggerMethod('saved');
            }
        },
        onSaving: function() {
            this.saving = true;
            this.disableActionableItems();
        },
        onSaved: function() {
            if(this.saving) {
                delete this.saving;
                this.enableActionableItems();
            }
        },
        events: {
            'clone_screen': 'cloneScreen',
            'keydown': 'keyRearrangeHandler',
            'focusin .editor-input-element': function(event) {
                this.disableActionableItems(event.target);
            },
            'focusout .editor-input-element': function(event) {
                if(!this.saving) {
                    this.enableActionableItems();
                }
            }
        },
        disableActionableItems: function(omitMe) {
            this.children.each(_.bind(function(view) {
                view.$('.default-workspace-btn').attr('disabled', true);
                if (omitMe) {
                    view.$('.editor-input-element').not(omitMe).attr('disabled', true);
                } else {
                    view.$('.editor-input-element').attr('disabled', true);
                }
                view.$('.show-associations').attr('disabled', true);
                view.$('.duplicate-worksheet').attr('disabled', true);
                view.$('.rearrange-worksheet').attr('disabled', true);
                view.$('.delete-worksheet').attr('disabled', true);
                view.$('.previewWorkspace').attr('disabled', true);
                view.$('.customize-screen').attr('disabled', true);
                view.$('.launch-screen').attr('disabled', true);
            }, this));
        },
        enableActionableItems: function(view) {
            this.children.each(_.bind(function(view) {
                view.$('.default-workspace-btn').removeAttr('disabled');
                view.$('.editor-input-element').removeAttr('disabled');
                if (!view.model.get('predefined')) {
                    view.$('.show-associations').removeAttr('disabled');
                }
                view.$('.duplicate-worksheet').removeAttr('disabled');
                view.$('.rearrange-worksheet').removeAttr('disabled');
                view.$('.delete-worksheet').removeAttr('disabled');
                view.$('.customize-screen').removeAttr('disabled');
                if (view.model.get('hasApplets')) {
                    view.$('.previewWorkspace').removeAttr('disabled');
                    view.$('.launch-screen').removeAttr('disabled');
                }
            }, this));
        },
        attributes: {
            role: 'presentation'
        },
        filter: function(child) {
            var workspace = ADK.WorkspaceContextRepository.workspaces.get(child.id);
            if (_.isUndefined(workspace)) {
                // If something went wrong with WCR, it's better to show it(expose the bug) than to not show it
                return true;
            }
            return workspace.shouldShowInWorkspaceSelector();
        },
        screenEvents: {
            'save:success': function(model, resp, options) {
                this.triggerMethod('saved');
                this.resetCollection.apply(this, arguments);
            },
            'clone:error': function() {
                this.$('.editor-input-element').removeAttr('disabled');
                this.triggerMethod('saved');
                this.triggerMethod('show:error');
            },
            'clone:success': function() {
                this.triggerMethod('saved');
            },
            'request': function() {
                this.triggerMethod('clear:error');
            }
        },
        initialize: function() {
            var userModel = ADK.UserService.getUserSession();
            this.promise = ADK.UserDefinedScreens.getScreensConfig();
            this.collection = new Backbone.Collection();
            this.promise.done(_.bind(function(screensConfig) {
                this.collection.reset(screensConfig.screens);
            }, this));
            screenManagerChannel.comply('addNewScreen', this.addNewScreen, this);
            this.$el.append('<div aria-live="polite" class="sr-only workspace-manager-rearrangement" aria-atomic="true"></div>');
            this.defaultScreenModel = new DefaultScreenModel();
            this.listenTo(userModel, 'save:preferences:error', function() {
                this.triggerMethod('show:error');
            });

            this.listenToOnce(this, 'dom:refresh', function() {
                this.setUpDrag();
            });

            this.bindEntityEvents(ADK.UserDefinedScreens, this.screenEvents);
        },
        resetCollection: function(model, resp, options) {
            this.$('.editor-input-element').removeAttr('disabled');
            if (options.silent) return;
            this.collection.reset(ADK.UserDefinedScreens.getScreensConfigFromSession().screens);
            this.filterScreens(this.lastFilter);
            var id = _.get(options, 'id');
            if (id || !_.isEmpty(this.lastFocusElement)) {
                this.setFocusToScreenInput(id);
            }
        },
        onBeforeDestroy: function() {
            delete this.promise;
            screenManagerChannel.stopComplying('addNewScreen');
        },
        keyRearrangeHandler: function(e) {
            //508 functions
            var player = this.$el.find('.rearrange-row');
            if (player.length === 0) {
                return;
            }
            var prev = player.prev();
            var next = player.next();
            if (e.which === $.ui.keyCode.UP && prev.length > 0 && !prev.hasClass('workspace-manager-rearrangement')) {
                e.stopPropagation();
                e.preventDefault();
                this.moveWorkspaceUp(player, prev);
            } else if (e.which === $.ui.keyCode.DOWN && next.length > 0) {
                e.stopPropagation();
                e.preventDefault();
                this.moveWorkspaceDown(player, next);
            } else if (e.which === $.ui.keyCode.TAB) {
                e.stopPropagation();
                e.preventDefault();
            } else if (e.which === $.ui.keyCode.ENTER) {
                this.$el.find('.rearrange-row .rearrange-worksheet').focus();
            }
        },
        setUpDrag: function() {
            var self = this;
            var $el = this.$el;
            var dragObj = $el.find('.tableRow').parent().drag({
                items: '.tableRow',
                start: function(e) {
                    var $this = self.$(this);
                    $this.before('<div class="tableRow toInsert"></div>');
                    $this.addClass('draggingItem');
                    var height = $this.height();
                    var $toInsert = $el.find('.toInsert');
                    $toInsert.height(height);

                    $this.css({
                        'z-index': 99999,
                        'position': 'fixed',
                        'top': e.pageY - height + 'px',
                        'left': $toInsert.offset().left + 'px',
                        'width': $toInsert.width()
                    });
                    $this.hide();
                    setTimeout(function() {
                        $this.show();
                    }, 50);
                },
                drag: function(e) {
                    var $this = self.$(this);
                    var height = $this.height();
                    $this.css('position', 'fixed');
                    $this.css('top', e.pageY - height + 'px');
                    var $toInsert = $el.find('.toInsert');
                    $this.css('width', $toInsert.width());
                    $this.css('left', $toInsert.offset().left + 'px');
                    self.$('.tableRow:not(.toInsert)').each(function() {
                        var $this = self.$(this);
                        var coveredOffset = $this.offset();
                        var coveredHeight = $this.height();
                        var top = coveredOffset.top;
                        if (e.pageY > top && e.pageY < (top + coveredHeight / 2)) {
                            $this.before($toInsert);
                        } else if (e.pageY > (top + coveredHeight / 2) && e.pageY < (top + coveredHeight)) {
                            $this.after($toInsert);
                        }
                    });

                    //If the mouse client Y-coordinate is outside the "list-group" DOM element boundaries, adjust
                    //the vertical scroll position accordingly.
                    var listGroup = $el.parent();
                    var listGroupBoundary = listGroup.offset();
                    listGroupBoundary.bottom = listGroupBoundary.top + listGroup.height() - height;
                    listGroupBoundary.top += height;

                    var newVerticalScrollPos = null;

                    if (e.clientY < listGroupBoundary.top) {
                        newVerticalScrollPos = listGroup.scrollTop() - (height / 2);
                    } else if (e.clientY > listGroupBoundary.bottom) {
                        newVerticalScrollPos = listGroup.scrollTop() + (height / 2);
                    }

                    if (newVerticalScrollPos) {
                        listGroup.scrollTop(newVerticalScrollPos);
                    }
                },
                stop: function(e, ui) {
                    var $this = self.$(this);
                    var $toInsert = $el.find('.toInsert');
                    $toInsert.before($this);
                    $toInsert.remove();
                    $this.removeAttr('style');
                    $el.find('.draggingItem').removeClass('draggingItem');
                    self.saveScreensOrders();
                }
            });

            //DE2245 fix: cleanup drag object upon view destruction to clear leak
            this.listenTo(this, 'destroy', function() {
                dragObj.destroy();
            });
        },
        lastFilter: '',
        filterScreens: function(filterText) {
            this.lastFilter = filterText;
            this.collection.reset(ADK.UserDefinedScreens.getScreensConfigFromSession().screens);
            if (!_.isEmpty(filterText)) {
                this.collection.reset(_.filter(this.collection.models, function(model) {
                    if (!_.isUndefined(model.get('description'))) {
                        return model.get('title').toLowerCase().indexOf(filterText.toLowerCase()) >= 0 || model.get('description').toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
                    } else {
                        return model.get('title').toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
                    }
                }));
            }
        },
        getWorkspaceName: function(wksp) {
            if (wksp.hasClass('user-defined')) {
                return wksp.find('.editor-title-element').val();
            }
            return wksp.find('.editor-title span').text();
        },
        moveWorkspaceSR: function(player, dir, relWkspPosition) {
            var relativeWorkspace = this.$el.children(':eq(' + relWkspPosition + ')');
            relativeWorkspace = this.getWorkspaceName(relativeWorkspace);
            var srSentence = 'Current workspace moved ' + dir + ' the ' + relativeWorkspace + ' workspace';
            this.$('.workspace-manager-rearrangement').text(srSentence);
        },

        moveWorkspaceUp: _.throttle(function(player, prev) {
            player.fadeOut(100).insertBefore(prev).fadeIn(100, function() {
                this.triggerMethod('check:scroll', player);
                this.saveScreensOrders();
                this.moveWorkspaceSR(player, 'above', player.index() + 1);
            }.bind(this));
        }, 250, {
            leading: true
        }),
        moveWorkspaceDown: _.throttle(function(player, next) {
            player.fadeOut(100).insertAfter(next).fadeIn(100, function() {
                this.triggerMethod('check:scroll', player);
                this.saveScreensOrders();
                this.moveWorkspaceSR(player, 'below', player.index() - 1);
            }.bind(this));
        }, 250, {
            leading: true
        }),

        saveScreensOrders: function() {
            var ids = [];
            var self = this;
            this.$('.tableRow').each(function() {
                var id = self.$(this).attr('data-screen-id');
                if (id) {
                    ids.push(id);
                }
            });
            this.triggerMethod('saving');
            ADK.UserDefinedScreens.sortScreensByIds(ids);
        },
        addNewScreen: function() {
            this.lastFocusElement = null;
            var screenOptions;
            var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();
            var newTitle = this.generateTitle(screensConfig);
            var newScreen = generateScreenId(newTitle);
            var newId = newScreen.newId;
            var newScreenId = newScreen.newScreenId;

            var hasCustomize = false;

            var authorString = ADK.UserService.getUserSession().get('firstname');
            authorString = authorString + ' ' + ADK.UserService.getUserSession().get('lastname');

            screenOptions = {
                id: newId,
                screenId: newScreenId,
                routeName: newId,
                title: newTitle,
                description: undefined,
                predefined: false,
                defaultScreen: false,
                author: authorString,
                hasCustomize: hasCustomize
            };

            this.triggerMethod('saving');
            ADK.ADKApp.ScreenPassthrough.addNewScreen(screenOptions, ADK.ADKApp);
        },
        setFocusToScreenInput: function(screenId) {
            var inputSelector = this.$('[data-screen-id="' + screenId + '"] input:text:first');
            if (!_.isEmpty(this.lastFocusElement)) {
                inputSelector = this.$(this.lastFocusElement);
            }
            var inputValue = inputSelector.val();
            inputSelector.focus();

            /* set cursor to end of input */
            if (inputValue) {
                var inputSelectorLength = inputValue.length;
                inputSelector[0].setSelectionRange(inputSelectorLength, inputSelectorLength);
            }
        },
        generateTitle: function(screensConfig) {
            var maxTitleNum = 0;
            var defaultWorkspaceIdPrefix = 'Untitled ' + _.capitalize(ADK.WorkspaceContextRepository.currentContextId.toLowerCase()) + ' Workspace';
            screensConfig.screens.forEach(function(screen) {
                if (screen.title.indexOf(defaultWorkspaceIdPrefix) !== -1 && !isNaN(Number(screen.title.slice(defaultWorkspaceIdPrefix.length + 1)))) {
                    var titleNum = Number(screen.title.slice(defaultWorkspaceIdPrefix.length + 1));
                    if (titleNum > maxTitleNum) {
                        maxTitleNum = titleNum;
                    }
                }
            });
            return defaultWorkspaceIdPrefix + ' ' + (maxTitleNum + 1);
        },
        cloneScreen: function(child, event) {
            if (arguments.length === 1) {
                // noinspection JSUnusedAssignment
                event = child;
            }

            var originalModel = child.model;
            var originalTitle = child.model.get('title');
            var cloneTitle = this.generateCloneTitle(originalTitle);
            var newScreen = generateScreenId(cloneTitle);
            var newId = newScreen.newId;
            var newScreenId = newScreen.newScreenId;
            var hasCustomize = false;
            var screenIndex = this.collection.index(originalModel);

            var authorString = ADK.UserService.getUserSession().get('firstname');
            authorString = authorString + ' ' + ADK.UserService.getUserSession().get('lastname');

            var clonedScreenOptions = {
                id: newId,
                screenId: newScreenId,
                routeName: newId,
                title: cloneTitle,
                description: originalModel.get('description'),
                predefined: false,
                defaultScreen: false,
                author: authorString,
                hasCustomize: hasCustomize,
                problems: originalModel.get('problems'),
                screenIndex: screenIndex
            };
            this.triggerMethod('saving');
            ADK.UserDefinedScreens.cloneScreen(originalModel.get('id'), newId, !!originalModel.get('predefined'), clonedScreenOptions);
        },
        deleteScreen: function(child) {
            this.$('.rearrange-row').removeClass('rearrange-row');

            var deleteMessageModel = new Backbone.Model({
                screenTitle: child.$('input:first').val(),
            });
            var deleteFooterModel = new Backbone.Model({
                tableRow: child,
                deleteButtonEl: child.$('.delete-worksheet')
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
        generateCloneTitle: function(origTitle) {
            var cloneTitle;

            var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();
            origTitle = origTitle.slice(0, 23).replace(/[^a-zA-Z0-9 ]/g, '');

            var previouslyCloned = _.filter(screensConfig.screens, function(screen) {
                if (screen.title.indexOf(origTitle + ' Copy') !== -1 && screen.title.indexOf(origTitle + ' Copy Copy') === -1) {
                    return screen;
                }
            });
            if (previouslyCloned.length !== 0) {
                cloneTitle = origTitle + ' Copy ' + (previouslyCloned.length + 1);
            } else {
                cloneTitle = origTitle + ' Copy';
            }

            return cloneTitle;
        }
    });

    return WorkspaceCollectionView;
});