define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    'app/applets/notes/writeback/formFields',
    'app/applets/notes/writeback/modelUtil',
    'app/applets/notes/writeback/errorView',
    'app/applets/notes/writeback/operationConfirmationView',
    'app/applets/notes/writeback/signatureUtil',
    'app/applets/notes/asuUtil',
    'app/applets/notes/preview/preview',
    'app/applets/notes/appConfig'
], function(Backbone, Marionette, $, Handlebars, moment, fields, util, ErrorView, ConfirmationView, SignatureUtil, asuUtil, PreviewView, CONFIG) {
    'use strict';
    var formStatus = {
        formSign: false,
        formClose: false,
        formAuto: false,
        formCancel: false
    };

    var hasLastSelectedTitle = false;
    var PREVIEW = 0;
    var SIGN = 1;
    var navigationCheckId = 'notes-writeback-in-progress';
    var titleFetchDone = false;

    var fieldOptions = {
        referenceDateFormat: 'MM/DD/YYYY',
        referenceTimeFormat: 'HH:mm'
    };

    function launchPreviewWorkflow(model) {

        var workflowOptions = {
            title: CONFIG.PREVIEW_TITLE_UNSIGNED,
            size: "large",
            backdrop: true,
            showProgress: false,
            keyboard: true,
            headerOptions: undefined,
            steps: [],
        };

        workflowOptions.steps.push({
            view: PreviewView,
            viewModel: model,
            stepTitle: CONFIG.PREVIEW_TITLE_UNSIGNED,
            onBeforeShow: function() {
                workflow.changeHeaderTitle(CONFIG.PREVIEW_TITLE_UNSIGNED);
                workflow.headerModel.unset('actionItems');

                util.formatTextContent(model);
                model.openTrayOnDestroy = true;
                util.setEncounterDisplayName(model);
                util.detectCosigner(model);
            }
        });

        var workflow = new ADK.UI.Workflow(workflowOptions);
        workflow.show();
    }

    function launchSignatureWorkflow(model) {
        var formModel;
        var NoteModel = ADK.UIResources.Writeback.Notes.Model;

        if (_.isUndefined(model) || _.isNull(model)) {
            formModel = new NoteModel({
                'app': 'ehmp',
                'author': ADK.UserService.getUserSession().get('lastname') + ',' + ADK.UserService.getUserSession().get('firstname')
            });
        } else {
            formModel = model;
        }

        formModel.set('value', true); // for signing
        formModel.openTrayOnDestroy = true;
        var signCollection = new Backbone.Collection([formModel]);
        SignatureUtil.addAttributes(signCollection);
        var signModel = new ADK.UIResources.Writeback.Notes.NotesSignModel({
            itemChecklist: signCollection
        });

        signModel.set('successEvents', [{
            messagingChannel: 'notes',
            messagingEventName: 'note:signed'
        }, {
            messagingChannel: 'tray-tasks',
            messagingEventName: 'action:refresh'
        }]);

        var workflowOptions = {
            title: "Sign Note",
            size: "medium",
            backdrop: true,
            showProgress: false,
            keyboard: true,
            headerOptions: {
                closeButtonOptions: {title: 'Press enter to cancel.'}
            },
            steps: [],
        };

        var ParentSignView = ADK.utils.appletUtils.getAppletView('esignature', 'signature');
        var NotesSignView = ParentSignView.extend({
            returnStep: 0,
            checklistOptions: {
                label: 'Notes',
                itemTemplate: "<strong>{{localTitle}}</strong>{{#if derivReferenceDate}} - <span class='date-taken'>{{derivReferenceDate}}</span>{{/if}}{{#if derivReferenceTime}}<span class='time-taken'> {{derivReferenceTime}}</span>{{/if}}",
                formUid: 'formUid'
            },
            initialize: function() {
                this.listenTo(this.model, 'create:success', function(model) {
                    ADK.UI.Workflow.hide();
                    var successes = this.model.get('successes');
                    if (successes.length > 0) {
                        this.workflow.close();
                        ADK.Messaging.getChannel('notes').trigger('note:close_form');
                    }
                });
                ParentSignView.prototype.initialize.apply(this, arguments);
            }
        });
        workflowOptions.steps.push({
            view: NotesSignView,
            viewModel: signModel,
            stepTitle: 'E-Signature',
            onBeforeShow: function() {
                workflow.headerModel.unset('actionItems');
                workflow.changeHeaderCloseButtonOptions({
                    onClick: function(e) {
                        e.preventDefault();
                        ADK.UI.Alert.hide();
                        ADK.UI.Workflow.hide();
                    }
                });
            }
        });
        var workflow = new ADK.UI.Workflow(workflowOptions);
        workflow.show();
    }

    var changeOfDerivReferenceDate = function(model, newValue) {
        if (_.isEmpty(newValue)) {
            this.stopListening(model, 'change.inputted:derivReferenceDate', changeOfDerivReferenceDate);
            model.set('derivReferenceDate', moment().format(fieldOptions.referenceDateFormat));
            this.listenTo(model, 'change.inputted:derivReferenceDate', changeOfDerivReferenceDate);
        }
    };

    var changeOfDerivReferenceTime = function(model, newValue) {
        if (_.isEmpty(newValue)) {
            this.stopListening(model, 'change.inputted:derivReferenceTime', changeOfDerivReferenceTime);
            model.set('derivReferenceTime', moment().format(fieldOptions.referenceTimeFormat));
            this.listenTo(model, 'change.inputted:derivReferenceTime', changeOfDerivReferenceTime);
        }
    };

    var notesFormView = ADK.UI.Form.extend({
        templateHelpers: function() {
            return {
                formatRelativeTime: function(dateString) {
                    if (dateString) {
                        // the moment 2.10.5+ way:
                        // return moment(dateString, 'YYYYMMDDHHmmss').calendar(null, {
                        //     sameDay: '[Today at] HH:mm',
                        //     nextDay: '[Tomorrow at] HH:mm',
                        //     nextWeek: 'dddd [at] HH:mm',
                        //     lastDay: '[Yesterday at] HH:mm',
                        //     lastWeek: '[Last] dddd [at] HH:mm'
                        // });

                        // the moment 2.7 way:
                        var calendarString = moment(dateString, 'YYYYMMDDHHmmss').calendar();
                        var match = calendarString.match(/AM|PM$/);
                        if (match && match.length === 1) {
                            var twelveHourTime = calendarString.substring(calendarString.length - 8).trim();
                            twelveHourTime = moment(twelveHourTime, 'h:mm a').format('HH:mm');
                            calendarString = calendarString.substring(0, calendarString.length - 8) + ' ' + twelveHourTime;
                        }
                        return calendarString;
                    }
                    return '';
                }
            };
        },
        fields: fields.getForm(fieldOptions),
        ui: {
            previewButton: '.control.note-preview',
            closeButton: '.control.note-close',
            deleteButton: '.control.note-delete',
            signButton: '.control.note-sign',
            textArea: '.control.noteBody',
            titles: '.control.documentDefUidUnique',
            selectNotesTitle: '#documentDefUidUnique',
            saveErrorBanner: '.saveErrorBanner'
        },
        events: {
            'mouseup @ui.closeButton': 'resetFocus',
            "submit": function(e) {
                e.preventDefault();
                this.onSaveSignForm(e, this);
            },
            "click @ui.previewButton": function(e) {
                e.preventDefault();
                this.onShowPreview(this, true);
            },
            "click @ui.closeButton": function(e) {
                e.preventDefault();
                this.onCloseForm(this, true);
            },
            'note-confirm-delete':'deleteNote'
        },
        modelEvents: {
            'change:documentDefUidUnique': 'addTitle',
            'change:derivReferenceDate': function() {
                this.calculateReferenceDateTime(this.model);
            },
            'change:derivReferenceTime': function() {
                this.calculateReferenceDateTime(this.model);
            },
            'change:noteBody': function(model, value) {
                this.model.get('text')[0].content = value;
            },
            'invalid': function() {
                this.transferFocusToFirstError();
                this.enableButtons();
            }
        },
        onInitialize: function() {
            this.notesChannel = ADK.Messaging.getChannel('notes');
            this.subtrayChannel = ADK.Messaging.getChannel('note-subtray');
            titleFetchDone = false;
            this.mode = '';
            var self = this;
            if (this.model.isNew()) {
                if (_.isNull(this.model.get('referenceDateTime'))) {
                    this.model.set({
                        derivReferenceDate: moment().format(fieldOptions.referenceDateFormat),
                        derivReferenceTime: moment().format(fieldOptions.referenceTimeFormat)
                    });
                    this.calculateReferenceDateTime(this.model);
                } else {
                    // For handling orphaned notes: In this case,
                    // user decides to create a new note from an
                    // orphaned note. The note has a reference
                    // date and time.
                    this.model = this.parseModel(this.model);
                }
            } else {
                this.model = this.parseModel(this.model);
                if (_.isUndefined(this.model.get('deriv_isEditForm'))) {
                    this.model.set("deriv_isEditForm", true);
                }
            }

            this.titles = new ADK.UIResources.Picklist.Notes.Titles();
            this.listenTo(this.titles, 'read:error', function() {
                this.showTitleError();
            });
            this.listenTo(this.titles, 'read:complete', function(collection) {
                titleFetchDone = true;
                this.updateForm(collection.toPicklist());
            });

            this.listenTo(this.notesChannel, 'note:close_form', function() {
                this.workflow.close();
            });
            this.listenTo(this.notesChannel, 'workflow:done', function() {
                this.showLoading();
            });

            this.listenTo(this.notesChannel, 'note:sign', function(model, mode) {
                if (model.isNew()) { // Save note if it's new and when it sign from preview modal
                    this.saveNote(false);
                }
                this.mode = mode;
                launchSignatureWorkflow(model);
            });

            this.listenTo(this.model, 'change.inputted:derivReferenceDate', changeOfDerivReferenceDate);
            this.listenTo(this.model, 'change.inputted:derivReferenceTime', changeOfDerivReferenceTime);
            this.listenTo(ADK.Messaging.getChannel('esignature'), 'esign:cancel', function() {
                if (this.mode === "preview") {
                    this.mode = '';
                    this.onShowPreview(this, true);
                }
            });
            var options = {
                roleNames: 'AUTHOR/DICTATOR',
                actionNames: 'ENTRY'
            };
            this.titles.fetch(options);
            this.startAutosave();
            this.isAutosaved = false;

            this.listenTo(ADK.Messaging.getChannel('notes').on('insert:text', _.bind(function(text) {
                this.$(this.ui.textArea.selector).trigger('control:insert:string', text);
            }, this)));
        },
        calculateReferenceDateTime: function(model) {
            var referenceDateTime = null;
            if (model.get('derivReferenceDate')) {
                var referenceDateTimeString = model.get('derivReferenceDate') + ' ' + model.get('derivReferenceTime');
                referenceDateTime = moment(referenceDateTimeString, 'MM/DD/YYYY HH:mm').format('YYYYMMDDHHmm');
            }
            model.set('referenceDateTime', referenceDateTime);
            var text = model.get('text');
            text[0].dateTime = referenceDateTime;
            model.set('text', text);
        },
        resetFocus: function(event) {
            event.preventDefault();
            this.notesChannel.trigger('tray:focus');
        },
        toggleDropdown: function(event) {
            event.preventDefault();
            event.stopPropagation();
            this.$('.dropdown').toggleClass('open');
        },
        showLoading: function() {
            if (!titleFetchDone) {
                this.$el.trigger('tray.loaderShow',{
                    loadingString:'Loading'
                });
            }
        },
        addTitle: function() {
            this.model.unset('asuPermissions', {
                silent: true
            });
            this.disableButtons();
            var documentDefUidUnique = this.model.get('documentDefUidUnique');
            if (documentDefUidUnique.length > 0) {
                var titleArray = documentDefUidUnique.split('---');
                var localTitle = titleArray[1].replace(/_/g, ' ');
                this.model.set({
                    'documentDefUid': titleArray[0],
                    'localTitle': localTitle
                });
                if (this.model.isNew()) {
                    this.isAutosaved = true;
                    this.saveNote(false, false, true, false);
                }
            } else {
                this.model.set({
                    'documentDefUid': null,
                    'localTitle': null
                }, {
                    silent: true,
                    unset: true
                });
                this.enableButtons();
            }
            // Make sure focus remains on the select component after selecting a note title.
            this.$el.find('#select2-' + this.ui.selectNotesTitle.prop('id') + '-container').closest('.select2-selection').focus();
            this.enableText();
            this.initTitlePermissions();
        },
        initTitlePermissions: function() {
            var titleArray = this.model.get('documentDefUidUnique') ? this.model.get('documentDefUidUnique').split('---') : [];
            var self = this;
            var titleModel = this.model.clone();
            if (this.model.isNew()) {
                var user = util.getUser();
                var author = util.getUserId();
                titleModel.set({
                    'text': [{
                        "authorUid": author
                    }],
                    'authorUid': author,
                    'status': 'UNSIGNED'
                });
            }
            //if a title is selected
            if (titleArray.length > 1) {
                //fetch title permissions if we don't already have them
                if (!_.isArray(self.model.get('asuPermissions'))) {
                    this.listenTo(titleModel, 'asu:permissions:success', function(perms) {
                        self.model.set('asuPermissions', perms);
                        if (!self.model.isNew()) {
                            self.enableButtons();
                        }
                        self.enforcePermissions();
                    });
                    util.getPermissions(titleModel, ['SIGNATURE', 'EDIT RECORD', 'DELETE RECORD', 'CHANGE TITLE']);
                } else {
                    if (!this.model.isNew()) {
                        self.enableButtons();
                    }
                    self.enforcePermissions();
                }
            } else {
                self.enforcePermissions();
            }
            this.$el.trigger('tray.loaderHide');
        },
        onClickActionButton: function(event) {
            event.preventDefault();
            event.stopPropagation();
        },
        onClickActionButton_Close: function() {
            var formClose = true;
            this.onCloseForm(this, formClose);
        },
        onClickActionButton_Save: function() {
            var formClose = false;
            this.onCloseForm(this, formClose);
        },
        onShowPreview: function() {
            var referenceDateTime = null;

            if (this.model.get('derivReferenceDate')) {
                var referenceDateTimeString = this.model.get('derivReferenceDate') + ' ' + this.model.get('derivReferenceTime');
                referenceDateTime = moment(referenceDateTimeString, 'MM/DD/YYYY HH:mm').format('YYYYMMDDHHmmss');
            }

            this.model.set('referenceDateTime', referenceDateTime);
            launchPreviewWorkflow(this.model);
        },
        registerChecks: function(model) {
            // Register Check once and only on valuable model attributes change
            if ((_.has(model.changed, "localTitle") || _.has(model.changed, "derivReferenceDate") || _.has(model.changed, "derivReferenceTime") || _.has(model.changed, "noteBody")) ) {
                var checkOptions = {
                    id: navigationCheckId,
                    label: 'Note',
                    failureMessage: 'Note Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                    onContinue: _.bind(function() {
                        this.workflow.close();
                    }, this)
                };
                ADK.Checks.unregister({
                    id: navigationCheckId
                });
                ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions),
                    new ADK.Checks.predefined.VisitContextCheck(checkOptions)
                ]);
                model.set("_isFormChanged", true, {
                    silent: true
                });
            }
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: navigationCheckId
            });
        },
        onRender: function() {
            var formView;
            if (!this.model.isNew()) {
                this.model.set('lastSavedDisplayTime', null);
            } else {
                this.model.set('lastSavedDisplayTime', util.formatRelativeTime(this.model.get('lastSavedTime')) || util.formatRelativeTime(this.model.get('lastUpdateTime')));
            }
            if (!ADK.UserService.hasPermission('sign-note')) {
                this.ui.signButton.addClass("hidden");
            }
            if (!ADK.UserService.hasPermission('edit-note')) {
                this.ui.closeButton.addClass("hidden");
            }
            this.subtrayChannel.reply('note:ready', _.bind(function() {
                return !!this.isEditReady();
            }, this));
            this.subtrayChannel.reply('note:model', _.bind(function() {
                return this.model;
            }, this));

            this.listenTo(this.model, 'change.inputted', this.registerChecks);
            this.initTitlePermissions();
        },
        onShow: function() {
            if (!_.isUndefined(this.model.id)) {
                var value = this.model.get('documentDefUidUnique');
                this.$el.find("#documentDefUidUnique").val(value);
            } else {
                this.ui.deleteButton.trigger('control:disabled', false);
            }
        },

        parseModel: function(model) {
            if (!_.isUndefined(model.get("referenceDateTime"))) {
                var referenceDateTime = moment(model.get("referenceDateTime"), 'YYYYMMDDHHmmssSSS');
                model.set({
                    'derivReferenceDate': referenceDateTime.format(fieldOptions.referenceDateFormat),
                    'derivReferenceTime': referenceDateTime.format(fieldOptions.referenceTimeFormat)
                });
            }

            if (!_.isUndefined(model.get("text"))) {
                var text = "";
                var arrText = model.get("text");
                _.each(arrText, function(item) {
                    if (!_.isUndefined(item.content)) text = text + item.content;
                });
                model.set("noteBody", text);
            }

            return model;
        },

        updateForm: function(options) {
            this.ui.titles.trigger('control:picklist:set', [options]);
            this.initTitlePermissions();
        },
        showTitleError: function() {
            var message = 'Unable to fetch note titles. Reopen the form to try again.';
            var titleErrorView = new ADK.UI.Notification({
                title: 'Error',
                message: message,
                type: 'info'
            });
            titleErrorView.show();
        },
        saveNote: function(formSign, formClose, formAuto, formCancel) {
            var self = this;
            this.disableButtons(!formAuto);
            this.doSaveNote(formSign, formClose, formAuto, formCancel);
        },
        doSaveNote: function(formSign, formClose, formAuto, formCancel) {
            if (formClose) {
                this.disableButtons(true,'Drafting');
            } else {
                this.disableButtons(!formAuto,'Saving');
            }

            if (!formCancel) {
                this.model.set('lastSavedTime', moment().format('YYYYMMDDHHmmss'));
            }
            formStatus = {
                formSign: formSign,
                formClose: formClose,
                formAuto: formAuto,
                formCancel: formCancel
            };
            var isNew = this.model.isNew();
            var perms = this.model.get('asuPermissions');
            this.model.unset('asuPermissions', {
                silent: true
            });
            var self = this;
            this.model.save(null, {
                error: function(model, resp) {
                    //re-set the permissions: they haven't changed.
                    //review
                    console.error('Note save error:', resp);
                    model.set('asuPermissions', perms);

                    // Show Alert Banner on errors unless we are autosaving
                    if (!formAuto) {
                        var displayMessage = 'The server encountered an internal error and was unable to complete your request. Try again later. ';
                        if (resp.responseJSON && resp.responseJSON.message) {
                            displayMessage += resp.responseJSON.message;
                        } else {
                            if (resp.responseText) {
                                if (resp.responseText.indexOf('ECONNREFUSED') > -1) {
                                    displayMessage += 'Server connection error.';
                                }
                                if (resp.responseText.indexOf('503 Service Temporarily Unavailable') > -1) {
                                    displayMessage += 'Service Temporarily Unavailable. Try again later.';
                                }
                            }
                        }
                        self.model.set('saveErrorBanner', displayMessage);
                        self.ui.saveErrorBanner.removeClass('hidden');
                        self.ui.saveErrorBanner.focus();
                    }
                    self.enableButtons(!formAuto);
                    self.enforcePermissions();
                },
                success: function(model, resp) {
                    //re-set the permissions: they haven't changed.
                    if (perms) {
                        model.set('asuPermissions', perms);
                    }
                    if (isNew) {
                        self.notesChannel.trigger('note:added', model);
                    } else {
                        self.notesChannel.trigger('note:updated', model);
                    }
                    model.set('lastSavedDisplayTime', util.formatRelativeTime(model.get('lastSavedTime')), {
                        silent: false
                    });
                    model.set("_isFormChanged", false, {
                        silent: true
                    });
                    if (formClose) {
                        self.workflow.close();
                    } else {
                        self.enableButtons(!formAuto);
                        self.enforcePermissions();
                    }
                    if (formAuto) {
                        self.unregisterChecks();
                        self.stopListening(self.model, 'change.inputted', self.registerChecks);
                        self.listenToOnce(self.model, 'change.inputted', self.registerChecks);
                    }
                    if (!formAuto && !formSign) {
                        var saveAlertView = new ADK.UI.Notification({
                            title: 'Success',
                            message: 'Note Draft Saved',
                            type: 'success'
                        });
                        saveAlertView.show();
                    }
                    if (formSign) {
                        self.notesChannel.trigger('note:sign', model);
                    } else {
                        ADK.Messaging.getChannel('tray-tasks').trigger('action:refresh');
                    }
                }
            });
        },
        autosaveNote: function() {
            if (!asuUtil.canDelete(this.model) || !asuUtil.canEdit(this.model) || !this.model.get('documentDefUid') || _.isEmpty(this.model.get('derivReferenceDate')) || _.isEmpty(this.model.get('derivReferenceTime'))) {
                // don't auto-save without title, date, or time
                // don't auto-save if user can't edit or delete the note.
                return;
                // } else if (ADK.Messaging.request('get:adkApp:region', 'alertRegion').hasView()) { --- we concluded not to check for errors on autosave while modals exist (see discussion in DE5084)
            } else {
                if (this.model.get("_isFormChanged") && this.model.isValid()) {
                    var formSign = false;
                    var formClose = false;
                    var formSilent = true;
                    this.isAutosaved = true;
                    this.saveNote(formSign, formClose, formSilent);
                }
            }
        },
        startAutosave: function() {
            this.autosaveTimer = setInterval(_.bind(this.autosaveNote, this), CONFIG.AUTOSAVE_INTERVAL);
        },
        stopAutosave: function() {
            clearInterval(this.autosaveTimer);
        },
        onCloseForm: function(form, closeForm) {
            var isCloseValid = this.model.isValid({
                validationType: 'close'
            });
            var keys = Object.keys(form.model.errorModel.attributes);
            if (keys.length) {
                var sel = '#' + keys[0];
                $(sel).focus();
            } else {
                this.saveNote(false, closeForm);
            }
            return false;
        },
        onDeleteNewForm: function() {
            var self = this;
            // new note form, data has been changed
            if (this.isAutosaved) {
                this.deleteNote();
            } else {
                var input = {
                    message: "Are you sure you want to delete?",
                    title: "Delete",
                    title_icon: "icon-delete",
                    yes_callback: function() { // close new note form
                        self.workflow.close();
                    },
                    no_callback: function() {}
                };
                var cancelConfirmationView = new ConfirmationView(input);
                cancelConfirmationView.showModal();
            }
        },
        deleteNote: function(event) {
            this.disableButtons();
            var self = this;
            util.deleteNote(this.model, {
                completeCallback: _.bind(this.enableButtons, this),
                successCallback: function(response) {
                    if (response && response.data.failedConsults) {
                        var alertView = new ADK.UI.Notification({
                            title: 'Consult Failed',
                            icon: 'icon-error',
                            message: 'One or more consults failed to disassociate.'
                        });
                        alertView.show();
                        console.error('Failed to disassociate consults. Failed consults object array: ', response.data.failedConsults);
                    }
                    self.workflow.close();
                }
            });
        },
        onSaveSignForm: function(e, form) {
            var isSubmitValid = form.model.isValid({
                validationType: 'sign'
            });
            var keys = Object.keys(form.model.errorModel.attributes);
            if (keys.length) {
                var sel = '#' + keys[0];
                $(sel).focus();
            } else {
                var closeForm = false;
                var formSignNote = true;
                this.saveNote(formSignNote, closeForm);
            }
            return false;
        },
        enforceAddForm: function() {
            //show the delete button, enable title select
            this.ui.deleteButton.removeClass('hidden');
            if (titleFetchDone) {
                this.ui.titles.trigger('control:disabled', false);
            }
        },
        enforceEditForm: function() {
            if (titleFetchDone && (asuUtil.canChangeTitle(this.model) || !this.model.get('documentDefUid'))) {
                this.ui.titles.trigger('control:disabled', false);
            } else {
                this.ui.titles.trigger('control:disabled', true);
            }
        },
        // Call this whenever you enableButtons (after) to hide buttons the user shouldn't be able to see
        enforcePermissions: function() {
            //if it has a title, check for sign permission
            if (this.model.get('documentDefUid') && this.model.get('documentDefUid').length) {
                if (!asuUtil.canSign(this.model)) {
                    this.ui.signButton.addClass('hidden');
                } else {
                    this.ui.signButton.removeClass('hidden');
                }
                if (!asuUtil.canEdit(this.model)) {
                    this.ui.closeButton.addClass('hidden');
                } else {
                    this.ui.closeButton.removeClass('hidden');
                }
            } else {
                //No title selected. Show, but disable, the sign button
                this.ui.signButton.removeClass('hidden');
                this.ui.closeButton.removeClass('hidden');
            }
            this.enableText();

            if (this.model.isNew()) {
                this.enforceAddForm();
            } else {
                this.enforceEditForm();
            }
        },
        isEditReady: function() {
            return this.model.get('localTitle') ? true && asuUtil.canEdit(this.model) : false;
        },
        enableText: function() {
            if (this.isEditReady()) {
                this.ui.textArea.trigger('control:disabled', false);
                this.informEditState(false);
            } else {
                this.ui.textArea.trigger('control:disabled', true);
                this.informEditState(true);

            }
        },
        informEditState: function(isDisabled) {
            if (isDisabled) {
                this.subtrayChannel.trigger('note:disabled');
            } else {
                this.subtrayChannel.trigger('note:enabled');
            }
        },
        disableButtons: function(showLoader,loaderMessage) {
            if (_.isUndefined(showLoader)){
                showLoader = true;
            }
            if (_.isUndefined(loaderMessage)){
                loaderMessage = 'Loading';
            }
            this.ui.previewButton.trigger('control:disabled', true);
            this.ui.closeButton.trigger('control:disabled', true);
            this.ui.signButton.trigger('control:disabled', true);
            this.ui.deleteButton.trigger('control:disabled', true);
            if (showLoader){
                this.$el.trigger('tray.loaderShow',{
                    loadingString:loaderMessage
                });
            }
        },
        enableButtons: function(hideLoader) {
            if (_.isUndefined(hideLoader)){
                hideLoader = true;
            }
            this.ui.previewButton.trigger('control:disabled', false);
            this.ui.closeButton.trigger('control:disabled', false); // Draft Button
            this.ui.signButton.trigger('control:disabled', false);
            this.ui.deleteButton.trigger('control:disabled', false);
            if (hideLoader){
                this.$el.trigger('tray.loaderHide');
            }
        },
        onBeforeDestroy: function() {
            this.unregisterChecks();
        },
        onDestroy: function() {
            this.stopAutosave();
            delete this.subtrayChannel;
        },
        onAttach: function() {
            if (this.$('#documentDefUidUnique').is(':visible')){
                this.$el.trigger('tray.loaderShow',{
                    loadingString:'Loading'
                });
            }
        }
    });
    return notesFormView;
});