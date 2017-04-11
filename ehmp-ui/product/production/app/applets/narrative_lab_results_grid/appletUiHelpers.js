define([
    "require",
    "backbone",
    "underscore",
    "app/applets/narrative_lab_results_grid/modal/modalView",
    "app/applets/narrative_lab_results_grid/modal/modalHeaderView",
    "app/applets/narrative_lab_results_grid/modal/modalFooterView"
], function(require, Backbone, _, ModalView, ModalHeaderView, modalFooterView) {
    'use strict';

    var appletUiHelpers = {

		getDetailView: function(model, target, appletOptions, navHeader, onSuccess, onFail, id) {
            var dataCollection = appletOptions.fullCollection;

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
                    var deferredDetailResponse = ADK.Messaging.getChannel("narrative_lab_results_grid").request('extDetailView', {
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
                'size': 'large',
                'footerView': modalFooterView.extend()
            };

            detailModel.set('lab_detail_title', detailData.title);

            if (navHeader) {
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
                'size': 'large',
                'footerView': modalFooterView.extend()
            };

            var errorView = ADK.Views.Error.create({
                model: new Backbone.Model(error)
            });

            modalOptions.headerView = ModalHeaderView.extend({
                model: itemModel,
                theView: ModalHeaderView,
                dataCollection: dataCollection,
                navHeader: true
            });

            var modal = new ADK.UI.Modal({
                view: errorView,
                options: modalOptions
            });

            ADK.UI.Modal.hide();
            modal.show();
        }
    };
    return appletUiHelpers;
});
