define([
    'underscore',
    'handlebars',
    'backbone',
    'marionette',
    'app/applets/notes/writeback/formUtil',
    'app/applets/notes/writeback/errorView'
], function(_, Handlebars, Backbone, Marionette, FormUtil, ErrorView) {
    'use strict';
    var titleFetchDone = false;
    var fetchAttempts = 0;
    var titlePicklistOptions = {
        roleNames: 'AUTHOR/DICTATOR',
        actionNames: 'ENTRY'
    };

    var NotesTraySummaryView = ADK.Views.TraySummaryList.extend({
        selectedNoteUid: null,
        initialize: function() {
            var self = this;
            this.loading(true);
            //ititialize titles for the picklist. This currently takes about
            //40 seconds for first fetch/filter.
            this.initTitles();

            this.collection = new ADK.UIResources.Writeback.Notes.AllNotes();
            this.deferred = this.collection.fetch();
            this.deferred.done(function() {
                self.collection.each(function(model) {
                    switch (model.get('id')) {
                        case 'unsigned':
                            self.unsignedCollection = model.get('notes');
                            break;
                        case 'uncosigned':
                            self.uncosignedCollection = model.get('notes');
                            break;
                        case 'signed':
                            self.signedCollection = model.get('notes');
                            break;
                    }
                });
                self.loading(false);
            });
            this.deferred.fail(function() {
                var errorView = new ErrorView({
                    message: 'There was an error retrieving some of your notes. Please contact your System Administrator for assistance.'
                });
                errorView.showModal();
            });

            // Refresh tray on note save/sign/delete
            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:added', function(model) {
                this.deferred.done(function() {
                    self.unsignedCollection.add(model);
                });
            });
            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:updated', function(model) {
                this.deferred.done(function() {
                    self.unsignedCollection.sort();
                });
            });
            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:deleted', function(model) {
                this.deferred.done(function() {
                    self.unsignedCollection.remove(model);
                });
            });
            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:signed', function(collection) {
                this.deferred.done(function() {
                    self.unsignedCollection.remove(collection.pluck('oldUid'));
                    self.signedCollection.add(collection.toJSON());
                });
            });

            // Open tray when form/preview is closed
            this.listenTo(ADK.Messaging.getChannel('notes'), 'tray:open', function(model) {
                setTimeout(function() {
                    self.$el.trigger('tray.show');
                }, 500);
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'tray.show', function(event) {
                if (!_.isUndefined(event) && !_.isUndefined(event.currentTarget) && event.currentTarget.tagName === "BUTTON") {
                    this.collection.fetch({
                        silent: true,
                        success: function() {
                            self.unsignedCollection.trigger('change');
                            self.uncosignedCollection.trigger('change');
                            self.signedCollection.trigger('change');
                        }
                    });
                }
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'tray.shown', function(event) {
                if (this.selectedNoteUid) {
                    this.$('a[data-uniqueID="' + this.selectedNoteUid + '"]').focus();
                } else {
                    this.selectedNoteUid = null;
                }
            });
            this.listenTo(ADK.Messaging.getChannel('notes'), 'tray.hide', function(event) {
                this.selectedNoteUid = null;
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:selected', function(model) {
                this.selectedNoteUid = model.get('itemUniqueId');
            });
            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:deselected', function() {
                this.selectedNoteUid = null;
            });

            this.listenTo(this.collection, 'read:success', function() {
                if (this.selectedNoteUid) {
                    this.$('a[data-uniqueID="' + this.selectedNoteUid + '"]').focus();
                } else {
                    this.selectedNoteUid = null;
                }
            });
        },
        initTitles: function() {
            fetchAttempts = 0;
            titleFetchDone = false;
            var cachedTitlesPicklist = new ADK.UIResources.Picklist.Notes.Titles();
            this.listenTo(cachedTitlesPicklist, 'read:error', function() {
                //only show error if all attempts failed
                if(fetchAttempts === 150) {
                    FormUtil.showTitleError();
                }
            });
            //temporary until we have new resource that returns all titles at once
            this.listenTo(cachedTitlesPicklist, 'read:incomplete', function(collection) {
                titleFetchDone = false;
                if (fetchAttempts <= 150) {
                    var self = this;
                    setTimeout(function(){
                        self.prefetchTitles(cachedTitlesPicklist);
                    }, 10000);
                }
            });
            this.listenTo(cachedTitlesPicklist, 'read:complete', function(collection) {
                titleFetchDone = true;
                //console.log('  done fetching titles');
            });
            this.prefetchTitles(cachedTitlesPicklist);
        },
        prefetchTitles: function(picklist) {
            if (ADK.UserService.getUserSession() && ADK.UserService.getUserSession().get('site')) {
                fetchAttempts += 1;
                //console.log('prefetchTitles ' +fetchAttempts);
                picklist.fetch(titlePicklistOptions);
            }
        },
        options: {
            label: "Notes",
            onClick: function(model) {
                ADK.Messaging.getChannel('notes').trigger('note:selected', model);
                var perms = model.get('asuPermissions');
                if (model.get('status') === 'COMPLETED' || model.get('app').toLowerCase() === 'vista' || !_.contains(perms, 'EDIT RECORD')) {
                    FormUtil.launchPreviewForm(model);
                    //this.$el.trigger('tray.swap');
                } else {
                    if (titleFetchDone) {
                        var notesFormOptions = {
                            model: this.model,
                            isEdit: true,
                            showVisit: false,
                            openTrayOnDestroy: true
                        };
                        ADK.Messaging.trigger('tray.close');
                        FormUtil.launchNoteForm(notesFormOptions);
                   } else {
                        FormUtil.showTitleWait();
                    }
                }
            },
            attributeMapping: {
                groupLabel: 'name',
                groupItems: 'notes',
                itemUniqueId: 'itemUniqueId',
                itemLabel: 'localTitle',
                itemStatus: 'statusDisplayName',
                itemDateTime: 'referenceDateTime'
            }
        }
    });

    var TrayView = ADK.UI.Tray.extend({
        attributes: {
            id: 'patientDemographic-noteSummary',
        },
        options: {
            tray: ADK.Views.TrayActionSummaryList.extend({
                options: {
                    key: "notes",
                    headerLabel: "Notes",
                    dropdownLabel: "New Note",
                    listView: NotesTraySummaryView
                }
            }),
            position: 'right',
            buttonLabel: 'Notes',
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "tray",
        group: "writeback",
        key: "notes",
        view: TrayView,
        orderIndex: 21,
        shouldShow: function() {
            return (ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('sign-note&add-encounter'));
        }
    });

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'notes',

        label: 'Note',
        onClick: function() {
            if (titleFetchDone) {
                    ADK.Messaging.getChannel('notes').trigger('note:deselected');
                    var notesFormOptions = {
                        openTrayOnDestroy: true
                    };
                    ADK.Messaging.trigger('tray.close');
                    FormUtil.launchNoteForm(notesFormOptions);
                } else {
                    FormUtil.showTitleWait();
                }
        },
        shouldShow: function() {
            return true;
        }
    });

    return NotesTraySummaryView;
});