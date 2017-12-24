define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
], function(Backbone, Marionette, $, _, Handlebars, Messaging) {
    "use strict";

    var DivModel = Backbone.Model.extend({
        defaults: {
            'keyboard': true
        }
    });
    var OverlayView = Backbone.Marionette.LayoutView.extend({
        initialize: function(userOptions) {
            this.model = new DivModel();

            var overlayOptions = {
                'callShow': false
            };
            var passInModalOptions = userOptions.options || {};
            this.overlayOptions = _.defaults(passInModalOptions, overlayOptions);
            this.overlayView = userOptions.view;

            if (_.isBoolean(this.overlayOptions.keyboard) && !this.overlayOptions) {
                this.model.set('keyboard', this.overlayOptions.keyboard);
            }
            this.$el.attr({
                'data-keyboard': this.model.get('keyboard')
            });
        },
        onBeforeShow: function() {
            this.showChildView('overlayViewRegion', this.overlayView);
        },
        template: Handlebars.compile('<div id="mainOverlayRegion" tabindex="-1"></div>'),
        className: function() {
            var themeClass = '';
            if (_.isString(this.getOption('theme'))) {
                themeClass += ' overlay--' + this.getOption('theme');
            }
            return 'overlay overlay-scale' + themeClass;
        },
        tagName: 'div',
        attributes: {
            'role': 'dialog',
            'id': 'mainOverlay',
            'data-backdrop': 'static',
            'aria-describedby': 'mainOverlayRegion',
            'aria-label': ''
        },
        regions: {
            overlayViewRegion: '@ui.mainOverlayRegion',
        },
        ui:{
            mainOverlayRegion: '#mainOverlayRegion'
        },
        events: {
            'shown.bs.modal': function(e) {
                this.ui.mainOverlayRegion.focus();
            },
            'focusin.bs.modal': function(e) {
                e.stopPropagation();
            },
            'hide.bs.modal': function(e) {
                if(_.get(this.$el.data('bs.modal'), '$body', $('body')).find('.modal-backdrop.in').length === 1) {
                    Messaging.trigger('reveal:background:content');
                }
            }
        },
        show: function(options) {
            var ADK_ModalRegion = Messaging.request('get:adkApp:region', 'modalRegion');
            var $triggerElem = _.get(options, 'triggerElement', _.get(this, 'overlayOptions.triggerElement', $(':focus')));
            ADK_ModalRegion.show(this, { triggerElement: $triggerElem });
            ADK_ModalRegion.currentView.$el.one('hidden.bs.modal', function(e) {
                $('body').removeClass('overlay-open');
                ADK.ADKApp.modalRegion.empty();
            });
            if (this.overlayOptions.callShow === true) {
                ADK_ModalRegion.currentView.$el.modal('show');
            }
            $('body').addClass('overlay-open');

            Messaging.trigger('obscure:background:content');
        }
    });
    OverlayView.hide = function() {
        var currentView = Messaging.request('get:adkApp:region', 'modalRegion').currentView;
        if (currentView) {
            currentView.$el.modal('hide');
        }
    };
    return OverlayView;
});
