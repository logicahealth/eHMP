define([
    'underscore',
    'handlebars',
    'backbone',
    'marionette',
    'moment',
    'app/applets/notes/writeback/formUtil',
    'app/applets/notes/writeback/errorView',
    'app/applets/notes/subtray/noteSubtray',
    'app/applets/notes/subtray/noteObjectsSubtray',
    'app/applets/notes/subtray/consultSubtray',
    'hbs!app/applets/notes/tray/addendumTileTemplate',
    'hbs!app/applets/notes/tray/noteTileTemplate'
], function(_, Handlebars, Backbone, Marionette, moment, FormUtil, ErrorView, NoteSubtray, NoteObjectsSubtray, ConsultSubtray, addendumTileTemplate, noteTileTemplate) {
    'use strict';
    var titlePicklistOptions = {
        roleNames: 'AUTHOR/DICTATOR',
        actionNames: 'ENTRY'
    };

    var NOTE_MISSING = 'The note referenced by this task no longer exists.';

    function ascSortCollection(addendums) {
        return _.sortBy(addendums, function(addendum) {
            var val;
            if (addendum.referenceDateTime) {
                val = moment(addendum.referenceDateTime, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmmss') * 1;
            }
            return val;
        }, null);
    }

    var NotesTraySummaryView = ADK.Views.TraySummaryList.extend({
        selectedNoteUid: null,
        templateHelpers: function() {
            return {
                formatIdString: function(string) {
                    return _.isString(string) ? string.replace(/ |\(|\)/g, "-").toLowerCase() : string;
                },
            };
        },
        initialize: function() {
            var self = this;
            this.loading(true);


            this.collection = new ADK.UIResources.Writeback.Notes.AllNotes();
            this.deferred = this.collection.fetch();
            this.deferred.done(function() {
                self.collection.each(function(model) {
                    var subcollection = model.get('notes');
                    if (subcollection) {
                        for (var i = 0; i < subcollection.length; i++) {
                            if (subcollection.models[i].get('addenda')) subcollection.models[i].get('addenda').comparator = ascSortCollection;
                        }
                    }
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
                    message: 'There was an error retrieving some of your notes. Contact your System Administrator for assistance.'
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

            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:signed', function(response) {
                if (response.data.failedConsults) {
                    var alertView = new ADK.UI.Notification({
                        title: 'Consult Failed',
                        icon: 'icon-error',
                        message: 'One or more consults failed to complete.'
                    });
                    alertView.show();
                    console.error('Failed to complete consults. Failed consults object array:');
                    console.error(response.data.failedConsults);
                }
            });

            // Open tray on 'tray:display' event
            this.listenTo(ADK.Messaging.getChannel('notes'), 'tray:display', function(model) {
                setTimeout(function() {
                    self.$el.trigger('tray.show');
                }, 500);
            });
            this.listenTo(ADK.Messaging.getChannel('notes'), 'tray:focus', function(model) {
                setTimeout(function() {
                    self.$el.trigger('focus');
                }, 500);
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:added', function(event) {
                this.collection.fetch();
            });
            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:signed', function(event) {
                this.collection.fetch();
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'tray.show', function(event) {
                if (!_.isUndefined(event) && !_.isUndefined(event.currentTarget) && event.currentTarget.tagName === "BUTTON") {
                    if (!_.has(this, "collection.xhr") || !_.isFunction(_.get(this, "collection.xhr.state", null)) || this.collection.xhr.state() !== "pending") {
                        this.collection.xhr = this.collection.fetch();
                    }
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

            var noteEdit = function(objNoteUid) {
                var errMessage;
                if (_.isObject(objNoteUid)) {
                    if (objNoteUid.clinicalObjectUid) {
                        var possibleNotes;
                        self.collection.each(function(model) {
                            if (model.get('id') === 'unsigned') {
                                possibleNotes = model.get('notes').clone();
                            }
                        });

                        var isAddendum = false;
                        var parentNoteModel = null;

                        var model = possibleNotes.findWhere({
                            'uid': objNoteUid.clinicalObjectUid
                        });

                        if (!model) {
                            _.each(possibleNotes.models, function(note) {
                                var addenda = note.get('addenda');
                                var addendum = _.findWhere(addenda, {
                                    uid: objNoteUid.clinicalObjectUid
                                });
                                if (addendum) {
                                    model = new Backbone.Model(addendum);
                                    isAddendum = true;
                                    model.set('noteModel', note);
                                }
                            });
                            if (!model) {
                                var err = 'Note edit: Could not find model with uid of ' + objNoteUid.clinicalObjectUid;
                                var errorView = new ErrorView({
                                    message: NOTE_MISSING
                                });
                                errorView.showModal();
                                throw new Error(err);
                            }
                        }

                        var perms = model.get('asuPermissions');
                        if (model.get('app').toLowerCase() === 'vista' || !_.contains(perms, 'EDIT RECORD')) {
                            throw new Error('Note edit: Unable to edit this note.');
                        }

                        var notesFormOptions = {
                            model: model,
                            isEdit: true,
                            showVisit: false,
                            openTrayOnDestroy: true
                        };
                        ADK.Messaging.trigger('tray.close');
                        this.selectedNoteUid = objNoteUid.clinicalObjectUid;
                        if (isAddendum) {
                            FormUtil.launchAddendumForm(notesFormOptions);
                        } else {
                            FormUtil.launchNoteForm(notesFormOptions);
                        }
                    } else {
                        errMessage = "Notes appet: note:edit event --------->>> Error: clinicalObjectUid property of object is undefined";
                    }
                } else {
                    errMessage = "Notes appet: note:edit event --------->>> Error: parameter is not an object";
                }
                if (errMessage) throw new Error(errMessage);
            };

            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:edit', function(objNoteUid) {
                if (!_.has(this, 'unsignedCollection')) {
                    if (this.collection.pendingFetch) {
                        this.listenToOnce(this.collection, 'sync', _.bind(noteEdit, this, objNoteUid));
                    }
                } else {
                    noteEdit.apply(this, arguments);
                }
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

            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:detail', function(noteClinicalObject) {
                //Launch note preview modal with note clinical object
                var note;
                if (noteClinicalObject.get('data')) {
                    note = new Backbone.Model(noteClinicalObject.get('data'));
                }

                if (note) {
                    FormUtil.launchDraggablePreview(note);
                } else {
                    ADK.Messaging.getChannel('notes').trigger('tray:display');
                }
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'note:consult', function(objClinicalObjUid) {
                var errMessage;
                if (_.isObject(objClinicalObjUid)) {
                    if (objClinicalObjUid.clinicalObjectUid) {
                        var patientContext = ADK.PatientRecordService.getCurrentPatient();
                        var url = ADK.ResourceService.buildUrl('patient-record-note-by-consult-uid', {
                            pid: patientContext.get('pid'),
                            consultUid: objClinicalObjUid.clinicalObjectUid
                        });
                        var urlFetch = new Backbone.Collection();
                        urlFetch.url = url;
                        urlFetch.fetch({
                            error: function(collection, res) {
                                throw new Error(res);
                            },
                            success: function(result) {
                                var model = result.at(0);
                                var noteClinicalObjectUid = model.get("noteClinicalObjectUid");
                                if (noteClinicalObjectUid) {
                                    ADK.Messaging.getChannel('notes').trigger('note:edit', {
                                        clinicalObjectUid: noteClinicalObjectUid
                                    });
                                    return;
                                } // note not exist, open note tray
                                ADK.Messaging.getChannel('notes').trigger('tray:display');
                            }
                        });
                    } else {
                        ADK.Messaging.getChannel('notes').trigger('tray:display');
                    }
                } else {
                    errMessage = "Notes appet: note:consult event --------->>> Error: parameter is not an object";
                }
                if (errMessage) throw new Error(errMessage);
            });
        },
        getItemTemplate: function() {
            if (this.model.get('noteType')) {
                if (this.model.get('noteType').toLowerCase() === "addendum") {
                    return addendumTileTemplate;
                }
            }
            return noteTileTemplate;
        },
        options: {
            label: "Notes",
            onClick: function(model) {
                ADK.Messaging.getChannel('notes').trigger('note:selected', model);
                var perms = model.get('asuPermissions');
                var isAddendum = false;
                var parentNoteModel = null;
                if (model.get('parentUid')) {
                    isAddendum = true;
                    parentNoteModel = _.find(this.collection.models, {
                        attributes: {
                            uid: model.get('parentUid')
                        }
                    });
                    model.set('noteModel', parentNoteModel);
                }
                if (model.get('status') === 'COMPLETED' || model.get('app').toLowerCase() === 'vista' || !_.contains(perms, 'EDIT RECORD')) {
                    if (isAddendum) {
                        FormUtil.launchDraggablePreview(parentNoteModel);
                    } else {
                        FormUtil.launchDraggablePreview(model);
                    }
                } else {
                    ADK.Messaging.getChannel('notes').trigger('note:edit', {
                        clinicalObjectUid: model.get('uid')
                    });
                }
            },
            attributeMapping: {
                groupLabel: 'name',
                groupItems: 'notes',
                itemUniqueId: 'itemUniqueId',
                itemLabel: 'localTitle',
                itemStatus: 'statusDisplayName',
                itemDateTime: 'referenceDateTime',
                nodes: 'addenda'
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
            iconClass: 'icon icon-icon_notes'
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "tray",
        group: "writeback",
        key: "notes",
        view: TrayView,
        orderIndex: 40,
        shouldShow: function() {
            return (ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('sign-note'));
        }
    });

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'notes',
        label: 'Note',
        onClick: function() {
            ADK.Messaging.getChannel('notes').trigger('note:deselected');
            FormUtil.launchNoteForm();
        },
        shouldShow: function() {
            return true;
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "sub-tray",
        group: ["note-edit-subtray"],
        key: "note-objects-subtray",
        view: ADK.UI.SubTray.extend({
            options: {
                tray: NoteObjectsSubtray,
                view: NoteObjectsSubtray,
                position: 'left',
                buttonLabel: 'Note Objects',
                eventChannelName: 'note-subtray'
            },
            events: {
                'subTray.shown': function() {
                    ADK.Messaging.getChannel('note-subtray').trigger('subTray:opened');
                },
                'subTray.hidden': function() {
                    ADK.Messaging.getChannel('note-subtray').trigger('subTray:closed');
                }
            }
        }),
        shouldShow: function() {
            return true;
        },
    });

    ADK.Messaging.trigger('register:component', {
        type: "sub-tray",
        group: ["note-addendum-subtray"],
        key: "note-addendum-subtray",
        view: ADK.UI.SubTray.extend({
            options: {
                tray: NoteSubtray,
                view: NoteSubtray,
                position: 'left',
                buttonLabel: 'Current Note',
                eventChannelName: 'note-addendum'
            },
            events: {
                'subTray.shown': function() {
                    ADK.Messaging.getChannel('note-addendum').trigger('subTray:opened');
                },
                'subTray.hidden': function() {
                    ADK.Messaging.getChannel('note-addendum').trigger('subTray:closed');
                }
            }
        }),
        shouldShow: function() {
            return true;
        },
    });

    ADK.Messaging.trigger('register:component', {
        type: "sub-tray",
        group: ["note-edit-subtray"],
        key: "consult-subtray",
        view: ADK.UI.SubTray.extend({
            options: {
                tray: ConsultSubtray,
                view: ConsultSubtray,
                position: 'left',
                buttonLabel: 'Open Consults',
                eventChannelName: 'consult-subtray'
            },
            events: {
                'subTray.shown': function() {
                    ADK.Messaging.getChannel('consult-subtray').trigger('subTray:opened');
                },
                'subTray.hidden': function() {
                    ADK.Messaging.getChannel('consult-subtray').trigger('subTray:closed');
                }
            }
        }),
        shouldShow: function() {
            return ADK.UserService.hasPermission('complete-consult-order');
        },
    });

    return NotesTraySummaryView;
});