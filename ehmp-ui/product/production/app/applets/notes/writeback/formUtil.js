define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/notes/writeback/noteForm',
    'app/applets/notes/preview/preview',
    'app/applets/notes/writeback/signatureUtil',
    'app/applets/notes/writeback/operationConfirmationView',
    'app/applets/notes/writeback/modelUtil'
], function(Backbone, Marionette, _, NoteForm, PreviewView, SignatureUtil, ConfirmationView, ModelUtil) {
    'use strict';

    var channel = ADK.Messaging.getChannel('notes');

    var notesFormHeaderOptions = {
        actionItems: [],
        closeButtonOptions: {
            title: 'Press enter to save and close note',
            onClick: function() {
                // This being the current form view that is shown
                if (_.isFunction(this.onClickActionButton_Close)) {
                    this.onClickActionButton_Close();
                }
            }
        }
    };

    var formUtil = {
        /*  This method launches the Note form. The form could consists of a
         *  maximum of four steps.
         *
         *  Step 1: Encounter Location (depends on the showVisit argument)
         *  Step 2: Note form
         *  Step 3: Preview
         *  Step 4: eSignature
         *
         *  Options:
         *                  model: The model that is being used with the view
         *              showVisit: boolean to determine whether or not to include the visit
         *                         form in the workflow
         *                 isEdit: boolean to determine whether or not the note form is for a
         *                         new note or an existing note
         *      openTrayOnDestroy: boolean to determine if the tray should open when
         *                         the note form is destroyed
         */
        launchNoteForm: function(notesFormOptions) {
            var model = notesFormOptions.model,
                showVisit = !_.isUndefined(notesFormOptions.showVisit) ? notesFormOptions.showVisit : true,
                isEdit = !_.isUndefined(notesFormOptions.isEdit) ? notesFormOptions.isEdit : false,
                openTrayOnDestroy = !_.isUndefined(notesFormOptions.openTrayOnDestroy) ? notesFormOptions.openTrayOnDestroy : true,
                noteFormStepNumber,
                formModel,
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
            formModel.openTrayOnDestroy = openTrayOnDestroy;

            var workflowOptions = {
                title: "Change Current Encounter",
                size: "medium",
                showProgress: false,
                keyboard: true,
                headerOptions: undefined,
                steps: []
            };

            if (showVisit) {
                var EncounterView = ADK.utils.appletUtils.getAppletView('visit', 'writeback');
                ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, EncounterView.extend({
                    inTray: true
                }));
            }

            if (workflowOptions.steps.length > 0) {
                noteFormStepNumber = 1;
            } else {
                noteFormStepNumber = 0;
            }

            var writebackView = NoteForm;

            var workflow;
            var self = this;
            workflowOptions.steps.push({
                view: writebackView,
                viewModel: formModel,
                stepTitle: 'Step 2',
                showHeader: false,
                onBeforeShow: function() {
                    if (isEdit) {
                        workflow.changeHeaderTitle('Edit Note');
                    } else {
                        workflow.changeHeaderTitle('New Note');
                    }

                    workflow.changeHeaderActionItems(notesFormHeaderOptions.actionItems);
                    workflow.changeHeaderCloseButtonOptions(notesFormHeaderOptions.closeButtonOptions);

                    if (!isEdit) {
                        // Set visit info
                        var model = workflow.workflowControllerView.getCurrentFormView().model;
                        if (!formModel.get('encounterUid')) {
                            var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                            if (!_.isUndefined(visit)) {
                                formModel.set({
                                    'encounterName': visit.formatteddateTime && visit.locationDisplayName + visit.formatteddateTime || visit.locationDisplayName,
                                    'encounterServiceCategory': visit.serviceCategory,
                                    'locationIEN': visit.locationIEN,
                                    'encounterDateTime': visit.visitDateTime || ''
                                });

                                ModelUtil.setEncounterDisplayName(formModel);
                            }
                        }
                    }
                }
            }, {
                view: PreviewView,
                viewModel: formModel,
                stepTitle: 'Progress Note',
                onBeforeShow: function() {
                    workflow.changeHeaderTitle('Progress Note');
                    workflow.headerModel.unset('actionItems');
                    workflow.changeHeaderCloseButtonOptions({
                        title: 'Close',
                        onClick: function(e) {
                            e.preventDefault();
                            ADK.UI.Alert.hide();
                            this.workflow.goToIndex(noteFormStepNumber);
                        }
                    });
                }
            });
            workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show({
                inTray: 'notes'
            });
        },
        launchPreviewForm: function(model) {
            var workflowOptions = {
                title: "Preview Progress Note",
                size: "large",
                backdrop: true,
                showProgress: false,
                keyboard: true,
                headerOptions: undefined,
                steps: []
            };

            workflowOptions.steps.push({
                view: PreviewView,
                viewModel: model,
                stepTitle: 'Progress Note',
                onBeforeShow: function() {
                    workflow.changeHeaderTitle('Preview Progress Note');
                    workflow.headerModel.unset('actionItems');
                    workflow.changeHeaderCloseButtonOptions({
                        title: 'Close',
                        onClick: function(e) {
                            e.preventDefault();
                            ADK.UI.Workflow.hide();
                        }
                    });

                    ModelUtil.formatTextContent(model);
                    model.set('hideEditButtonOnPreview', true);
                    model.openTrayOnDestroy = true;
                    ModelUtil.setEncounterDisplayName(model);
                }
            });

            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
        },
        showTitleWait: function() {
            var message = 'Note titles are being fetched. Please wait and try again.';
            var titleErrorView = new ADK.UI.Notification({
                title: 'Warning',
                message: message,
                type: 'warning'
            });
            titleErrorView.show();
        },
        showTitleError: function() {
            var message = 'Unable to fetch note titles. Please contact your system administrator.';
            var titleErrorView = new ADK.UI.Notification({
                title: 'Warning',
                message: message,
                type: 'warning'
            });
            titleErrorView.show();
        },
    };

    return formUtil;
});