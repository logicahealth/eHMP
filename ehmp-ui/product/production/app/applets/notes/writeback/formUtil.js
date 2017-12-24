define([
    'backbone',
    'marionette',
    'underscore',
	'handlebars',
    'app/applets/notes/writeback/noteForm',
    'app/applets/notes/writeback/addendumForm',
    'hbs!app/applets/notes/preview/notePreviewTemplate',
    'app/applets/notes/preview/modalFooter',
    'app/applets/notes/writeback/signatureUtil',
    'app/applets/notes/writeback/operationConfirmationView',
    //'app/applets/notes/tray/noteObjectsSubTrayView',
    'app/applets/notes/subtray/noteObjectsSubtray',
    'app/applets/notes/writeback/modelUtil',
    'app/applets/documents/docUtils',
    'app/applets/notes/appConfig',
], function(Backbone, Marionette, _, Handlebars, NoteForm, AddendumForm, previewTemplate, PreviewFooter, SignatureUtil, ConfirmationView, SubTrayView, ModelUtil, DocUtils, CONFIG) {
    'use strict';

    var channel = ADK.Messaging.getChannel('notes');

    var notesFormHeaderOptions = {
        actionItems: [],
        closeButtonOptions: {
            title: 'Save and close note',
            onClick: function() {
                // This being the current form view that is shown
                if (_.isFunction(this.onClickActionButton_Close)) {
                    this.onClickActionButton_Close();
                }
            }
        }
    };

    var addendumFormHeaderOptions = {
        actionItems: [],
        closeButtonOptions: {
            title: 'Save and close addendum',
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
            notesFormOptions || (notesFormOptions = {});
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
                backdrop: true,
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
                subTrayGroup: 'note-edit-subtray',
                helpMapping: 'notes_form',
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
                                    'encounterName': visit.formattedDateTime && visit.locationDisplayName + visit.formattedDateTime || visit.locationDisplayName,
                                    'encounterServiceCategory': visit.serviceCategory,
                                    'locationUid': visit.locationUid,
                                    'encounterDateTime': visit.dateTime || ''
                                });

                                ModelUtil.setEncounterDisplayName(formModel);
                                ModelUtil.setLocation(formModel);
                            }
                        }
                        channel.trigger('workflow:done');
                    }
                }
            });
            workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show({
                inTray: 'notes'
            });
        },

        launchDraggablePreview: function(model, showInWorkflow) {
            // Mutate the model (not the modal)
            ModelUtil.formatTextContent(model);
            ModelUtil.formatSignatureContent(model);
            ModelUtil.previewAddendaAddWarningBanner(model);
            model.openTrayOnDestroy = true;
            ModelUtil.setEncounterDisplayName(model);
            ModelUtil.detectCosigner(model);
			var footerPreviewView;
			var self = this;
            // Configure the modal contents
            var previewView = new Backbone.Marionette.ItemView({
                model: model,
                template: previewTemplate
            });
			// Footer for Note preview modal
			if (DocUtils.canAddAddendum(model)) {
                footerPreviewView = PreviewFooter.extend({
                    model: model,
                    events: {
                        'click #btn-note-preview-add-addendum': function() {
                            var addendumFormOptions = {
                                model: model,
                                showVisit: false,
                                isEdit: false,
                                openTrayOnDestroy: false
                            };
                            self.launchAddendumForm(addendumFormOptions);
                            ADK.UI.Modal.hide();
                        },
                    },
                });
			}

            // Configure the modal structure
            if(showInWorkflow){
                var workflowPreviewView = Backbone.Marionette.ItemView.extend({
                    template: previewTemplate
                });
                var workflowOptions = {
                    title: CONFIG.PREVIEW_TITLE,
                    draggable: true,
                    showProgress: false,
                    steps: [{
                        view: workflowPreviewView,
                        viewModel: model
                    }],
                    backdrop: true
                };

                var workflowController = new ADK.UI.Workflow(workflowOptions);
                workflowController.show();
            } else {
                var previewModal = new ADK.UI.Modal({
                    view: previewView,
                    options: {
                        title: CONFIG.PREVIEW_TITLE,
                        size: 'large',
                        draggable: true,
                        footerView: footerPreviewView
                    }
                });
                previewModal.show();
            }

            /* T says keep this here in case the SMEs ask for it later, but comment out for now
            // Try not to cover the notes tray if it's a new modal spawning in
            var modalRegion = ADK.Messaging.request('get:adkApp:region', 'modalRegion');
            if (!modalRegion.hasView()) {
                setTimeout(function() {
                    var meta = modalRegion.currentView.$el;
                    meta.css('transition', 'all ease ' + CONFIG.PREVIEW_ANIM_SPEED + 's');
                    meta.css('-moz-transition', 'all ease ' + CONFIG.PREVIEW_ANIM_SPEED + 's');
                    meta.css('-webkit-transition', 'all ease ' + CONFIG.PREVIEW_ANIM_SPEED + 's');
                    meta.css('-o-transition', 'all ease ' + CONFIG.PREVIEW_ANIM_SPEED + 's');
                    meta.css('-ms-transition', 'all ease ' + CONFIG.PREVIEW_ANIM_SPEED);
                    meta.css('left', '20px');
                    meta.css('top', '100px');
                    setTimeout(function() { // Restore lagless dragspeed after initial animation finishes
                        meta.css('transition', 'initial');
                        meta.css('-moz-transition', 'initial');
                        meta.css('-webkit-transition', 'initial');
                        meta.css('-o-transition', 'initial');
                        meta.css('-ms-transition', 'initial');
                    }, CONFIG.PREVIEW_ANIM_SPEED * 1000); // ms
                }, 0);
            }
            */

            // Spawn it
        },

        launchAddendumForm: function(addendumFormOptions) {
            var workflowOptions = {
                title: "Note Addendum",
                size: "medium",
                showProgress: false,
                keyboard: true,
                headerOptions: undefined,
                steps: []
            };
            var isEdit = addendumFormOptions.isEdit;
            var openTrayOnDestroy = !_.isUndefined(addendumFormOptions.openTrayOnDestroy) ? addendumFormOptions.openTrayOnDestroy : true;
            // inModel for Add is the note model
            // inModel for Edit is an addendum from the note addenda array
            var inModel = addendumFormOptions.model.clone();
            var AddendumModel = ADK.UIResources.Writeback.Addendum.Model;
            var formModel;
            if (isEdit) {
                formModel = new AddendumModel(inModel.toJSON());
            }
            else {
                formModel = new AddendumModel();
                formModel.set({
                    documentDefUid: inModel.get('documentDefUid'),
                    localTitle: inModel.get('localTitle'),
                    parentUid: inModel.get('uid'),
                    noteModel: inModel
                });
            }

            formModel.set('value', true); // for signing
            formModel.openTrayOnDestroy = openTrayOnDestroy;

            var writebackView = AddendumForm;

            var workflow;
            var self = this;
            workflowOptions.steps.push({
                view: writebackView,
                viewModel: formModel,
                stepTitle: 'Step 1',
                showHeader: false,
                subTrayGroup: 'note-addendum-subtray',
                helpMapping: 'notes_addendum_form',
                onBeforeShow: function() {
                    workflow.changeHeaderActionItems(addendumFormHeaderOptions.actionItems);
                    workflow.changeHeaderCloseButtonOptions(addendumFormHeaderOptions.closeButtonOptions);
                }
            });
            workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show({
                inTray: 'notes'
            });
            channel.trigger('show.subTray');
        },
        showTitleWait: function() {
            var message = 'Note titles are being fetched. Wait and try again.';
            var titleErrorView = new ADK.UI.Notification({
                title: 'Warning',
                message: message,
                type: 'warning'
            });
            titleErrorView.show();
        },
        showTitleError: function() {
            var message = 'Unable to fetch note titles. Contact your system administrator.';
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
