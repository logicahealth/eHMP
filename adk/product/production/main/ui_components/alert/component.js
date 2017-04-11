define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'api/Messaging'
], function(Backbone, Marionette, $, Handlebars, Messaging) {
    'use strict';

    var AlertModel = Backbone.Model.extend({
        defaults: {
            title: 'Alert',
            icon: 'fa-exclamation-triangle font-size-18 color-red',
            messageView: undefined,
            footerView: undefined
        }
    });

    var AlertView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            ZIndex: {
                eventString: 'show.bs.modal'
            }
        },
        collection: new Backbone.Collection(),
        model: new AlertModel(),
        className: 'modal alert-modal',
        tagName: 'div',
        attributes: {
            'role': 'dialog',
            'tabindex': '-1',
            'id': 'mainAlert',
            'data-backdrop': 'static'
        },
        events: {
            'shown.bs.modal': function(){
                var ADK_AlertRegion = Messaging.request('get:adkApp:region', 'alertRegion');
                var $alertBackdrop = ADK_AlertRegion.currentView.$el.data('bs.modal').$backdrop;
                if (_.isNumber(ADK_AlertRegion.currentView.$el.zIndex()) && $alertBackdrop instanceof jQuery && $alertBackdrop.length > 0){
                    $alertBackdrop.css('z-index', ADK_AlertRegion.currentView.$el.zIndex()-1);
                }
            }
        },
        initialize: function(alertOptions) {
            this.model.set(alertOptions);
            if (alertOptions) {
                if (alertOptions.messageView) {
                    this.messageView = new alertOptions.messageView(this.options);
                }
                if (alertOptions.footerView) {
                    this.footerView = new alertOptions.footerView(this.options);
                }
            }
        },
        regions: {
            'MessageRegion': '.modal-body',
            'FooterRegion': '.modal-footer'
        },
        onShow: function() {
            if (this.messageView) {
                this.showChildView('MessageRegion', this.messageView);
            }
            if (this.footerView) {
                this.showChildView('FooterRegion', this.footerView);
            }
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