define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
    "hbs!main/ui_components/modal/bootstrapModalTemplate",
    "hbs!main/ui_components/modal/bootstrapModalHeaderTemplate",
    "main/ui_components/modal/containerView"
], function(Backbone, Marionette, $, _, Handlebars, Messaging, BootstrapModalTemplate, BootstrapModalHeaderTemplate, ContainerView) {
    "use strict";

    var ModalButtonControlViewDefault = Backbone.Marionette.ItemView.extend({
        template: _.template("Close"),
        className: 'btn btn-default btn-sm',
        tagName: 'button',
        attributes: {
            'type': 'button',
            'data-dismiss': 'modal',
            'id': 'modal-close-button',
            'title': 'Press enter to close.'
        }
    });

    var ModalLayoutView = Backbone.Marionette.LayoutView.extend({
        template: BootstrapModalTemplate,
        initialize: function(userOptions) {
            var modalOptions = {
                'title': '',
                'size': '',
                'headerView': '',
                'footerView': '',
                'keyboard': false,
                'callShow': true,
                'draggable': true,
                'wrapperClasses': []
            };
            var passInModalOptions = userOptions.options || {};
            this.modalOptions = _.defaults(passInModalOptions, modalOptions);

            this.modalTitle = this.modalOptions.title;
            this.modalHeader = this.modalOptions.headerView;
            this.ModalButtonControlView = this.modalOptions.footerView;

            this.draggable = this.modalOptions.draggable;

            if (this.modalTitle || this.modalHeader) {
                var ModalHeaderView;
                if (this.modalHeader) {
                    ModalHeaderView = this.modalHeader.extend({
                        className: 'modal-header'
                    });
                } else {
                    var ModalModel = Backbone.Model.extend({
                        defaults: {
                            'modal-title': this.modalTitle
                        }
                    });
                    var modalModel = new ModalModel();
                    ModalHeaderView = Backbone.Marionette.ItemView.extend({
                        template: BootstrapModalHeaderTemplate,
                        model: modalModel,
                        className: 'modal-header'
                    });
                }
                this.modalHeaderView = new ModalHeaderView();
            }

            this.modalRegionView = userOptions.view;
            if (this.ModalButtonControlView && this.ModalButtonControlView !== 'none') {
                if (_.isFunction(this.ModalButtonControlView)) {
                    this.modalButtonControlView = new this.ModalButtonControlView();
                } else {
                    this.modalButtonControlView = this.ModalButtonControlView;
                }
            } else {
                this.modalButtonControlView = new ModalButtonControlViewDefault();
            }
        },
        events: {
            'keydown input': function(e) {
                if (e.which === 13) { //Prevent IE bug which issues data-dismiss in a modal on enter key
                    e.preventDefault();
                }
            }
        },
        regions: {
            modalHeaderRegion: '#modal-header',
            modalRegion: '#modal-body',
            modalButtonControlRegion: '#modal-footer'
        },
        onBeforeShow: function(){
            this.showChildView('modalRegion', this.modalRegionView);
            if (this.ModalButtonControlView === 'none') {
                this.$('#modal-footer').addClass('hidden');
            } else {
                this.showChildView('modalButtonControlRegion', this.modalButtonControlView);
            }
            if (this.modalHeaderView) {
                this.showChildView('modalHeaderRegion', this.modalHeaderView);
            }
        },
        show: function(options) {
            options = options || {};
            var $triggerElem = options.triggerElement || $(':focus');
            var ADK_ModalRegion = Messaging.request('get:adkApp:region', 'modalRegion');
            var modalOptions = {view: this};

            if (!this.draggable || (ADK_ModalRegion.$el && ADK_ModalRegion.$el.children().length === 0)) {
                var modalContainerView = new ContainerView(modalOptions);
                ADK_ModalRegion.show(modalContainerView);
            } else {
                ADK_ModalRegion.currentView.resetOptions(modalOptions);
                ADK_ModalRegion.currentView.modalDialogRegion.show(this);
                ADK_ModalRegion.currentView.$el.off('hidden.bs.modal');
            }

            ADK_ModalRegion.currentView.$el.one('hidden.bs.modal', function(e) {
                ADK_ModalRegion.empty();
                $triggerElem.focus();
            });

            if (_.isBoolean(this.modalOptions.callShow) && this.modalOptions.callShow) {
                ADK_ModalRegion.currentView.$el.modal('show');
            }
        }
    });
    ModalLayoutView.hide = function() {
        var currentView = Messaging.request('get:adkApp:region', 'modalRegion').currentView;
        if (currentView) {
            currentView.$el.modal('hide');
        }
    };
    return ModalLayoutView;
});