define([
    "backbone",
    "jquery",
    "marionette",
    "underscore",
    'api/Messaging',
    'main/Utils',
    "hbs!main/components/views/popupTemplate"
], function(Backbone, $, Marionette, _, Messaging, Utils, PopupTemplate) {
    "use strict";

    var defaultPopup = {
        title: '',
        header: '',
        body: '',
        footer: '',
        buttons: true
    };
    var model = new Backbone.Model(_.clone(defaultPopup));

    var clearsession = false;

    /**
     * PopupView pop up rendering using bootstrap.
     * based on application usage. After 12 min of inactivity a popup
     */
    var PopupView = Backbone.Marionette.ItemView.extend({
        tag: 'div',
        attributes: {
            'role': 'dialog',
            'tabindex': '-1'
        },
        id: 'base-modal',
        className: 'modal fade autologoff',
        template: PopupTemplate,
        regions: {
            dialog: '#autologoff-alert-dialog'
        },
        isShown: false,
        events: {
            "show.bs.modal": function() {
                var zIndex = Utils.cssCalc.zIndex.getNextLayer();
                this.$el.css('z-index', zIndex * 2);
            },
            "shown.bs.modal": function(){
                this.isShown = true;
                this.focus();
            },
            "hide.bs.modal": function() {
                this.isShown = false;
                this.triggerContinue();
            },
            "click #ContBtn": "continue",
            "click #LgtBtn": "logoff"
        },

        modelEvents: {
            'change': 'fieldsChanged'
        },

        fieldsChanged: function() {
            this.show();
        },

        initialize: function() {
            _(this).bindAll();
            this.render();
        },

        continue: function(e) {
            e.preventDefault();
            clearsession = false;
            this.hide(); //will trigger continue
        },

        resetModel: function() {
            this.setModel(_.clone(defaultPopup), true);
        },

        show: function() {
            clearsession = false;
            this.render();
            this.$el.modal('show');
            $(this.dialog).show();
        },

        hide: function() {
            this.$el.modal('hide');
        },

        dialogReset: function() {
            $(this.dialog).blur();
            this.dialog.reset();
        },

        triggerContinue: function() {
            //reset the model
            this.setModel(_.clone(defaultPopup), true);
            if (clearsession === false) {
                //only allow the refresh to happen when we click to continue
                Messaging.trigger('autologoff:continue');
            }
        },

        focus: function() {
            $(this.dialog).focus();
        },

        logoff: function(e) {
            clearsession = true;
            this.hide();
            //be sure to logoff
            Messaging.trigger('app:logout');
        },

        logout: function() {
            if (this.isVisible()) {
                this.render();
            } else {
                this.show();
            }
            // be sure logoff gets called
            Messaging.trigger('app:logout');
            this.resetModel();
        },

        setModel: function(popup, silent) {
            if (!_.isBoolean(silent)) {
                silent = false;
            }
            this.model.set(popup, {
                'silent': silent
            });
        },

        getDefaultModel: function() {
            return _.clone(defaultPopup);
        },

        extendDefaultModel: function(options) {
            return _.extend(_.clone(defaultPopup), options);
        },
        isVisible: function(){
            return this.isShown;
        }
    });

    var popup = new PopupView({
        model: model
    });

    return popup;
});
