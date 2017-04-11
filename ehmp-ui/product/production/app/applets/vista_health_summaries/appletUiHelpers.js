define([
    "require",
    "backbone",
    "underscore",
    "app/applets/vista_health_summaries/modal/modalView",
    "app/applets/vista_health_summaries/modal/modalHeaderView"
], function(require, Backbone, _, ModalView, ModalHeaderViewUndef) {
    'use strict';

    var appletUiHelpers = {
        getDetailView: function(model, target, dataCollection, navHeader, onSuccess) {
            var view = new ModalView({
                model: model,
                target: target,
                gridCollection: dataCollection
            });
            onSuccess(view, model, dataCollection, navHeader);
            view.$el.closest('.modal').focus();
        },
        showModal: function(detailView, detailModel, dataCollection, navHeader) {
            var modalOptions = {
                'title': detailModel.get('facilityMoniker') + ' - ' + detailModel.get('hsReport'),
                'size': 'large'
            };

            if (navHeader) {
                var ModalHeaderView = require('app/applets/vista_health_summaries/modal/modalHeaderView');
                modalOptions.headerView = ModalHeaderView.extend({
                    model: detailModel,
                    theView: detailView,
                    dataCollection: dataCollection,
                    navHeader: navHeader
                });
            }

            var modal = new ADK.UI.Modal({
                view: detailView,
                options: modalOptions
            });
            modal.show();
            modal.$el.closest('.modal').focus();
        }
    };

    return appletUiHelpers;

});