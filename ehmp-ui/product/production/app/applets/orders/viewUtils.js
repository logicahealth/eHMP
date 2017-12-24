define([
    'main/ADK',
    'backbone',
    'marionette',
    'handlebars',
], function(ADK, Backbone, Marionette, Handlebars) {
    'use strict';

    /**
     * Create an ADK Alert Dialog Box that can handle callbacks on cancel and confirm
     * @param  {Object}        options: Dialog box which will process the following parameters:
     *                                  * title: The title of the dialog box (default: 'Alert')
     *                                  * message: The message displayed in the dialog box (default: 'Are you sure?')
     *                                  * icon: The icon type to display with the alert (default: 'fa-exclamation-triangle font-size-18 color-red')
     *                                  * confirmButton: Text to user for the 'Confirm' button (default: 'OK')
     *                                  * cancelButton: Text to use for the 'Cancel' button (default: 'Cancel')
     *                                  * confirmButtonClasses: Extra classes to for the 'Confirm' button (default: 'btn-default btn-sm')
     *                                  * cancelButtonClasses: Text to use for the 'Cancel' button (default: btn-primary btn-sm')
     *                                  * onConfirm: Function called when user presses the 'confirm' button (default: no-op)
     *                                  * onCancel: Function called when user presses the 'cancel' button (default: no-op)
     * @return {ADK.UI.Alert}         [description]
     */
    var DialogBox = function(options) {
        options = options || {};

        var message = options.message || 'Are you sure?';
        var confirmButton = options.confirmButton || 'OK';
        var cancelButton = options.cancelButton || 'No';
        var confirmButtonClasses = options.confirmButtonClasses || 'btn-primary btn-sm';
        var cancelButtonClasses = options.cancelButtonClasses || 'btn-default btn-sm';
        var onConfirm = options.onConfirm;
        var onCancel = options.onCancel;

        this.title = options.title || 'Warning';
        this.icon = options.icon || 'icon-triangle-exclamation';
        this.context = options.context || this;
        this.callbackOptions = options.callbackOptions || this;

        this.MessageView = Marionette.ItemView.extend({
            template: Handlebars.compile(message),
            tagName: 'p'
        });

        this.FooterView = Marionette.ItemView.extend({
            template: Handlebars.compile([
                '{{ui-button "' + cancelButton + '" classes="cancel ' + cancelButtonClasses + '"}}',
                '{{ui-button "' + confirmButton + '" classes="confirm ' + confirmButtonClasses + '"}}'
            ].join('\n')),
            events: {
                'click .confirm': function() {
                    if (_.isFunction(onConfirm)) {
                        onConfirm.call(this.context, this.callbackOptions);
                    }
                    ADK.UI.Alert.hide();
                    ADK.UI.Workflow.hide();
                }.bind(this),
                'click .cancel': function() {
                    if (_.isFunction(onCancel)) {
                        onCancel.call(this.context, this.callbackOptions);
                    }
                    ADK.UI.Alert.hide();
                }.bind(this)
            },
            tagName: 'span'
        });
    };

    DialogBox.prototype = {

        /**
         * Show the DialogBox defined by the class.  This call will instantiate an ADK UI Alert with the
         * configured parameters and launch the alert using the 'show()' method.
         * @param  {Object} context: [Optional] The execution context for the 'onConfirm' and 'onCancel'
         *                           functions, if defined.
         * @param  {Object} options: [Optional] Options to pass to the callbacks. You can also pass in
         *                           a model to be used when rendering the message view:
         *                           {model: <<YOUR MODEL INSTANCE>>}
         */
        show: function(context, options) {
            if (!_.isUndefined(context)) {
                this.context = context;
            }
            if (!_.isUndefined(options)) {
                this.callbackOptions = options;
                this.model = options.model;
            }

            var alertOptions = {
                title: this.title,
                icon: this.icon,
                messageView: this.MessageView,
                footerView: this.FooterView,
            };
            if (!_.isUndefined(this.model)) {
                alertOptions.model = this.model;
            }

            var alert = new ADK.UI.Alert(alertOptions);
            alert.show();
        }
    };

    return {
        DialogBox: DialogBox
    };
});
