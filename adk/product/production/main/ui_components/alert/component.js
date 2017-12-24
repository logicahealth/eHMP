define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'api/Messaging'
], function(Backbone, Marionette, $, Handlebars, Messaging) {
    'use strict';

    var AlertView = Backbone.Marionette.LayoutView.extend({
        footerView: undefined,
        messageView: undefined,
        title: 'Alert',
        icon: 'fa-exclamation-triangle font-size-18 color-red',
        behaviors: {
            ZIndex: {
                eventString: 'show.bs.modal'
            }
        },
        tagName: 'div',
        className: 'modal alert-modal',
        attributes: {
            'role': 'dialog',
            'aria-labelledby': 'newActionsModalLabel',
            'tabindex': '-1',
            'id': 'mainAlert',
        },
        template: Handlebars.compile([
            '<div class="alert-container modal-dialog">',
            '<div class="modal-content">',
            '<div class="modal-header">',
            '<h4 class="modal-title" id="newActionsModalLabel"><i class="fa {{icon}} left-padding-sm"></i> {{title}}</h4>',
            '</div>',
            '<div class="modal-body"></div>',
            '<div class="modal-footer"></div>',
            '</div>',
            '</div>'
        ].join("\n")),
        templateHelpers: function() {
            return {
                icon: this.getOption('icon'),
                title: this.getOption('title')
            };
        },
        regions: {
            'FooterRegion': '.modal-footer',
            'MessageRegion': '.modal-body'
        },
        events: {
            'shown.bs.modal': function() {
                var ADK_AlertRegion = Messaging.request('get:adkApp:region', 'alertRegion');
                var $alertBackdrop = ADK_AlertRegion.currentView.$el.data('bs.modal').$backdrop;
                if (_.isNumber(ADK_AlertRegion.currentView.$el.zIndex()) && $alertBackdrop instanceof jQuery && $alertBackdrop.length > 0) {
                    $alertBackdrop.css('z-index', ADK_AlertRegion.currentView.$el.zIndex() - 1);
                }
                Messaging.trigger('obscure:background:content');
            },
            'hide.bs.modal': function(){
                if(_.get(this.$el.data('bs.modal'), '$body', $('body')).find('.modal-backdrop.in').length === 1) {
                    Messaging.trigger('reveal:background:content');
                }
            }
        },
        initialize: function() {
            this.messageView = this.getOption('messageView');
            if (!(this.messageView instanceof Backbone.View) && Backbone.View.prototype.isPrototypeOf(_.get(this, 'messageView.prototype'))) {
                this.messageView = new this.messageView(this.options);
            }
            this.footerView = this.getOption('footerView');
            if (!(this.footerView instanceof Backbone.View) && Backbone.View.prototype.isPrototypeOf(_.get(this, 'footerView.prototype'))) {
                this.footerView = new this.footerView(this.options);
            }
        },
        onShow: function() {
            if (this.messageView instanceof Backbone.View) {
                this.showChildView('MessageRegion', this.messageView);
            }
            if (this.footerView instanceof Backbone.View) {
                this.showChildView('FooterRegion', this.footerView);
            }
        },
        show: function() {
            var ADK_AlertRegion = Messaging.request('get:adkApp:region', 'alertRegion');
            if (!_.isUndefined(ADK_AlertRegion) && !_.isUndefined(this)) {
                var $triggerElem = $(':focus');
                if (ADK_AlertRegion.hasView()) {
                    ADK_AlertRegion.currentView.$el.modal('hide');
                }
                ADK_AlertRegion.show(this);

                ADK_AlertRegion.currentView.$el.one('hidden.bs.modal', function(e) {
                    ADK_AlertRegion.empty();
                    $triggerElem.focus();
                });

                ADK_AlertRegion.currentView.$el.modal('show');

                return ADK_AlertRegion.currentView;
            }
            return false;
        }
    });

    AlertView.hide = function() {
        var currentView = Messaging.request('get:adkApp:region', 'alertRegion').currentView;
        if (currentView) {
            currentView.$el.modal('hide');
        }
    };

    return AlertView;
});
