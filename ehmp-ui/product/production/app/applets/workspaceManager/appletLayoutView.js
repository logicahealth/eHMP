define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/workspaceManager/list/screenEditor',
    'app/applets/workspaceManager/list/WorkspaceCollectionView',
    'app/applets/workspaceManager/list/errorRegion'
], function(
    $,
    _,
    Backbone,
    Marionette,
    Handlebars,
    screenEditor,
    WorkspaceCollectionView,
    ErrorView
) {
    'use strict';

    var QUARTER = 0.25;

    var screenManagerChannel = ADK.Messaging.getChannel('managerAddScreen');

    var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            HelpLink: {
                container: '.help-button-container',
                mapping: 'workspace_manager'
            }
        },
        templateHelpers: function() {
            return {
                getContext: ADK.WorkspaceContextRepository.currentContextId
            };
        },
        template: screenEditor,
        className: 'workspaceManager-applet percent-height-100',
        ui: {
            inputFilter: '.workspace-filter-input',
            searchScreens: '#searchScreens',
            clearSearch: '.clearSearch'
        },
        regions: {
            managerRegion: '#list-group',
            errorRegion: '#workspace-growler-region'
        },
        events: {
            'keyup @ui.searchScreens': 'filterScreens',
            'keydown @ui.searchScreens': function(evt) {
                if (evt.which === $.ui.keyCode.ENTER) {
                    evt.preventDefault();
                    this.filterScreens();
                }
            },
            'shown.bs.collapse #workspaceFilter': function(e) {
                this.ui.inputFilter.focus();
            },
            'click @ui.clearSearch': 'clearSearch',
            'click .done-editing': 'hideOverlay',
            'click .addScreen': 'triggerAddNew'
        },

        childEvents: {
            'show:error': 'onShowError',
            'clear:error': 'onClearError',
            'saving': 'onSaving',
            'saved': 'onSaved'
        },

        onSaving: function() {
            this.$('.help-icon-link').attr('disabled', true);
            this.$('.addScreen').attr('disabled', true);
            this.$('#gridFilterButtonWorkspaceManager').attr('disabled', true);
            this.$('.done-editing').attr('disabled', true);
        },

        onSaved: function() {
            this.$('.help-icon-link').removeAttr('disabled');
            this.$('.addScreen').removeAttr('disabled');
            this.$('#gridFilterButtonWorkspaceManager').removeAttr('disabled');
            this.$('.done-editing').removeAttr('disabled');
        },

        onClearError: function () {
            this.errorRegion.empty();
        },

        onShowError: function () {
            this.errorRegion.show(new ErrorView());
        },

        isCurrentWorkspaceDestroyed: function() {
            var currentScreenId = ADK.ADKApp.currentScreen.id;
            return !_.has(ADK, ['ADKApp', 'Screens', currentScreenId]);
        },

        hideOverlay: function() {
            if (this.isCurrentWorkspaceDestroyed()) {
                ADK.Navigation.goToDefault();
            } else {
                ADK.UI.FullScreenOverlay.hide();
                ADK.Messaging.trigger('close:workspaceManager');
            }
            $('#workspaceManagerButton').focus();
        },
        initialize: function() {
            var screenModel = ADK.UserDefinedScreens.model;

            this.model = new Backbone.Model();
            this.listenTo(screenManagerChannel, 'show:error', this.onShowError);
            this.listenTo(screenModel, 'save:error', this.onShowError);
        },

        onBeforeAttach: function() {
            this.managerRegion.show(new WorkspaceCollectionView());
        },
        filterScreens: function() {
            var filterText = this.ui.searchScreens.val();
            this.managerRegion.currentView.filterScreens(filterText);
            if (filterText) {
                this.ui.clearSearch.removeClass('hidden');
            } else {
                this.ui.clearSearch.addClass('hidden');
            }
        },
        clearSearch: function() {
            this.ui.searchScreens.val('');
            this.filterScreens();
            this.ui.searchScreens.focus();

        },
        triggerAddNew: function() {
            screenManagerChannel.command('addNewScreen');
        },
        checkScroll: function(child, player) {
            var listGroup = this.getRegion('managerRegion').$el;

            var listGroupHeight = listGroup.height();
                var playerHeight = player.height();
                    var playerPosition = player.offset();

                //Adjust the player position using the offset provided by the
                    playerPosition.top = playerPosition.top - listGroup.position().top;
                        playerPosition.bottom = playerPosition.top + playerHeight;
                    var playerPosMargin = playerHeight * QUARTER;

            //Just check to see if we've just managed to bump the workspace to the edges of the screen and adjust the scroll position accordingly.
            var isScrollRequired = (playerPosition.top < (playerHeight + playerPosMargin)) ||
                (playerPosition.bottom > (listGroupHeight - playerPosMargin));

                if (isScrollRequired) {
                listGroup.scrollTop(listGroup.scrollTop() - player.outerHeight());
            }
        }

    });

    return AppletLayoutView;
});
