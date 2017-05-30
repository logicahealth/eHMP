define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    'app/applets/notes/writeback/addendumFormFields',
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

    var fieldOptions = {
        referenceDateFormat: 'MM/DD/YYYY',
        referenceTimeFormat: 'HH:mm'
    };
    var channel = ADK.Messaging.getChannel('note-addendum');
    var notesChannel = ADK.Messaging.getChannel('notes');

    var navigationCheckId = 'addendum-writeback-in-progress';

    function launchPreviewWorkflow(model) {
        var workflowOptions = {
            title: CONFIG.PREVIEW_TITLE,
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
            stepTitle: CONFIG.PREVIEW_TITLE,
            onBeforeShow: function() {
                workflow.changeHeaderTitle(CONFIG.PREVIEW_TITLE);
                workflow.headerModel.unset('actionItems');
                model.openTrayOnDestroy = true;
            },
            helpMapping: 'notes_preview_form'
        });

        var workflow = new ADK.UI.Workflow(workflowOptions);
        workflow.show();
    }

    function launchSignatureWorkflow(model) {
        var formModel;
        var AddendumModel = ADK.UIResources.Writeback.Addendum.Model;

        if (_.isUndefined(model) || _.isNull(model)) {
            formModel = new AddendumModel({
                'app': 'ehmp',
                'author': ADK.UserService.getUserSession().get('lastname') + ',' + ADK.UserService.getUserSession().get('firstname')
            });
        } else {
            formModel = model;
        }

        formModel.set('value', true);
        formModel.openTrayOnDestroy = true; //openTrayOnDestroy;
        var signCollection = new Backbone.Collection([formModel]);
        SignatureUtil.addAttributes(signCollection);
        var signModel = new ADK.UIResources.Writeback.Addendum.AddendumSignModel({
            itemChecklist: signCollection
        });
        signModel.set('successEvents', [{
            messagingChannel: 'notes',
            messagingEventName: 'addendum:signed'
        }, {
            messagingChannel: 'tray-tasks',
            messagingEventName: 'action:refresh'
        }]);

        var workflowOptions = {
            title: "Sign Addendum",
            size: "medium",
            backdrop: true,
            showProgress: false,
            keyboard: true,
            headerOptions: undefined,
            steps: [],
        };

        var ParentSignView = ADK.utils.appletUtils.getAppletView('esignature', 'signature');
        var AddendumSignView = ParentSignView.extend({
            returnStep: 0,
            checklistOptions: {
                label: 'Addenda',
                itemTemplate: "<strong>{{localTitle}}</strong>{{#if addendumDerivReferenceDate}} - <span class='date-taken'>{{addendumDerivReferenceDate}}</span>{{/if}}{{#if addendumDerivReferenceTime}}<span class='time-taken'> {{addendumDerivReferenceTime}}</span>{{/if}}",
                formUid: 'uid'
            },
            initialize: function() {
                this.listenTo(this.model, 'create:success', function(model) {
                    ADK.UI.Workflow.hide();
                    var successes = this.model.get('successes');
                    if (successes.length > 0) {
                        this.workflow.close();
                        ADK.Messaging.getChannel('notes').trigger('addendum:close_form');
                    }
                });
                ParentSignView.prototype.initialize.apply(this, arguments);
            },
        });
        workflowOptions.steps.push({
            view: AddendumSignView,
            viewModel: signModel,
            stepTitle: 'E-Signature',
            helpMapping: 'notes_esig_form',
            onBeforeShow: function() {
                workflow.changeHeaderTitle('Sign');
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

    var changeOfAddendumDerivReferenceDate = function(model, newValue){
       if (_.isEmpty(newValue)){
          this.stopListening(model, 'change.inputted:addendumDerivReferenceDate', changeOfAddendumDerivReferenceDate);
          model.set('addendumDerivReferenceDate', moment().format(fieldOptions.referenceDateFormat));
          this.listenTo(model, 'change.inputted:addendumDerivReferenceDate', changeOfAddendumDerivReferenceDate);
       }
    };
    
    var changeOfAddendumDerivReferenceTime = function(model, newValue){
       if (_.isEmpty(newValue)){
          this.stopListening(model, 'change.inputted:addendumDerivReferenceTime', changeOfAddendumDerivReferenceTime);
          model.set('addendumDerivReferenceTime', moment().format(fieldOptions.referenceTimeFormat));
          this.listenTo(model, 'change.inputted:addendumDerivReferenceTime', changeOfAddendumDerivReferenceTime);
       }
    };
    
    var addendumFormView = ADK.UI.Form.extend({
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
            previewButton: '.control.addendum-preview',
            closeButton: '.control.addendum-close',
            deleteButton: '.control.addendum-delete',
            signButton: '.control.addendum-sign',
            textArea: '.addendumBody textarea',
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
                util.prepareUnsignedAddendumForPreview(this.model, this.parent);
                util.previewAddendaAddWarningBanner(this.parent);
                util.formatSignatureContent(this.parent);
                util.formatTextContent(this.parent);
                launchPreviewWorkflow(this.parent);
            },
            "click @ui.closeButton": function(e) {
                e.preventDefault();
                this.onCloseForm(this, true);
            },
            'click @ui.deleteButton': 'deleteAddendum'
        },
        modelEvents: {
            'change:addendumDerivReferenceDate': function() {
                this.calculateReferenceDateTime(this.model);
            },
            'change:addendumDerivReferenceTime': function() {
                this.calculateReferenceDateTime(this.model);
            },
            'change:addendumBody': function(model, value) {
                this.model.get('text')[0].content = value;
            },
            'invalid': function() {
                this.transferFocusToFirstError();
                this.enableButtons();
            }
        },
        onInitialize: function() {
            if (this.model.isNew()) {
                if (_.isNull(this.model.get('referenceDateTime'))) {
                    this.model.set({
                        addendumDerivReferenceDate: moment().format(fieldOptions.referenceDateFormat),
                        addendumDerivReferenceTime: moment().format(fieldOptions.referenceTimeFormat)
                    });
                    this.calculateReferenceDateTime(this.model);
                }
            } else {
                this.model = this.parseModel(this.model);
                if (_.isUndefined(this.model.get('deriv_isEditForm'))) {
                    this.model.set("deriv_isEditForm", true);
                }
            }
            this.listenTo(this.model, 'change.inputted:addendumDerivReferenceDate', changeOfAddendumDerivReferenceDate);
            this.listenTo(this.model, 'change.inputted:addendumDerivReferenceTime', changeOfAddendumDerivReferenceTime);
            this.listenTo(notesChannel, 'addendum:close_form', function() {
                this.workflow.close();
            });
            this.listenTo(notesChannel, 'addendum:sign', function(model) {
                if (model.isNew()) { // Save addendum if it's new
                    this.saveAddendum(false);
                }
                launchSignatureWorkflow(model);
            });
            this.startAutosave();
            this.isAutosaved = false;
            this.parent = this.model.get('noteModel');
        },
        calculateReferenceDateTime: function(model) {
            var referenceDateTime = null;
            if (model.get('addendumDerivReferenceDate')) {
                var referenceDateTimeString = model.get('addendumDerivReferenceDate') + ' ' + model.get('addendumDerivReferenceTime');
                referenceDateTime = moment(referenceDateTimeString, 'MM/DD/YYYY HH:mm').format('YYYYMMDDHHmm');
            }
            model.set('referenceDateTime', referenceDateTime);
            var text = _.clone(model.get('text'));
            text[0].dateTime = referenceDateTime;
            model.set('text', text);
        },
        resetFocus: function(event) {
            event.preventDefault();
            notesChannel.trigger('tray:focus');
        },
        toggleDropdown: function(event) {
            event.preventDefault();
            event.stopPropagation();
            this.$('.dropdown').toggleClass('open');
        },
        onClickActionButton: function(event) {
            event.preventDefault();
            event.stopPropagation();
        },
        registerChecks: function(model) {
            var checkOptions = {
                id: navigationCheckId,
                label: 'Note',
                failureMessage: 'Addendum Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function(){
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions),
                new ADK.Checks.predefined.VisitContextCheck(checkOptions)]);
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: navigationCheckId
            });
        },
        checkFormChanges: function(model) {
            if ((_.has(model.changed, "addendumDerivReferenceDate") || _.has(model.changed, "addendumDerivReferenceTime") || _.has(model.changed, "addendumBody")) && (!model.get("_isFormChanged"))){
                model.set("_isFormChanged", true, {silent: true});
            }
        },
        onRender: function() {
            this.disableButtons();
            this.initPermissions();
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
            this.listenTo(this.model, 'change.inputted', this.checkFormChanges);
            channel.reply('model', this.model);
        },
        parseModel: function(model) {
            if (!_.isUndefined(model.get("referenceDateTime"))) {
                var referenceDateTime = moment(model.get("referenceDateTime"), 'YYYYMMDDHHmmssSSS');
                model.set({
                    'addendumDerivReferenceDate': referenceDateTime.format(fieldOptions.referenceDateFormat),
                    'addendumDerivReferenceTime': referenceDateTime.format(fieldOptions.referenceTimeFormat)
                });
            }

            if (!_.isUndefined(model.get("text"))) {
                var text = "";
                var arrText = model.get("text");
                _.each(arrText, function(item) {
                    if (!_.isUndefined(item.content)) text = text + item.content;
                });
                model.set("addendumBody", text);
            }

            return model;
        },

        saveAddendum: function(formSign, formClose, formAuto, formCancel) {
            this.doSaveAddendum(formSign, formClose, formAuto, formCancel);
        },
        doSaveAddendum: function(formSign, formClose, formAuto, formCancel) {
            var isNew = this.model.isNew();
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
            var noteModel = this.model.get('noteModel');
            //var noteTitle = noteModel.get('localTitle');
            this.model.unset('noteModel', {silent: true});
            //this.model.set('localTitle', noteTitle);

            var perms = this.model.get('asuPermissions');
            this.model.unset('asuPermissions', {silent: true});
            var self = this;
            this.model.save(null, {
                error: function(model, resp) {
                    console.error('Note addendum save error:', resp);
                    model.set({
                        noteModel: noteModel,
                        asuPermissions: perms
                    });

                    // Show Alert Banner on errors unless we are autosaving
                    if (!formAuto) {
                        var displayMessage = 'The server encountered an internal error and was unable to complete your request. Try again later. ';
                        if (resp.responseJSON && resp.responseJSON.message) {
                            displayMessage += resp.responseJSON.message;
                        } else {
                            if (resp.responseText) {
                                if (resp.responseText.indexOf('ECONNREFUSED') > -1){
                                    displayMessage += 'Server connection error.';
                                }
                                if (resp.responseText.indexOf('503 Service Temporarily Unavailable') > -1){
                                    displayMessage += 'Service Temporarily Unavailable. Try again later.';
                                }
                            }
                        }
                        self.model.set('saveErrorBanner', displayMessage);
                        self.ui.saveErrorBanner.removeClass('hidden');
                        self.ui.saveErrorBanner.focus();
                    }

                    self.enableButtons();
                },
                success: function(model, resp) {
                    model.set({
                        noteModel: noteModel,
                        asuPermissions: perms
                    });
                    notesChannel.trigger('addendum:added', model);
                    model.set('lastSavedDisplayTime', util.formatRelativeTime(model.get('lastSavedTime')), {
                        silent: false
                    });
                    model.set("_isFormChanged", false, {silent: true});
                    if (formClose) {
                        self.workflow.close();
                    } else {
                        self.enableButtons();
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
                            message: 'Addendum Saved',
                            type: 'success'
                        });
                        saveAlertView.show();
                    }
                    if (formSign) {
                         notesChannel.trigger('addendum:sign', model);
                    } else {
                        ADK.Messaging.getChannel('tray-tasks').trigger('action:refresh');
                    }
                }
            });
        },
        autosaveAddendum: function() {
            var perms = this.model.get('asuPermissions');

            if (!_.includes(perms, 'DELETE RECORD') || !_.includes(perms, 'EDIT RECORD') || _.isEmpty(this.model.get('addendumDerivReferenceDate')) || _.isEmpty(this.model.get('addendumDerivReferenceTime'))) {
                // don't auto-save without date or time
                // don't auto-save is user can't edit or delete the addendum
                return;
         // } else if (ADK.Messaging.request('get:adkApp:region', 'alertRegion').hasView()) { --- we concluded not to check for errors on autosave while modals exist (see discussion in DE5084)
            } else {
                if (this.model.get("_isFormChanged") && this.model.isValid()){
                    var formSign = false;
                    var formClose = false;
                    var formSilent = true;
                    this.isAutosaved = true;
                    this.saveAddendum(formSign, formClose, formSilent);
                }
            }
        },
        startAutosave: function() {
            this.autosaveTimer = setInterval(_.bind(this.autosaveAddendum, this), CONFIG.AUTOSAVE_INTERVAL);
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
                this.saveAddendum(false, closeForm);
            }
            return false;
        },
        deleteAddendum: function(event) {
            this.disableButtons();
            var self = this;
            util.deleteAddendumWithPrompt(this.model, {
                completeCallback: _.bind(this.enableButtons, this),
                successCallback: function() {
                    self.workflow.close();
                    notesChannel.trigger('addendum:deleted', self.model);
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
                var formSignAddendum = true;
                this.saveAddendum(formSignAddendum, closeForm);
            }
            return false;
        },
        initPermissions:function() {
            if (!this.model.attributes.hasOwnProperty('asuPermissions')) {
                var titleModel = this.model.clone();
                var user = ADK.UserService.getUserSession();
                var site = user.get('site');
                var authorUid = 'urn:va:user:' +site+ ':' +user.get('duz')[user.get('site')];
                titleModel.set('authorUid', authorUid);
                this.listenTo(titleModel, 'asu:permissions:success', function(perms) {
                    this.model.set('asuPermissions', perms);
                    this.enableButtons();
                    this.enforcePermissions();
                });
                util.getPermissions(titleModel, ['SIGNATURE','EDIT RECORD','DELETE RECORD']);
            } else {
                this.enableButtons();
                this.enforcePermissions();
            }
        },

        enforcePermissions: function() {
            var perms = this.model.get('asuPermissions');
            if (_.includes(perms, 'SIGNATURE')) {
                this.ui.signButton.removeClass('hidden');
            } else {
                this.ui.signButton.addClass('hidden');
            }

            if (this.model.isNew()) {
                this.ui.deleteButton.removeClass('hidden');
            } else {
                if (_.includes(perms, 'DELETE RECORD')) {
                    this.ui.deleteButton.removeClass('hidden');
                } else {
                    this.ui.deleteButton.addClass('hidden');
                }
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
            this.$el.closest('.workflow-container').find('.workflow-header .close').attr('disabled', 'disabled');
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
            this.ui.closeButton.trigger('control:disabled', false);
            this.ui.signButton.trigger('control:disabled', false);
            this.ui.deleteButton.trigger('control:disabled', false);
            this.$el.closest('.workflow-container').find('.workflow-header .close').removeAttr('disabled');
            if (hideLoader){
                this.$el.trigger('tray.loaderHide');
            }
        },
        onBeforeDestroy: function() {
            this.unregisterChecks();
        },
        onDestroy: function() {
            this.stopAutosave();

            // if (this.model.openTrayOnDestroy) {
            //     ADK.Messaging.getChannel('notes').trigger('tray:open');
            // }
        }
    });
    return addendumFormView;
});
