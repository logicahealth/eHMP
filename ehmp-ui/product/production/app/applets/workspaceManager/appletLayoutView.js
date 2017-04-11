define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/workspaceManager/list/screenEditor',
    'app/applets/workspaceManager/list/WorkspaceCollectionView',
    'gridster',
    'app/applets/workspaceManager/list/PreviewWorkspaceView'
], function(_, Backbone, Marionette, Handlebars, screenEditor, WorkspaceCollectionView, gridster, PreviewWorkspaceView) {
    'use strict';

    var deleteMessageItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '<p>Are you sure you want to delete <strong>{{screenTitle}}?</strong></p><span class="sr-only">Note that focus will shift to the beginning of the Workspace Manager Screen after deleting a workspace.</span>'
        ].join('\n')),
    });
    var deleteFooterItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{ui-button "Cancel" classes="btn-default" title="Press enter to cancel and close this dialog"}}',
            '{{ui-button "Delete" classes="btn-danger" title="Press enter to delete this workspace"}}'
        ].join('\n')),
        events: {
            'click .btn-default': function() {
                ADK.UI.Alert.hide();
                this.model.get('buttonEl').focus();
            },
            'click .btn-danger': function() {
                ADK.ADKApp.ScreenPassthrough.deleteUserScreen(this.model.get('tableRow').attr('data-screen-id'));
                ADK.UI.Alert.hide();
                ADK.UI.FullScreenOverlay.hide();
                var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
                channel.trigger('workspaceManager');
            }
        }
    });

    var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
        template: screenEditor,
        className: 'workspaceManager-applet full-height',
        initialize: function() {
            var self = this;
            this.model = new Backbone.Model();
            var screenModule = ADK.ADKApp[Backbone.history.fragment];
            var screenManagerChannel = ADK.Messaging.getChannel('managerAddScreen');
        },
        regions: {
            managerRegion: '#list-group'
        },
        events: {
            'keyup #searchScreens': 'filterScreens',
            'keydown #searchScreens': function(evt) {
                if (evt.which == 13) {
                    evt.preventDefault();
                    this.filterScreens();
                }
            },
            'click #gridFilterButtonWorkspaceManager': function(e){
                var filterContainer = $(e.currentTarget).closest('.full-height');
                filterContainer.one('shown.bs.collapse', function() {
                    filterContainer.find('input[type=search]').focus();
                });
            },
            'click .clearSearch': 'clearSearch',
            'click #doneEditing': 'hideOverlay',
            'click .addScreen': 'triggerAddNew',
            'click .delete-worksheet': 'removeScreen',
            'click .previewWorkspace': 'showPreview',
            'keydown [tabindex]:not(input)': 'handleSpacebarOrEnter'
        },
        hideOverlay: function() {
            ADK.UI.FullScreenOverlay.hide();
            ADK.Messaging.trigger('close:workspaceManager');
            $('#workspaceManagerButton').focus();
        },
        onBeforeAttach: function() {
            this.managerRegion.show(new WorkspaceCollectionView());
        },
        handleSpacebarOrEnter: function(e) {
            if (e.which === 13 || e.which === 32) {
                e.preventDefault();
                e.stopPropagation();
                $(e.target).click();
                return false;
            }
        },
        filterScreens: function() {
            var filterText = this.$el.find('#searchScreens').val();
            this.managerRegion.currentView.filterScreens(filterText);
            if (filterText) {
                this.$el.find('.clearSearch').show();
            } else {
                this.$el.find('.clearSearch').hide();
            }
        },
        clearSearch: function() {
            this.$el.find('#searchScreens').val('');
            this.filterScreens();
            this.$el.find('#searchScreens').focus();
        },
        removeScreen: function(e) {
            var deleteButton = $(e.currentTarget);

            var deleteMessageModel = new Backbone.Model({
                screenTitle: deleteButton.closest('.tableRow').find('input')[0].value,
            });
            var deleteFooterModel = new Backbone.Model({
                tableRow: deleteButton.closest('.tableRow'),
                buttonEl: deleteButton
            });
            var deleteAlertView = new ADK.UI.Alert({
                title: 'Delete Workspace',
                icon:'icon-delete',
                messageView: deleteMessageItemView.extend({
                    model: deleteMessageModel
                }),
                footerView: deleteFooterItemView.extend({
                    model: deleteFooterModel
                })
            });
            deleteAlertView.show();
        },
        triggerAddNew: function() {
            screenManagerChannel.command('addNewScreen');
        },
        showPreview: function(e) {
            var tableRow = $(e.target).closest('.tableRow');
            var title = tableRow.find('.editor-input-element').val();
            title = (_.isUndefined(title) ? tableRow.find('.editor-title').text() : title);
            var previewView = PreviewWorkspaceView.extend({
                screenId: tableRow.attr('data-screen-id'),
                screenTitle: title
            });

            var PreviewFooterItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '{{ui-button "Close" classes="btn-primary" title="Press enter to close."}}'
                ].join('\n')),
                events: {
                    'click button': function() {
                        ADK.UI.Alert.hide();
                    }
                }
            });
            var alertView = new ADK.UI.Alert({
                title: title,
                icon: "",
                messageView: previewView,
                footerView: PreviewFooterItemView
            });
            alertView.show();
            alertView.$el.find('button').focus();
        },
        onBeforeDestroy: function(){
            screenManagerChannel.stopComplying('deleteScreen', this.removeScreenActive, self);
        }

    });

    var screenManagerChannel = ADK.Messaging.getChannel('managerAddScreen');

    return AppletLayoutView;
});