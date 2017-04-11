define([
    'main/ADK',
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/orders/util',
    'hbs!app/applets/orders/modalView/footerTemplate',
    'app/applets/orders/writeback/discontinueView',
    'app/applets/orders/writeback/signView',
    'app/applets/orders/writeback/writebackUtils'
], function(ADK, Backbone, Marionette, _, Handlebars, ordersUtil, footerTemplate, DiscontinueView, SignView, Utils) {
    'use strict';

    //Modal Navigation Item View
    return Backbone.Marionette.ItemView.extend({
        template: footerTemplate,
        ui: {
            order_change_order: '#ordersChangeOrder',
            order_discontinue_order: '#ordersDiscontinueOrder',
            order_sign_order: '#ordersSignOrder',
            order_close_order: '.close-order'

        },
        events: {
            'click #ordersChangeOrder': 'openOrdersPopup',
            'click #ordersDiscontinueOrder': 'discontinueOrder',
            'click #ordersSignOrder': 'signOrder'
        },

        modelEvents: {
            "change": "render"
        },
        onBeforeRender: function() {
            ordersUtil.getDiscontinueBtnStatus(this.model);
            ordersUtil.getSignBtnStatus(this.model);
        },

        //treat spacebar press as Enter key - 508 requirement
        accessibility: function(event) {
            if (event.keyCode === 32) {
                this.$('#' + event.currentTarget.id).trigger('click');
            }
        },
        disableButton: function() {
            this.ui.order_change_order.attr("disabled", "disabled");
            this.ui.order_discontinue_order.attr("disabled", "disabled");
            this.ui.order_sign_order.attr("disabled", "disabled");
            this.ui.order_close_order.attr("disabled", "disabled");
        },
        enableButton: function() {
            this.ui.order_change_order.attr("disabled", false);
            this.ui.order_discontinue_order.attr("disabled", false);
            this.ui.order_sign_order.attr("disabled", false);
            this.ui.order_close_order.attr("disabled", false);

        },
        discontinueOrder: function(e) {
            e.preventDefault();
            this.disableButton();
            var discontinueModel = new ADK.UIResources.Writeback.Orders.Discontinue({
                'statusName': this.model.get('statusName'),
                'summary': this.model.get('summary')
            });

            this.listenTo(discontinueModel, 'create:success', this.onDiscontinueSuccess);
            this.listenTo(discontinueModel, 'create:error', this.onError);

            discontinueModel.addOrderId(this.model.get('localId') + ";1");
            discontinueModel.getDetails();
        },
        onDiscontinueSuccess: function(model) {
            if (!_.isUndefined(model.get('errorMessage'))) {
                return (this.onError(model));
            }
            ADK.UI.Modal.hide();

            var workflowTitle = (this.model.get('discontinueBtnLabel') || 'Cancel Order');
            Utils.launchWorkflow(model, DiscontinueView, { size: 'medium', helpMapping: 'lab_order_discontinue_form' }, workflowTitle);
        },
        signOrder: function(e) {
            e.preventDefault();
            this.disableButton();
            var signModel = new ADK.UIResources.Writeback.Orders.Sign({
                'statusName': this.model.get('statusName'),
                'summary': this.model.get('summary')
            });

            this.listenTo(signModel, 'create:success', this.onSignSuccess);
            this.listenTo(signModel, 'create:error', this.onError);

            signModel.addOrderId(this.model.get('localId') + ";1");
            signModel.getDetails();
        },
        onSignSuccess: function(model) {
            if (!_.isUndefined(model.get('errorMessage'))) {
                return (this.onError(model));
            }
            ADK.UI.Modal.hide();
            model.setDiscontinuedOrder(ordersUtil.isDiscontinuedUnsignedOrder(model));
            var workflowOptions = {
                size: 'medium',
                headerOptions: {
                    closeButtonOptions: {title: 'Press enter to cancel.'}
                },
                triggerElement: this.triggerElement,
                helpMapping: 'lab_order_esig_form'
            };
            Utils.launchWorkflow(model, SignView, workflowOptions, 'Sign Order');
        },
        onError: function(model, resp) {
            var errorMessage = model.get('errorMessage') || resp.statusText || 'Server Error';
            var responseText = _.get(resp, 'responseJSON.message', '');
            if (!_.isEmpty(responseText)) {
                errorMessage += (':' + responseText);
            }
            this.model.set('errorMessage', errorMessage);
            this.enableButton();
        },
        openOrdersPopup: function(e) {
            e.preventDefault();
            var writebackView = ADK.utils.appletUtils.getAppletView('orders', 'writeback');
            var formModel = new Backbone.Model();
            formModel.orderModel = this.model;
            var workflowOptions = {
                size: "large",
                title: "Edit a Lab Test",
                showProgress: false,
                keyboard: true,
                steps: [{
                    view: writebackView,
                    viewModel: formModel,
                    stepTitle: 'Step 1',
                    helpMapping: 'lab_order_form'
                }]
            };
            var workflowView = new ADK.UI.Workflow(workflowOptions);
            workflowView.show();
        }
    });
});