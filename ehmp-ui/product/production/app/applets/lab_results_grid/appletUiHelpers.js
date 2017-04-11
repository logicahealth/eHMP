define([
    "require",
    "backbone",
    "underscore",
    "app/applets/lab_results_grid/modal/modalView",
    "app/applets/lab_results_grid/modal/errorView",
    "app/applets/lab_results_grid/modal/modalHeaderView",
    "app/applets/lab_results_grid/modal/modalFooterView",
    "app/applets/lab_results_grid/modal/noteView",
    "app/applets/visit/writeback/addselectVisit"
], function(require, Backbone, _, ModalView, ErrorView, ModalHeaderViewUndef, modalFooterView, NoteView, AddSelectVisit) {
    'use strict';

    var WORKFLOW_DEFAULTS = {
        size: 'medium',
        showProgress: false,
        keyboard: true
    };

    var launchWorkflow = function(model, view, title) {
        if (_.isUndefined(model) || _.isUndefined(view)) {
            throw new Error('Invalid parameters passed to lab_results_grid::launchWorkflow');
        }

        var workflowOptions = _.extend({}, WORKFLOW_DEFAULTS, {
            steps: [],
            title: title || 'Numeric Lab Results'
        });
        ADK.utils.writebackUtils.handleVisitWorkflow(workflowOptions, AddSelectVisit);

        workflowOptions.steps.push({
            view: view,
            viewModel: model
        });

        var workflow = new ADK.UI.Workflow(workflowOptions);
        workflow.show();
    };

    var appletUiHelpers = {

		getDetailView: function(model, target, appletOptions, navHeader, onSuccess, onFail, id) {
            var dataCollection;
            if(appletOptions.collection) {
                dataCollection = appletOptions.collection;
            } else {
                dataCollection = appletOptions;
            }

            if (!model.get('pathology')) {
                // for non panel lab result row
                var isFullscreen  = model.get('isFullscreen');
                model.set('isNotAPanel', true);
                var view = new ModalView.ModalView({
                    model: model,
                    target: target,
                    gridCollection: dataCollection,
                    isFromNonPanel: true,
                    fullScreen: isFullscreen
                });
                var detailData = {
                    view: view,
                    title: model.get('typeName') + ' - ' + model.get('specimen')
                };
                onSuccess(detailData, model, dataCollection, navHeader, appletOptions, id);

            } else {
                var resultDocs = model.get('results');

                if (resultDocs && resultDocs.length > 0 && resultDocs[0].resultUid) {
                    var uid = resultDocs[0].resultUid;
                    var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                    var deferredDetailResponse = ADK.Messaging.getChannel("lab_results_grid").request('extDetailView', {
                        uid: uid,
                        patient: {
                            icn: currentPatient.attributes.icn,
                            pid: currentPatient.attributes.pid
                        },
                        suppressModal: true
                    });

                    deferredDetailResponse.done(function(detailData) {
                        onSuccess(detailData, model, dataCollection, navHeader, appletOptions, id);
                    });
                    deferredDetailResponse.fail(function(error) {
                        onFail(error, model, dataCollection);
                    });
                } else {
                    onFail("Lab has no link to a result document", model, dataCollection);
                }
            }
        },
        showModal: function(detailData, detailModel, dataCollection, navHeader, appletOptions, id) {
            var modalOptions = {
                'title': detailData.title,
                'size': 'xlarge',
                'footerView': modalFooterView.extend()
            };

            detailModel.set('lab_detail_title', detailData.title);

            if (navHeader) {
                var ModalHeaderView = require('app/applets/lab_results_grid/modal/modalHeaderView');
                modalOptions.headerView = ModalHeaderView.extend({
                    model: detailModel,
                    theView: detailData.view,
                    dataCollection: dataCollection,
                    navHeader: navHeader,
                    appletOptions: appletOptions
                });
            }

            var modal = new ADK.UI.Modal({
                view: detailData.view,
                options: modalOptions
            });
            modal.show();
            modal.$el.closest('.modal').find('#' + id).focus();
        },
        showErrorModal: function(error, itemModel, dataCollection) {
            var modalOptions = {
                'title': "An Error Occurred",
                'size': 'xlarge',
                'footerView': modalFooterView.extend()
            };

            var errorMsg = _.isString(error) ? error : error && _.isString(error.statusText) ? error.statusText : "An error occurred";
            var errorView = new ErrorView({
                model: new Backbone.Model({ error: errorMsg })
            });

            var ModalHeaderView = require('app/applets/lab_results_grid/modal/modalHeaderView');
            modalOptions.headerView = ModalHeaderView.extend({
                model: itemModel,
                theView: errorView,
                dataCollection: dataCollection,
                navHeader: true
            });

            var modal = new ADK.UI.Modal({
                view: errorView,
                options: modalOptions
            });
            modal.show();
        },
        launchNoteWorkflow: function(dataModel) {
            // This will change to the appropriate ADK Writeback Resource object.
            var model = new Backbone.Model(dataModel.attributes);
            launchWorkflow(model, NoteView, 'Create Note Object');
        }
    };
    return appletUiHelpers;
});
