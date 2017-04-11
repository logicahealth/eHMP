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
    'app/applets/notes/writeback/formUtil'
], function(Backbone, Marionette, $, Handlebars, moment, fields, util, ErrorView, ConfirmationView, SignatureUtil, asuUtil, PreviewView, FormUtil) {
    'use strict';
    var formStatus = {
        formSign: false,
        formClose: false,
        formAuto: false,
        formCancel: false
    };
    var AUTOSAVE_INTERVAL = 90000; // 90 seconds
    //var AUTOSAVE_INTERVAL = 60000; // 1 min for testing

    var hasLastSelectedTitle = false;
    var PREVIEW = 0;
    var SIGN = 1;

    var fieldOptions = {
        referenceDateFormat: 'MM/DD/YYYY',
        referenceTimeFormat: 'HH:mm'
    };
    function launchPreviewWorkflow(model) {

        var workflowOptions = {
            title: "Preview Progress Note",
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
            stepTitle: 'Preview Progress Note',
            onBeforeShow: function() {
                workflow.changeHeaderTitle('Preview Progress Note');
                workflow.headerModel.unset('actionItems');

                util.formatTextContent(model);
                model.set('hideEditButtonOnPreview', true);
                model.openTrayOnDestroy = true;
                util.setEncounterDisplayName(model);
            }
        });

        var workflow = new ADK.UI.Workflow(workflowOptions);
        workflow.show();
    }
    function launchSignatureWorkflow(model) {
        var NotesSignModel = ADK.UIResources.Writeback.ESignature.Model.extend({
                resource: 'notes-sign',
                getUrl: function(method, options) {
                        var url,
                        opts = _.extend({
                                'params': this.params
                                }, options),
                    patient = ADK.ResourceService.patientRecordService.getCurrentPatient(),
                    params = {
                        pid: patient.get('pid')
                    },
                            criteria = options.criteria || {},
                    resource = this.resource;

                    _.extend(params, _.isFunction(opts.params) ? opts.params.apply(this, arguments) : opts.params);
                    if (patient.has("acknowledged")) {
                        criteria._ack = true;
                    }

                    url = ADK.ResourceService.buildUrl(resource, criteria);
                    url = ADK.ResourceService.replaceURLRouteParams(url, params);
                    return url.replace(/\/+/g, '/').replace(/\?$/, ''); //replace multiple /'s with one and remove trailing '?'
                },
                parse: function(resp) {
                    var successes = resp.data.successes;
                    if (successes && successes.signedNotes && successes.signedNotes.length > 0) {
                        var count = 0;
                        _.each(successes.signedNotes, function(item) {
                            if (item._labelsForSelectedValues) {
                                delete item._labelsForSelectedValues;
                            }
                            _.extend(item,{
                                id: item.uid,
                                app:  'ehmp',
                                displayGroup: 'signed',
                                documentDefUidUnique: util.generateDocumentDefUidUnique(item, 'all')
                            });
                        });
                    resp.data.successes = new ADK.UIResources.Writeback.Notes.SignedNotes(successes.signedNotes);
                    }
                return resp.data;
            }
        });

        var formModel,
             NoteModel = ADK.UIResources.Writeback.Notes.Model;

        if (_.isUndefined(model) || _.isNull(model)) {
            formModel = new NoteModel({
                'app': 'ehmp',
                'author': ADK.UserService.getUserSession().get('lastname') + ',' + ADK.UserService.getUserSession().get('firstname')
            });
        } else {
            formModel = model;
        }

        formModel.set('value', true); // for signing
            //openTrayOnDestroy = !_.isUndefined(notesFormOptions.openTrayOnDestroy) ? notesFormOptions.openTrayOnDestroy : true,
        formModel.openTrayOnDestroy = true; //openTrayOnDestroy;
        var signCollection = new Backbone.Collection([formModel]);
        SignatureUtil.addAttributes(signCollection);
        var signModel = new NotesSignModel({
            itemChecklist: signCollection
        });

        var workflowOptions = {
            title: "Sign Note",
            size: "medium",
            backdrop: true,
            showProgress: false,
            keyboard: true,
            headerOptions: undefined,
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
                workflow.changeHeaderTitle('Sign');
                workflow.headerModel.unset('actionItems');
                workflow.changeHeaderCloseButtonOptions({
                    title: 'Cancel',
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
            textArea: '#text-0-content',
            titles: '.control.documentDefUidUnique'
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
            'click @ui.deleteButton': 'deleteNote'
        },
        modelEvents: {
            'change:documentDefUidUnique': 'addTitle',
            'change:derivReferenceDate': function(e) {
                var self = this;
                setTimeout(function() {
                    if (_.isEmpty(self.model.get('derivReferenceDate'))) { // if the date was cleared out, reset to today
                        self.model.set('derivReferenceDate', moment().format(fieldOptions.referenceDateFormat));
                    }
                }, 0);
                this.calculateReferenceDateTime(this.model);
            },
            'change:derivReferenceTime': function(e) {
                var self = this;
                setTimeout(function() {
                    if (_.isEmpty(self.model.get('derivReferenceTime'))) { // if the time was cleared out, reset to "now"
                        self.model.set('derivReferenceTime', moment().format(fieldOptions.referenceTimeFormat));
                    }
                }, 0);
                this.calculateReferenceDateTime(this.model);
            },
            'invalid': function() {
                this.transferFocusToFirstError();
                this.enableButtons();
            }
        },
        onInitialize: function() {
            this.notesChannel = ADK.Messaging.getChannel('notes');
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
                this.updateForm(collection.toPicklist());
            });

            this.listenTo(this.notesChannel, 'note:close_form', function() {
                this.workflow.close();
            });
            this.listenTo(this.notesChannel, 'note:sign', function(model, mode) {
                if (model.isNew()) { // Save note if it's new and when it sign from preview modal
                    this.saveNote(false);
                }
                this.mode = mode;
                launchSignatureWorkflow(model);
            });
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
            $('#notes-tray').focus();
        },
        toggleDropdown: function(event) {
            event.preventDefault();
            event.stopPropagation();
            this.$('.dropdown').toggleClass('open');
        },
        addTitle: function() {
            this.ui.titles.trigger('control:disabled', true);
            this.model.unset('asuPermissions', {silent: true});
            this.disableButtons();
            var documentDefUidUnique = this.model.get('documentDefUidUnique');
            if (documentDefUidUnique.length > 0) {
                var titleArray = documentDefUidUnique.split('---');
                var localTitle = titleArray[1].replace(/_/g, ' ');
                this.model.set({
                    'documentDefUid': titleArray[0],
                    'localTitle': localTitle
                });
            } else {
                this.enableButtons();
            }
            this.enableText();
            this.initTitlePermissions();
        },
        initTitlePermissions:function() {
            var titleArray = this.model.get('documentDefUidUnique').split('---');
            var self = this;
            var titleModel = this.model.clone();
            if (this.model.isNew()) {
                var user = util.getUser();
                var author = util.getUserId();
                titleModel.set({
                    'text':[{"authorUid":author}],
                    'authorUid': author,
                    'status': 'UNSIGNED'
                });
            }
            //if a title is selected
            if (titleArray.length > 1 ) {
                //fetch title permissions if we don't already have them
                if(!self.model.get('asuPermissions')) {
                    this.listenTo(titleModel, 'asu:permissions:success', function(perms) {
                        self.model.set('asuPermissions', perms);
                        self.enableButtons();
                        self.enforcePermissions();
                    });
                    util.getPermissions(titleModel);
                } else {
                    self.enableButtons();
                    self.enforcePermissions();
                }
            } else {
                self.enforcePermissions();
            }
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
                model.set("derivBody", text);
            }

            return model;
        },

        updateForm: function(options) {
            this.ui.titles.trigger('control:picklist:set', [options]);
            var value = this.model.get('documentDefUidUnique');
            if (value !== null && value !== undefined && value !== '') {
                this.ui.titles.find('#documentDefUidUnique').val(value);
                hasLastSelectedTitle = true;
            } else {
                this.ui.titles.find('#documentDefUidUnique').trigger('change');
            }
            this.initTitlePermissions();
        },
        showTitleError: function() {
            var message = 'Unable to fetch note titles. Please reopen the form to try again.';
            var titleErrorView = new ADK.UI.Notification({
                title: 'Warning',
                message: message,
                type: 'warning'
            });
            titleErrorView.show();
        },
        saveNote: function(formSign, formClose, formAuto, formCancel) {
            var self = this;
            this.disableButtons();
            this.doSaveNote(formSign, formClose, formAuto, formCancel);
        },
        doSaveNote: function(formSign, formClose, formAuto, formCancel) {
            this.disableButtons();

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
            this.model.unset('asuPermissions', {silent: true});
            var self = this;
            this.model.save(null, {
                error: function(model, resp) {
                    //re-set the permissions: they haven't changed.
                    //review
                    model.set('asuPermissions', perms);
                    var displayMessage = 'There was an error saving your note. Please contact your System Administrator for assistance.';
                    if (resp.responseJSON && resp.responseJSON.message) {
                        displayMessage += '<br><b>' + resp.responseJSON.message;
                    }

                    var input = {
                        message: displayMessage,
                        ok_callback: function() {
                            if (formStatus.formClose && formStatus.formAuto) {
                                self.workflow.close();
                            }
                        }
                    };
                    var saveErrorView = new ErrorView(input);
                    saveErrorView.showModal();

                    //if (!formClose) {
                        self.enableButtons();
                    //}
                },
                success: function(model, resp) {
                    //re-set the permissions: they haven't changed.
                    model.set('asuPermissions', perms);
                    if (isNew) {
                        self.notesChannel.trigger('note:added', model);
                    } else {
                        self.notesChannel.trigger('note:updated', model);
                    }
                    model.set('lastSavedDisplayTime', util.formatRelativeTime(model.get('lastSavedTime')), {
                        silent: false
                    });
                    if (formClose) {
                        self.workflow.close();
                    } else {
                        self.enableButtons();
                        self.enforcePermissions();
                    }
                    if (!formAuto) {
                        var saveAlertView = new ADK.UI.Notification({
                            title: 'Note Saved',
                            icon: 'fa-check',
                            message: 'Note successfully saved with no errors.',
                            type: 'success'
                        });
                        saveAlertView.show();
                    }
                    if (formSign) {
                         self.notesChannel.trigger('note:sign', model);
                    }
                }
            });
        },
        updateVisit: function() {
            if (!this.model.get('encounterUid')) {
                var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                if (visit && visit.name) {
                    this.model.set({
                        'encounterName': visit.locationDisplayName + visit.formatteddateTime,
                        'encounterUid': visit.localId,
                        'locationUid': visit.locationUid,
                        'encounterDateTime': visit.dateTime,
                        'facilityCode': visit.facilityCode,
                        'facilityName': visit.facilityName,
                        'facilityDisplay': visit.facilityDisplay,
                        'facilityMoniker': visit.facilityMoniker
                    });
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        },
        autosaveNote: function() {
            var self = this;
            if (!asuUtil.canDelete(this.model) || !asuUtil.canEdit(this.model) || !this.model.get('documentDefUid') || _.isEmpty(this.model.get('derivReferenceDate')) || _.isEmpty(this.model.get('derivReferenceTime'))) {
                // don't auto-save without title, date, or time
                // don't auto-save if user can't edit or delete the note.
                return;
            } else {
                var formSign = false;
                var formClose = false;
                var formSilent = true;
                this.isAutosaved = true;
                this.saveNote(formSign, formClose, formSilent);
            }
        },
        startAutosave: function() {
            this.autosaveTimer = setInterval(_.bind(this.autosaveNote, this), AUTOSAVE_INTERVAL);
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
                    message: "This note cannot be retrieved once it is deleted. Please select Cancel to return back to the form, or Continue to proceed with deleting.",
                    title: "Delete Note",
                    title_icon: "fa-warning color-red",
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
            util.deleteNoteWithPrompt(this.model, {
                completeCallback: _.bind(this.enableButtons, this),
                successCallback: function() {
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
            this.ui.titles.trigger('control:disabled', false);
        },
        enforceEditForm: function() {
            this.ui.deleteButton.addClass('hidden');
            if (this.model.get('documentDefUid') && this.model.get('documentDefUid').length) {
                if (asuUtil.canDelete(this.model)) {
                    this.ui.deleteButton.removeClass('hidden');
                }
            }
            if (asuUtil.canChangeTitle(this.model)) {
                this.ui.titles.trigger('control:disabled', false);
            } else {
                this.ui.titles.trigger('control:disabled', true);
            }
        },

        enforcePermissions: function() {
            //if it has a title, check for sign permisson
            if (this.model.get('documentDefUid') && this.model.get('documentDefUid').length) {
                if (!asuUtil.canSign(this.model)) {
                    this.ui.signButton.addClass('hidden');
                } else {
                    this.ui.signButton.removeClass('hidden');
                }
            } else {
                //No title selected. Show, but disable, the sign button
                this.ui.signButton.removeClass('hidden');
            }
            this.enableText();

            if (this.model.isNew()) {
                this.enforceAddForm();
            } else {
                this.enforceEditForm();
            }
        },
        enableText: function() {
            if (this.model.get('localTitle')) {
                this.ui.textArea.trigger('control:disabled', false);
            } else {
                this.ui.textArea.trigger('control:disabled', true);
            }
        },
        disableButtons: function() {
            this.ui.previewButton.trigger('control:disabled', true);
            this.ui.closeButton.trigger('control:disabled', true);
            this.ui.signButton.trigger('control:disabled', true);
            this.ui.deleteButton.trigger('control:disabled', true);
            this.$el.closest('.workflow-container').find('.workflow-header .close').attr('disabled', 'disabled');
        },
        enableButtons: function() {
            this.ui.previewButton.trigger('control:disabled', false);
            this.ui.closeButton.trigger('control:disabled', false);
            this.ui.signButton.trigger('control:disabled', false);
            this.ui.deleteButton.trigger('control:disabled', false);
            this.$el.closest('.workflow-container').find('.workflow-header .close').removeAttr('disabled');
        },
        onDestroy: function() {
            this.stopAutosave();

            if (this.model.openTrayOnDestroy) {
                this.notesChannel.trigger('tray:open');
            }
        }
    });
    return notesFormView;
});