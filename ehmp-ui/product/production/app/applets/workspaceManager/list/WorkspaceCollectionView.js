define([
    'underscore',
    'backbone',
    'marionette',
    'gridster',
    'app/applets/workspaceManager/list/problems/associationManagerView',
    'hbs!app/applets/workspaceManager/list/screenEditorRow',
    'hbs!app/applets/workspaceManager/list/problems/associationCounterTemplate'
], function(_, Backbone, Marionette, gridster, AssociationManagerView, screenEditorRow, AssociationCounterTemplate) {

    'use strict';

    var screenManagerChannel = ADK.Messaging.getChannel('managerAddScreen');

    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: _.template('<p>No Results Found</p>'),
        tagName: 'p',
        className: 'bold-font top-margin-sm left-margin-xl',
        attributes: {
            "aria-live": "assertive",
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

    var toggleDefaultHtml = function(e, defaultButtonHTML) {
        var E = (_.isUndefined(e) ? defaultButtonHTML : $(e.currentTarget));
        var starIcon = E.find('.fa-star, .fa-star-o');

        if (starIcon.hasClass('fa-star-o')) {
            starIcon.removeClass('fa-star-o')
                .addClass('fa-star madeDefault')
                .siblings('span.sr-only')
                .html('Selected as the Default screen.');
        } else {
            starIcon.addClass('fa-star-o')
                .removeClass('fa-star madeDefault')
                .siblings('span.sr-only')
                .html('Make Default.');
        }
    };

    var AssociationCounterView = Backbone.Marionette.ItemView.extend({
        template: AssociationCounterTemplate
    });

    var WorkspaceItemView = Backbone.Marionette.LayoutView.extend({
        template: screenEditorRow,
        attributes: function() {
            if (this.model.get('predefined') === true) {
                return {
                    class: 'table-row tableRow predefined-screen-row',
                    'data-screen-id': this.model.get('id'),
                    role: 'row',
                };
            } else {
                return {
                    class: 'table-row tableRow user-defined',
                    'data-screen-id': this.model.get('id'),
                    role: 'row'
                };
            }
        },
        events: {
            'click .rearrange-worksheet': 'rearrangeWorksheet',
            'blur .rearrange-worksheet': 'captureFocus',
            'click .default-workspace-btn': 'makeDefault',
            'click .launch-screen': 'launchWorksheet',
            'click .customize-screen': 'customizeWorksheet',
            'click .duplicate-worksheet': 'clone',
            'submit form.workspace-editor': 'handleEnterSubmit',
            'blur .editor-input-element': 'saveInlineChange',
            'keyup .editor-input-element': 'inlineChangeEvent',
            'focus .editor-title-element': 'applyInputMasking'
        },
        regions: {
            associationCounterRegion: '.associations-counter-region'
        },
        initialize: function() {
            this.screenOptions = {
                id: this.model.get('id'),
                screenId: this.model.get('screenId'),
                routeName: this.model.get('routeName'),
                title: this.model.get('title'),
                description: this.model.get('description'),
                predefined: this.model.get('predefined'),
                hasCustomize: this.model.get('hasCustomize'),
                problems: _.clone(this.model.get('problems')) || []
            };
            if (!_.isUndefined(this.model.get('author'))) {
                this.screenOptions.author = this.model.get('author');
            }
            this.model.set('hasCustomize', this.screenOptions.hasCustomize);
            var id = this.model.get('id');
            var screenId = this.model.get('screenId');
            var module = ADK.ADKApp.Screens[id];
            var config = ADK.UserDefinedScreens.getGridsterConfigFromSession(this.model.get("id"));
            var predefined = this.model.get('predefined');
            if (predefined === true && module.applets && module.applets.length > 0) {
                this.model.set('hasApplets', true);
            }
            if (predefined === false && config && config.applets && config.applets.length > 0) {
                this.model.set('hasApplets', true);
            }
            if (screenId === 'documents-list') {
                this.model.set('documents-list', true);
            }
            // init association counter
            var self = this;
            this.listenTo(this.model, 'change', function(model) {
                if (model.changed.problems) {
                    self.associationCounterRegion.show(new AssociationCounterView({
                        model: self.model
                    }));
                    self.saveAssociationChange();
                }
            });
        },
        onRender: function() {
            if (this.screenOptions.id === ADK.WorkspaceContextRepository.currentContextDefaultScreen) {
                var defaultButtonHTML = this.$el.find('.default-workspace-btn');
                toggleDefaultHtml(undefined, defaultButtonHTML);
            }
            this.associationCounterRegion.show(new AssociationCounterView({
                model: this.model
            }));

            this.createPopover();
        },
        createPopover: function(){
            var self = this;
            var associationsPopoverTrigger = this.$('.show-associations[data-toggle="popover"]');

            var globalClickHandler = function(e) {
                if ($(e.target).closest('.popover').length === 0) { //ignore clicks inside the popover
                    // there was a click outside the popover, so hide the popover
                    var isTrigger = $(e.target).closest('[data-toggle="popover"]').is(associationsPopoverTrigger);
                    if (!isTrigger) { // ignore clicks on the trigger elem - let bootstrap handle those
                        associationsPopoverTrigger.popover('hide');
                    }
                }
            };
            var popoverKeyupHandler = function(e) {
                var isEscKey = (e.type === 'keyup' && e.keyCode === 27 ? true : false);
                var isCloseBtnClick = (e.type === 'click' && $(e.target).is('#associationManagerCloseBtn') ? true : false);
                if ( isCloseBtnClick || isEscKey) {
                    e.stopPropagation();
                    associationsPopoverTrigger.popover('hide');
                    associationsPopoverTrigger.focus();
                }
            };
            associationsPopoverTrigger.popup({
                container: '[data-screen-id="' + self.screenOptions.id+'"]',
                placement: _.bind(this.getPopoverPlacement, this, associationsPopoverTrigger),
                halign: 'left',
                // Title is not displayed, but is needed to prevent the content function from being called twice.
                // This is a known issue in bootstrap 3: https://github.com/twbs/bootstrap/issues/12563
                title: 'Title',
                delay: 0,
                content: function() {
                    self.associationManagerView = new AssociationManagerView({
                        model: self.model
                    });
                    self.associationManagerView.render();
                    return self.associationManagerView.$el;
                },
                template: '<div class="popover association-manager-popover" aria-live="polite"><div class="popover-content"></div></div>',
            });
            associationsPopoverTrigger.on('shown.bs.popover', function(e) {
                self.associationManagerView.trigger('show');

                // hide the popover on the next click outside the popover
                $('html').on('click.workspaceCollectionViewPopover', globalClickHandler);

                // close the popover when escape is pressed
                $('.association-manager-popover').on('keyup.workspaceCollectionViewPopover', popoverKeyupHandler);
                $('.association-manager-popover').on('click.associationManagerCloseBtn', popoverKeyupHandler);

                associationsPopoverTrigger.addClass('active')
                    .attr('aria-expanded', true);
            });
            associationsPopoverTrigger.on('hidden.bs.popover', function(e) {
                self.cleanupAssociationManager();
                associationsPopoverTrigger.removeClass('active')
                    .attr('aria-expanded', false);
            });
        },
        getPopoverPlacement: function(associationsPopoverTrigger) {
            associationsPopoverTrigger = associationsPopoverTrigger || this.$('[data-toggle="popover"]');
            var placement = 'bottom';
            var popoverTop = associationsPopoverTrigger.offset().top + associationsPopoverTrigger.outerHeight();
            if (popoverTop + 250 > window.innerHeight) {
                placement = 'top';
            }
            return placement;
        },
        applyInputMasking: function(e) {
            $(e.target).inputmask("Regex", {
                regex: "^[a-zA-Z0-9\\s]*$"
            });
        },
        rearrangeWorksheet: function(e) {
            if(this.$el.hasClass('rearrange-row')) {
                $('.rearrange-row').removeClass('rearrange-row');
                this.triggerMethod('click:setWorkspaceOrderSR');
            } else {
                $('.rearrange-row').removeClass('rearrange-row');
                this.$el.addClass('rearrange-row');
                this.$el.find('.rearrange-worksheet').focus();
            }
        },
        captureFocus: function() {
            if(this.$el.hasClass('rearrange-row')) {
                this.$el.find('.rearrange-worksheet').focus();
            }
        },
        makeDefault: function(e) {
            this.triggerMethod('click:removeDefault');
            toggleDefaultHtml(e);
            ADK.ADKApp.ScreenPassthrough.setNewDefaultScreen(this.screenOptions.id);
            this.$el.find('.default-workspace-btn .sr-only').focus();
        },
        launchWorksheet: function(e) {
            var input = $(e.currentTarget);
            var title = input.closest('.tableRow').find('.editor-input-element');
            if (title && title.val() === '') {
                return;
            }
            var gridsterConfig = ADK.UserDefinedScreens.getGridsterConfigFromSession(this.model.get('id'));
            ADK.Navigation.navigate(this.screenOptions.routeName);
        },
        customizeWorksheet: function(e) {
            var input = $(e.currentTarget);
            var title = input.closest('.tableRow').find('.editor-input-element');
            if (title && title.val().trim() === '') {
                return;
            }
            ADK.Navigation.navigate(this.screenOptions.routeName, {
                extraScreenDisplay: {
                    dontLoadApplets: true
                }
            });
            var channel = ADK.Messaging.getChannel('addAppletsChannel');
            channel.trigger('addApplets');
        },
        clone: function() {
            $(this.el).trigger('clone_screen', this.model);
        },
        handleEnterSubmit: function(e) {
            e.preventDefault();
            var input = {
                currentTarget: $(e.currentTarget).find('input')
            };
            this.saveInlineChange(input);
            if (input.currentTarget.next().hasClass('fa-check')) {
                input.currentTarget.siblings('span.sr-only').focus();
            }
        },
        saveInlineChange: function(e) {
            var input = $(e.currentTarget);
            var value = input.val();
            var origValue = input.attr('origValue') ? input.attr('origValue') : '';
            var origId = this.screenOptions.id;
            var isTitle = input.parent().hasClass('editor-title');
            var isDescription = input.parent().hasClass('editor-description');
            if (isTitle) {
                if (value.trim() !== '' && value.trim() !== origValue) {
                    this.cleanupPopover();
                    if (value.trim().toLowerCase() === origValue.toLowerCase()) {
                        value = value.trim();
                    }
                    value = $.trim(value);
                    var newTitle = value;
                    if (value.toLowerCase() !== origValue.toLowerCase()) {
                        newTitle = this.processTitleChange(value);
                    }
                    input.val(newTitle);
                    var newScreen = generateScreenId(newTitle);
                    this.screenOptions.id = newScreen.newId;
                    if (this.screenOptions.screenId === undefined || this.screenOptions.screenId === null) {
                        this.screenOptions.screenId = newScreen.newScreenId;
                    }
                    this.screenOptions.title = newTitle;
                    this.screenOptions.routeName = newScreen.newId;
                    this.model.set('id', this.screenOptions.id);
                    this.model.set('title', this.screenOptions.title);
                    this.model.set('routeName', this.screenOptions.routeName);
                    ADK.ADKApp.ScreenPassthrough.editScreen(this.screenOptions, origId);
                    input.attr('origValue', newTitle);
                    this.saveIndicator(input);
                    this.$el.attr({
                        'data-screen-id': newScreen.newId
                    });
                    this.$el.find('.previewWorkspace').attr('title', 'Press enter to preview the applets on the ' + newTitle + ' workspace.');
                    this.$el.find('.default-workspace-btn').attr('title', 'Make default. Press enter to set the ' + newTitle + ' workspace as the default screen to load after logging in.');

                    if (this.model.get('hasApplets')) {
                        this.$el.find('.customize-screen').attr('title', 'Press enter to launch the ' + newTitle + ' workspace.');
                    }
                    this.createPopover();
                }
            } else if (isDescription) {
                if (value != origValue) {
                    this.screenOptions.description = value;
                    this.model.set('description', this.screenOptions.description);
                    ADK.ADKApp.ScreenPassthrough.editScreen(this.screenOptions, origId);
                    input.attr('origValue', value);
                    this.saveIndicator(input);
                }
            }
        },
        inlineChangeEvent: function(e) {
            var input = $(e.currentTarget);
            var isTitle = input.parent().hasClass('editor-title');
            input.parent().removeClass('has-success').removeClass('has-error');
            input.next().removeClass('fa-check fa-asterisk color-red-dark color-secondary')
                .siblings('span.sr-only').html('');

            if (isTitle && input.val().trim() === '') {
                input.parent().addClass('has-error');
                input.next().addClass('fa-asterisk color-red-dark');
            }
        },
        saveAssociationChange: function() {
            if (!this.screenOptions.predefined) {
                var newProblems = this.model.get('problems') || [];
                var currentProblems = this.screenOptions.problems || [];
                var changed = false;
                if (newProblems.length !== currentProblems.length) {
                    changed = true;
                } else {
                    for (var i = 0; i < currentProblems.length && !changed; i++) {
                        if (currentProblems[i].snomed !== newProblems[i].snomed) {
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    this.screenOptions.problems = this.model.get('problems');
                    this.save(this.screenOptions.id);
                }
            }
        },
        save: function(screenId) {
            ADK.ADKApp.ScreenPassthrough.editScreen(this.screenOptions, screenId);
        },
        saveIndicator: function(input) {
            input.parent().addClass('has-success');
            input.next().addClass('fa-check color-secondary');
            input.siblings('span.sr-only').html('Your update has been saved.');
        },
        processTitleChange: function(title) {
            var loop = true;
            var newTitle = title;
            while (loop) {
                if (ADK.ADKApp.ScreenPassthrough.titleExists(newTitle)) {
                    var split = newTitle.split(' ');
                    var counter = isNaN(split[split.length - 1]) ? 2 : parseInt(split[split.length - 1]) + 1;
                    if (counter !== 2) {
                        split.length = split.length - 1;
                    }
                    newTitle = split.join(' ') + ' ' + counter;
                } else {
                    loop = false;
                }
            }
            return newTitle;
        },
        onBeforeDestroy: function() {
            this.cleanupPopover();
            this.cleanupAssociationManager();
        },

        cleanupAssociationManager: function() {
            if (self.associationManagerView) {
                self.associationManagerView.destroy();
                $('html').off('click.workspaceCollectionViewPopover');
                $('.association-manager-popover').off('keyup.workspaceCollectionViewPopover');
                $('.association-manager-popover').off('click.associationManagerCloseBtn');
            }
        },

        cleanupPopover: function() {
            var $popover = this.$('[data-toggle="popover"]');
            $popover.off('shown.bs.popover');
            $popover.off('hidden.bs.popover');
            $popover.popover('destroy');
        },
        behaviors: {
            Tooltip: {}
        }
    });

    var WorkspaceCollectionView = Backbone.Marionette.CollectionView.extend({
        emptyView: EmptyView,
        childView: WorkspaceItemView,
        childEvents: {
            'click:removeDefault': function() {
                this.$el.find('.madeDefault')
                    .addClass('fa-star-o')
                    .removeClass('madeDefault fa-star')
                    .siblings('span.sr-only')
                    .html('Make Default.');
            },
            'click:setWorkspaceOrderSR': function(currWksp) {
                currWksp = this.getWorkspaceName(currWksp.$el);
                this.$('.workspace-manager-rearrangement').text(currWksp + " workspace was successfully set");
            }
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
        initialize: function() {
            var self = this;
            var promise = ADK.UserDefinedScreens.getScreensConfig();
            self.collection = new Backbone.Collection();
            promise.done(function(screensConfig) {
                self.collection.reset(screensConfig.screens);
            });
            screenManagerChannel.comply('addNewScreen', this.addNewScreen, self);
            this.$el.append('<div aria-live="polite" class="sr-only workspace-manager-rearrangement" aria-atomic="true"></div>');
        },
        events: {
            'clone_screen': 'cloneScreen'
        },
        resetCollection: function() {
            this.collection.reset(ADK.UserDefinedScreens.getScreensConfigFromSession().screens);
        },
        onShow: function() {
            var self = this;
            self.setUpDrag();
            //508 functions
            $(document).bind('keydown.workspaceCollectionView', (function(e) {
                var player = self.$el.find('.rearrange-row');
                if (player.length === 0) return;
                var prev = player.prev();
                var next = player.next();
                if (e.which === 38 && prev.length > 0 && !prev.hasClass('workspace-manager-rearrangement')) { //up key
                    e.stopPropagation();
                    e.preventDefault();
                    self.moveWorkspaceUp(player, prev);
                } else if (e.which === 40 && next.length > 0) { //down key
                    e.stopPropagation();
                    e.preventDefault();
                    self.moveWorkspaceDown(player, next);
                } else if (e.which === 9) {
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.which === 13) {
                    self.$el.find('.rearrange-row .rearrange-worksheet').focus();
                }
            }));
        },

        onBeforeDestroy: function() {
            $(document).unbind('keydown.workspaceCollectionView');
            screenManagerChannel.stopComplying('addNewScreen');
        },

        setUpDrag: function() {
            var self = this;
            var $el = this.$el;
            var dragObj = $el.find('.tableRow').parent().drag({
                items: '.tableRow',
                start: function(e) {
                    var $this = $(this);
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
                    var $this = $(this);
                    var height = $this.height();
                    $this.css('position', 'fixed');
                    $this.css('top', e.pageY - height + 'px');
                    var $toInsert = $el.find('.toInsert');
                    $this.css('width', $toInsert.width());
                    $this.css('left', $toInsert.offset().left + 'px');
                    $('#list-group .tableRow:not(.toInsert)').each(function() {
                        var $this = $(this);
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
                    }
                    else if (e.clientY > listGroupBoundary.bottom) {
                        newVerticalScrollPos = listGroup.scrollTop() + (height / 2);
                    }

                    if (newVerticalScrollPos) {
                        listGroup.scrollTop(newVerticalScrollPos);
                    }
                },
                stop: function(e, ui) {
                    var $this = $(this);
                    var $toInsert = $el.find('.toInsert');
                    $toInsert.before($this);
                    $toInsert.remove();
                    $this.removeAttr("style");
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
            this.initialize();
            this.collection.reset(_.filter(this.collection.models, function(model) {
                if (!_.isUndefined(model.get('description'))) {
                    return model.get('title').toLowerCase().indexOf(filterText.toLowerCase()) >= 0 || model.get('description').toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
                } else {
                    return model.get('title').toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
                }
            }));
            this.render();
        },
        getWorkspaceName: function(wksp) {
            if (wksp.hasClass('user-defined')) {
                return wksp.find('.editor-title-element').val();
            }
                return wksp.find('.editor-title span').text();
        },
        moveWorkspaceSR: function(player, dir, relWkspPosition) {
            var relativeWorkspace = this.$el.children(':eq('+ relWkspPosition +')');
            relativeWorkspace = this.getWorkspaceName(relativeWorkspace);
            var srSentence = "Current workspace moved " + dir + " the " + relativeWorkspace + " workspace";
            this.$('.workspace-manager-rearrangement').text(srSentence);
        },
        moveWorkspaceUp: _.throttle(function(player, prev) {
            player.fadeOut(100).insertBefore(prev).fadeIn(100, function() {
                this.checkScrollPosition(player);
                this.saveScreensOrders();
                this.moveWorkspaceSR(player, "above", player.index() + 1);
            }.bind(this));
        }, 250, {leading: true}),
        moveWorkspaceDown: _.throttle(function(player, next) {
            player.fadeOut(100).insertAfter(next).fadeIn(100, function() {
                this.checkScrollPosition(player);
                this.saveScreensOrders();
                this.moveWorkspaceSR(player, "below", player.index() - 1);
            }.bind(this));
        }, 250, {leading: true}),
        checkScrollPosition: function(player) {
            var listGroup = $('#list-group');
            var listGroupHeight = listGroup.height();
            var playerHeight = player.height();
            var playerPosition = player.offset();

            //Adjust the player position using the offset provided by the
            playerPosition.top = playerPosition.top - listGroup.position().top;
            playerPosition.bottom = playerPosition.top + playerHeight;
            var playerPosMargin = playerHeight * 0.25;

            //Just check to see if we've just managed to bump the workspace to the edges of the screen and adjust the scroll position accordingly.
            if (playerPosition.top < (playerHeight + playerPosMargin)) {
                listGroup.scrollTop(listGroup.scrollTop() - player.outerHeight());
            }
            else if (playerPosition.bottom > (listGroupHeight - playerPosMargin)) {
                listGroup.scrollTop(listGroup.scrollTop() + player.outerHeight());
            }
        },
        saveScreensOrders: function() {
            var ids = [];
            this.$('.tableRow').each(function() {
                var id = $(this).attr('data-screen-id');
                if (id)
                    ids.push(id);
            });
            ADK.UserDefinedScreens.sortScreensByIds(ids);
        },
        addNewScreen: function() {
            var self = this;
            var screenOptions;
            var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();
            var newTitle = self.generateTitle(screensConfig);
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

            ADK.ADKApp.ScreenPassthrough.addNewScreen(screenOptions, ADK.ADKApp);
            self.filterScreens(self.lastFilter);
            //set focus to new screen title input
            self.setFocusToScreenInput(newId);

        },
        setFocusToScreenInput: function(screenId) {
            var sel = $('[data-screen-id="' + screenId + '"] input:text:first');
            sel.focus();
            sel.val(sel.val());
        },
        generateTitle: function(screensConfig) {
            var maxTitleNum = 0;
            screensConfig.screens.forEach(function(screen) {
                if (screen.title.indexOf('User Defined Workspace') !== -1 && !isNaN(Number(screen.title.slice(23)))) {
                    var titleNum = Number(screen.title.slice(23));
                    if (titleNum > maxTitleNum) maxTitleNum = titleNum;
                }
            });
            return 'User Defined Workspace ' + (maxTitleNum + 1);
        },
        cloneScreen: function(e) {
            var self = this;
            var origTitle = $(e.target).find('input')[0];
            origTitle = ($(origTitle).val() === undefined ? $(e.target).find('.predefined-title').text() : $(origTitle).val());
            var cloneTitle = this.generateCloneTitle(origTitle);
            var newScreen = generateScreenId(cloneTitle);
            var newId = newScreen.newId;
            var newScreenId = newScreen.newScreenId;

            var hasCustomize = true;

            var screenIndex;
            //this is to make sure we have the latest collection from session/jds
            //this.collection can be outdated
            var coll = new Backbone.Collection(ADK.UserDefinedScreens.getScreensConfigFromSession().screens);
            var origModel = _.find(coll.models, function(model, Idx) {
                screenIndex = Idx;
                return model.get('title') === origTitle;
            });

            var authorString = ADK.UserService.getUserSession().get('firstname');
            authorString = authorString + ' ' + ADK.UserService.getUserSession().get('lastname');

            var clonedScreenOptions = {
                id: newId,
                screenId: newScreenId,
                routeName: newId,
                title: cloneTitle,
                description: origModel.get('description'),
                predefined: false,
                defaultScreen: false,
                author: authorString,
                hasCustomize: hasCustomize,
                problems: origModel.get('problems')
            };

            var callBack = function(model, response, options) {
                // If we don't clone the original screen config applet object array into the new screen config, the
                // cloned workspace will be empty.
                var _applets = _.get(ADK.ADKApp.Screens, [origModel.get('id'), 'applets'], []);
                _.set(ADK.ADKApp.Screens, [newId, 'applets'], _.clone(_applets));

                if (origModel.get('predefined') === true) {
                    var predefinedAppletConfig = {
                        applets: _applets,
                        id: clonedScreenOptions.id,
                        contentRegionLayout: 'gridster',
                        userDefinedScreen: true
                    };
                    ADK.UserDefinedScreens.saveGridsterConfig(predefinedAppletConfig, clonedScreenOptions.id,
                        function() {
                            ADK.UserDefinedScreens.cloneScreen(origModel.get('id'), clonedScreenOptions.id, true);
                        });
                } else {
                    ADK.UserDefinedScreens.cloneScreen(origModel.get('id'), clonedScreenOptions.id, false);
                    ADK.UserDefinedScreens.cloneUDScreenToSession(origModel.get('id'), clonedScreenOptions.id);
                }
                //clone filters to session
                ADK.UserDefinedScreens.cloneScreenFiltersToSession(origModel.get('id'), clonedScreenOptions.id);

                //clone stacked graphs to session
                ADK.UserDefinedScreens.cloneScreenGraphsToSession(origModel.get('id'), clonedScreenOptions.id);

                //clone user defined sorts to session
                ADK.UserDefinedScreens.cloneScreenSortsToSession(origModel.get('id'), clonedScreenOptions.id);

                self.filterScreens(self.lastFilter);

                //set focus to cloned screen title input
                self.setFocusToScreenInput(newId);
            };



            ADK.ADKApp.ScreenPassthrough.addNewScreen(clonedScreenOptions, ADK.ADKApp, screenIndex + 1, callBack);

        },
        generateCloneTitle: function(origTitle) {
            var cloneTitle;
            var promise = ADK.UserDefinedScreens.getScreensConfig();
            origTitle = origTitle.slice(0, 23).replace(/[^a-zA-Z0-9 ]/g, '');
            promise.done(function(screensConfig) {
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
            });
            return cloneTitle;
        }
    });

    return WorkspaceCollectionView;
});
