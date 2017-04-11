define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
    "hbs!main/ui_components/modal/bootstrapModalTemplate",
    "hbs!main/ui_components/modal/bootstrapModalHeaderTemplate",
    "main/ui_components/modal/containerView",
    "main/components/views/loadingView",
    "main/components/views/errorView"
], function(Backbone, Marionette, $, _, Handlebars, Messaging, BootstrapModalTemplate, BootstrapModalHeaderTemplate, ContainerView, LoadingView, ErrorView) {
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
        resourceEntityEvents: {
            'fetch:success read:success': function(entity, resp) {
                if(this.showLoading && this.getRegion('loadingRegion')) {
                    var $loadingRegion = this.$(_.get(this.getRegion('loadingRegion'), '$el.selector', '.modal-loading'));
                    this.removeRegion('loadingRegion');
                    $loadingRegion.remove();
                    this.modalHeaderView.model.set('modal-title', _.result(this, 'modalTitle'));

                    var $modalBody = this.$(_.get(this.getRegion('modalRegion'), '$el.selector', '#modal-body'));
                    var $viewEl = _.get(this.getRegion('modalRegion'), 'currentView.$el', $modalBody);
                    $viewEl.trigger('show.modal-body');
                    $modalBody.show();
                    $viewEl.trigger('shown.modal-body');
                }
            },
            'fetch:error read:error': function(entity, resp) {
                if(this.showLoading && this.getRegion('loadingRegion')) {
                    var $loadingRegion = this.$(_.get(this.getRegion('loadingRegion'), '$el.selector', '.modal-loading'));
                    this.removeRegion('loadingRegion');
                    $loadingRegion.remove();
                    this.$(_.get(this.getRegion('modalRegion'), '$el.selector', '#modal-body')).show();
                }
                this.modalHeaderView.model.set('modal-title', "An Error Occurred");
                this.showChildView('modalRegion', ErrorView.create({
                    model: new Backbone.Model(resp)
                }));
            },
            'request': function(entity, resp) {
                if (this.showLoading) {
                    var $modalRegion = this.$(_.get(this.getRegion('modalRegion'), '$el.selector', '#modal-body'));
                    $modalRegion.before('<div class="modal-loading modal-body"></div>');
                    $modalRegion.hide();
                    this.addRegion('loadingRegion', this.$('.modal-loading'));
                    this.showChildView('loadingRegion', LoadingView.create());
                }
            }
        },
        initialize: function(userOptions) {
            this.model = userOptions.view.model;
            this.callbackView = userOptions.callbackView;
            this.callbackFunction = userOptions.callbackFunction;

            var modalOptions = {
                'title': '',
                'size': '',
                'headerView': '',
                'footerView': '',
                'keyboard': false,
                'callShow': true,
                'draggable': true,
                'wrapperClasses': [],
                'resourceEntity': null,
                'showLoading': false,
                'loadingTitle': ''
            };
            var passInModalOptions = userOptions.options || {};
            this.modalOptions = _.defaults(passInModalOptions, modalOptions);

            this.modalTitle = this.modalOptions.title;
            this.nextPreviousCollection = this.modalOptions.nextPreviousCollection;
            this.nextPreviousModel = this.modalOptions.nextPreviousModel;
            this.modalHeader = this.modalOptions.headerView;
            this.ModalButtonControlView = this.modalOptions.footerView;

            this.draggable = this.modalOptions.draggable;
            this.showLoading = _.get(this, 'modalOptions.showLoading', false);

            if (this.modalTitle || this.modalHeader) {
                var ModalHeaderView;
                if (this.modalHeader) {
                    ModalHeaderView = this.modalHeader.extend({
                        className: 'modal-header'
                    });
                } else {
                    var title = _.result(this, 'modalTitle');
                    var ModalModel = Backbone.Model.extend({
                        defaults: {
                            'modal-title': this.showLoading ? _.get(this, 'modalOptions.loadingTitle') || title : title,
                            'nextPreviousCollection': this.nextPreviousCollection
                        }
                    });
                    var modalModel = new ModalModel();
                    ModalHeaderView = Backbone.Marionette.ItemView.extend({
                        template: BootstrapModalHeaderTemplate,
                        parentView: this,
                        model: modalModel,
                        className: 'modal-header',
                        modelEvents: {
                            'change:modal-title': 'render'
                        },
                        events: {
                            'click #toPrevious, #toNext': 'navigateModal'
                        },
                        navigateModal: function(e) {
                            var $target = $(e.currentTarget),
                                id = $target.attr('id');
                            //The purpose of this is to execute the functions and do the check on the id
                            id === 'toPrevious' ? this.parentView.getPrevModal() : this.parentView.getNextModal();
                        }
                    });
                }
                this.modalHeaderView = new ModalHeaderView();
            }

            //configure resource events
            var resourceEntity = _.get(this, 'modalOptions.resourceEntity');
            if (!_.isObject(resourceEntity)) { //pick it off view if not supplied
                resourceEntity =  _.get(userOptions, 'view.collection') || _.get(userOptions, 'view.model') || {};
                _.set(this, 'modalOptions.resourceEntity', resourceEntity, null);
            }

            if (_.isFunction(resourceEntity.isEmpty)) {
                this.bindEntityEvents(_.get(this, 'modalOptions.resourceEntity'), this.resourceEntityEvents);
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
        onDestroy: function() {
            if(_.has(this, 'modalOptions.resourceEntity.isEmpty'))
                this.unbindEntityEvents(_.get(this, 'modalOptions.resourceEntity'), this.resourceEntityEvents);
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
        onAttach: function() {
            if(this.nextPreviousCollection) this.checkIfModalIsEnd();
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
        },
        checkIfModalIsEnd: function() {
            var currentModel = this.nextPreviousModel || this.model;
            var currentIdx = this.nextPreviousCollection.indexOf(currentModel);
            if (currentIdx + 1 >= this.nextPreviousCollection.length) {
                this.$el.closest('.modal').find('#toNext').attr('disabled', true);
            } else if (currentIdx === 0) {
                this.$el.closest('.modal').find('#toPrevious').attr('disabled', true);
            }
        },
        getNextModal: function() {
            var currentModel = this.nextPreviousModel || this.model;
            var nextIdx = this.nextPreviousCollection.indexOf(currentModel) + 1;
            this.setNextPrevModal(this.nextPreviousCollection.at(nextIdx));
        },
        getPrevModal: function() {
            var currentModel = this.nextPreviousModel || this.model;
            var prevIdx = this.nextPreviousCollection.indexOf(currentModel) - 1;
            this.setNextPrevModal(this.nextPreviousCollection.at(prevIdx));
        },
        setNextPrevModal: function(newModel) {
            if(this.callbackView) {
                this.callbackView.getDetailsModal(newModel);
            } else {
                this.callbackFunction(newModel, this.nextPreviousCollection);
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