define([
    'backbone',
    'marionette',
    'jquery',
    'jquery-ui/draggable',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, $, draggable, _, Handlebars) {
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
        template: Handlebars.compile('<div id="mainModalDialog" class="modal-dialog modal-liquid {{sizeClass}} {{draggable}}"></div>'),
        initialize: function(options) {
            this.model = new DivModel();
            var modalView= options.view;
            var modalOptions = modalView.modalOptions;
            if (!modalOptions.keyboard) {
                this.model.set('keyboard', modalOptions.keyboard);
            }
            if (modalOptions.backdrop === false || modalOptions.backdrop === 'static' || modalOptions.draggable === true) {
                $('.modal-backdrop').remove();
            }

            if (modalOptions.size === 'small') {
                this.model.set('sizeClass', 'modal-sm');
            } else if (modalOptions.size === 'large') {
                this.model.set('sizeClass', 'modal-lg');
            } else if (modalOptions.size === 'xlarge') {
                this.model.set('sizeClass', 'modal-xlg');
            }

            if (modalOptions.draggable === true) {
                this.model.set('draggable', 'draggable');
                this.model.set('backdrop', false);
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
                }
            };
        },
        events: {
            'show.bs.modal': function(e) {
                if (this.$el.hasClass('in')) {
                    this.adjustModal().draggableSize();
                }
            },
            'shown.bs.modal': function(e) {
                if (this.options.view.modalOptions.draggable === true) {
                    this.adjustModal().draggableSize();
                    this.adjustModal().centerPosition();
                    this.$el.draggable({
                        handle: ".draggable-handle",
                        containment: [
                            this.$('.modal-content').width()*DRAGGABLE_THRESHOLD*-1,
                            $('.navbar-fixed-top').height(),
                            $(window).width()-this.$('.modal-content').width()*(1-DRAGGABLE_THRESHOLD),
                            $(window).height()-this.$('.modal-content').height()*(1-DRAGGABLE_THRESHOLD)
                        ],
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