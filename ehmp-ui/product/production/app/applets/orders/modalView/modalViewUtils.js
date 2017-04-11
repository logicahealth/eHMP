define([
    'main/ADK',
    'app/applets/orders/modalView/modalContentView',
    'app/applets/orders/modalView/modalHeaderView',
    'app/applets/orders/modalView/modalFooterView',
    'app/applets/orders/util',
], function(ADK, ModalView, ModalHeaderView, ModalFooterView, OrderUtils) {
    "use strict";

    var VIEW_ATTRIBUTE_LIST = ['modelIndex', 'collection', 'pageable', 'summary'];

    var getBaseModalOptions = function(title) {
        return {
            size: 'large',
            title: title || ''
        };
    };

    var getDetailModelOptions = function(model, options) {
        var collection = _.get(options, 'collection', new Backbone.Collection());
        return _.extend({}, model.attributes, {
            orderId: model.get('localId') + ';1',
            collection: collection,
            modelIndex: collection.indexOf(model),
            pageable: !_.get(options, 'appletConfig.fullScreen', true)
        });
    };

    var getLoadingModalOptions = function(model) {
        return {
            view: ADK.Views.Loading.create(),
            options: getBaseModalOptions(model.get('summary'))
        };
    };

    var getOrderDetailModalOptions = function(model) {
        var modalModel = new Backbone.Model(_.extend({}, model.attributes, {
            detailSummary: model.get('detail'),
            getSignBtnStatus: OrderUtils.getSignBtnStatus(model),
            getDiscontinueBtnStatus: OrderUtils.getDiscontinueBtnStatus(model)
        }));
        var attributes = _.extend(_.pick(model.attributes, VIEW_ATTRIBUTE_LIST), {
            model: modalModel
        });

        var modalView = new ModalView(attributes);
        var optionAttributes = _.extend({}, attributes, {
            theView: modalView
        });
        return {
            view: modalView,
            options: _.extend({}, getBaseModalOptions(attributes.summary), {
                headerView: ModalHeaderView.extend(optionAttributes),
                footerView: ModalFooterView.extend(optionAttributes)
            })
        };
    };

    return {
        showOrderDetails: function(model, options) {
            var loadingModal = new ADK.UI.Modal(getLoadingModalOptions(model));
            loadingModal.show();

            //If it's an eHMP order we want to pull up activity detail screen.
            if (!_.isUndefined(model.get('kind')) && model.get('kind') === 'Consult-eHMP' && !_.isUndefined(model.get('data'))) {
                //Check for the processId
                var activity = model.get('data').activity;
                if (!_.isUndefined(activity) && !_.isUndefined(activity.processInstanceId)) {
                    ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                        processId: activity.processInstanceId
                    });
                }
            } else {

                var detailModel = new ADK.UIResources.Writeback.Orders.Detail(getDetailModelOptions(model, options));

                loadingModal.listenTo(detailModel, 'read:success', function(model) {
                    var orderDetailModal = new ADK.UI.Modal(getOrderDetailModalOptions(model));
                    orderDetailModal.show();
                });
                loadingModal.listenTo(detailModel, 'read:error', function(model, resp) {
                    loadingModal.showChildView('modalRegion', new ADK.Views.Error.create({
                        model: new Backbone.Model(resp)
                    }));
                });

                detailModel.execute();
            }
        }
    };
});