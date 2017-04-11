define([
    "require",
    "backbone",
    "underscore",
    "app/applets/vista_health_summaries/modal/modalView",
    "app/applets/vista_health_summaries/modal/modalHeaderView"
], function(require, Backbone, _, ModalView, ModalHeaderViewUndef) {
    'use strict';

    var appletUiHelpers = {
        getDetailView: function(model, target, dataCollection, navHeader, onSuccess, clickedBtn) {
            var view = new ModalView({
                model: model,
                target: target,
                gridCollection: dataCollection
            });
            onSuccess(view, model, dataCollection, navHeader);
            if(clickedBtn) {
                var focusBtn = view.$el.closest('.modal').find('#' + clickedBtn);
                if (focusBtn.is(':disabled')){
                    view.$el.closest('.modal').focus();
                } else {
                    focusBtn.focus();
                }
            }
        },
        showModal: function(detailView, detailModel, dataCollection, navHeader) {
            var modalOptions = {
                'title': detailModel.get('facilityMoniker') + ' - ' + detailModel.get('hsReport'),
                'size': 'large'
            };

            if (navHeader) {

                // enable/disable previous and next buttons.
                var index = _.indexOf(dataCollection.models, detailModel),
                    next = index + 1,
                    prev = index - 1,
                    nextButtonDisable = false,
                    prevButtonDisable = false,
                    detailGroupName = detailView.$("#" + detailModel.get('uid')).prevAll('tr.group-by-header:first').find('td.group-by-header b').text();

                if (next >= dataCollection.length) {
                    nextButtonDisable = true;
                } else {
                    var nextDetailModel = dataCollection.at(next),
                        nextGroupName = detailView.$("#" + nextDetailModel.get('uid')).prevAll('tr.group-by-header:first').find('td.group-by-header b').text();

                    if (detailGroupName !== nextGroupName) {
                        nextButtonDisable = true;
                    }
                }

                if (prev < 0) {
                    prevButtonDisable = true;
                } else {
                    var prevDetailModel = dataCollection.at(prev),
                        prevGroupName = detailView.$("#" + prevDetailModel.get('uid')).prevAll('tr.group-by-header:first').find('td.group-by-header b').text();

                    if (detailGroupName !== prevGroupName) {
                        prevButtonDisable = true;
                    }
                }

                var ModalHeaderView = require('app/applets/vista_health_summaries/modal/modalHeaderView');
                modalOptions.headerView = ModalHeaderView.extend({
                    model: detailModel,
                    theView: detailView,
                    dataCollection: dataCollection,
                    navHeader: navHeader,
                    nextButtonDisable: nextButtonDisable,
                    prevButtonDisable: prevButtonDisable
                });
            }

            var modal = new ADK.UI.Modal({
                view: detailView,
                options: modalOptions
            });
            modal.show();
        }
    };

    return appletUiHelpers;

});