define([
    'backbone',
    'marionette',
    'jquery',
    'jquery-ui/draggable',
    'underscore',
    'handlebars',
    'main/Utils'
], function(Backbone, Marionette, $, draggable, _, Handlebars, Utils) {
    "use strict";

    var DRAGGABLE_THRESHOLD = 0.75;

    var DivModel = Backbone.Model.extend({
        defaults: {
            'sizeClass': '',
            'backdrop': true,
            'draggable': true,
            'keyboard': true
        }
    });

    var ModalContainerView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile('<div id="mainModalDialog" class="modal-dialog{{#if extraClasses}} {{extraClasses}}{{/if}} {{sizeClass}} {{draggable}}" aria-live="assertive"></div>'),
        initialize: function(options) {
            this.resetOptions(options, true);
        },
        resetOptions: function(options, isNewInstance) {
            if (!!isNewInstance) {
                this.model = new DivModel();
            } else {
                // this is a reuse case
                this.options = options;

                if (this.model.get('draggable')) {
                    this.stopListening(Utils.resize.dimensions.viewport, 'change:width', this.adjustWidth);
                    // TODO revisit this logic
                    // this.$el.draggable('destroy');
                }
                this.model.clear();
            }

            var modalView= options.view;

            var modalOptions = modalView.modalOptions;
            if (!modalOptions.keyboard) {
                this.model.set('keyboard', modalOptions.keyboard);
            }
            if (modalOptions.backdrop === false || modalOptions.backdrop === 'static' || modalOptions.draggable === true) {
                $('.modal-backdrop').remove();
                this.model.set('backdrop', modalOptions.backdrop);
            }

            if (modalOptions.size === 'small') {
                this.model.set('sizeClass', 'modal-sm');
            } else if (modalOptions.size === 'large') {
                this.model.set('sizeClass', 'modal-lg');
            } else if (modalOptions.size === 'xlarge') {
                this.model.set('sizeClass', 'modal-xl');
            }

            if (modalOptions.draggable === true) {
                this.model.set('draggable', 'draggable');
                this.model.set('backdrop', false);
                this.listenTo(Utils.resize.dimensions.viewport, 'change:width', this.adjustWidth);
            }

            if(_.isArray(modalOptions.wrapperClasses)){
                this.model.set('extraClasses', modalOptions.wrapperClasses.join(' '));
            } else if (_.isString(modalOptions.wrapperClasses)){
                this.model.set('extraClasses', modalOptions.wrapperClasses);
            }

            this.modalLayoutView = modalView;
        },
        className: 'modal',
        attributes: {
            'role': 'dialog',
            'tabindex': '-1',
            'id': 'mainModal'
        },
        regions: {
            modalDialogRegion: '#mainModalDialog'
        },
        onBeforeShow: function() {
            this.showChildView('modalDialogRegion', this.modalLayoutView);
        },
        onRender: function() {
            this.$el.attr({
                'data-backdrop': this.model.get('backdrop'),
                'data-keyboard': this.model.get('keyboard')
            });
        },
        adjustModal: function() {
            var modalRect = this.$el[0].getBoundingClientRect();
            var modalContentRect = this.$('.modal-content')[0].getBoundingClientRect();
            var patientInfoBarWidth = $('.patient-info-bar').width();

            var self = this;
            return {
                draggableSize: function() {
                    self.$el.width(modalContentRect.width);
                },
                centerPosition: function() {
                    self.$el.offset({
                        top: $('.navbar-fixed-top').height(),
                        left: $(window).width()/2-modalRect.width/2
                    });
                    if (self.$el.offset().left < patientInfoBarWidth) {
                        self.$el.offset({left: patientInfoBarWidth});
                    }
                }
            };
        },
        adjustWidth: function() {
            var newWidth = this.$el.find('.modal-dialog').width();
            this.$el.width(newWidth);
        },
        events: {
            'show.bs.modal': function(e) {
                if (this.$el.hasClass('in')) {
                    this.adjustModal().draggableSize();
                }
            },
            'shown.bs.modal': function(e) {
                if ($('.modal:visible').length >= 1) {
                    var zIndex = Math.max.apply(null, Array.prototype.map.call($('.modal:visible'), function(el) {
                        return +el.style.zIndex;
                    })) + 1111;
                    this.$el.css('z-index', zIndex);
                }
                if (this.options.view.modalOptions.draggable === true) {
                    this.adjustModal().draggableSize();
                    this.adjustModal().centerPosition();
                    var leftContainment = 0;
                    var $leftSideBar = $('.patient-info-bar');
                    if (!_.isEmpty($leftSideBar)){
                        leftContainment = $leftSideBar.outerWidth(true);
                    } else {
                        leftContainment = this.$('.modal-content').width()*DRAGGABLE_THRESHOLD*-1;
                    }
                    // containment: left, top, right, bottom
                    this.$el.draggable({
                        handle: ".draggable-handle",
                        containment: [
                            leftContainment,
                            $('.navbar-fixed-top').height(),
                            $(window).width()-this.$('.modal-content').width()*(1-DRAGGABLE_THRESHOLD),
                            $(window).height()-this.$('.modal-content').height()*(1-DRAGGABLE_THRESHOLD)
                        ],
                        scroll: false,
                        cursor: 'move'
                    });
                }
            },
            'focusin.bs.modal': function(e) {
                e.stopPropagation();
            }
        }
    });
    return ModalContainerView;
});