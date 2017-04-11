define([
    'main/ADK',
    'backbone',
    'marionette',
    'handlebars',
], function(ADK, Backbone, Marionette, Handlebars) {
    'use strict';

    return (function() {

        /**
         * Create an ADK Alert Dialog Box that can handle callbacks on cancel and confirm
         * @param  {Object}        options: Dialog box which will process the following parameters:
         *                                  * title: The title of the dialog box (default: 'Alert')
         *                                  * message: The message displayed in the dialog box (default: 'Are you sure?')
         *                                  * icon: The icon type to display with the alert (default: 'fa-exclamation-triangle font-size-18 color-red')
         *                                  * confirmButton: Text to user for the 'Confirm' button (default: 'OK')
         *                                  * cancelButton: Text to use for the 'Cancel' button (default: 'Cancel')
         *                                  * confirmTitle: Text to user for the 'Confirm' button title
         *                                  * cancelTitle: Text to use for the 'Cancel' button title
         *                                  * onConfirm: Function called when user presses the 'confirm' button (default: no-op)
         *                                  * onCancel: Function called when user presses the 'cancel' button (default: no-op)
         * @return {ADK.UI.Alert}         [description]
         */
        var DialogBox = function(options) {
            options = options || {};

            var message = options.message || 'Are you sure?';
            var confirmButton = options.confirmButton || 'OK';
            var cancelButton = options.cancelButton || 'Cancel';
            var confirmTitle = options.confirmTitle || ('Press enter to ' + confirmButton.toLowerCase());
            var cancelTitle = options.cancelTitle || ('Press enter to ' + cancelButton.toLowerCase());
            var onConfirm = options.onConfirm;
            var onCancel = options.onCancel;

            this.title = options.title || 'Alert';
            this.icon = options.icon || 'fa-exclamation-triangle font-size-18 color-red';
            this.context = options.context || this;

            this.MessageView = Marionette.ItemView.extend({
                template: Handlebars.compile(message),
                tagName: 'p'
            });

            this.FooterView = Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '{{ui-button "' + cancelButton + '" classes="btn-default" title="Press enter to ' + cancelTitle + '."}}',
                    '{{ui-button "' + confirmButton + '" classes="btn-primary" title="Press enter to ' + confirmTitle + '."}}'
                ].join('\n')),
                events: {
                    'click .btn-primary': function() {
                        if (_.isFunction(onConfirm)) {
                            onConfirm.apply(this.context);
                        }
                        ADK.UI.Alert.hide();
                        ADK.UI.Workflow.hide();
                    }.bind(this),
                    'click .btn-default': function() {
                        if (_.isFunction(onCancel)) {
                            onCancel.apply(this.context);
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
             */
            show: function(context) {
                if (!_.isUndefined(context)) {
                    this.context = context;
                }

                var alert = new ADK.UI.Alert({
                    title: this.title,
                    icon: this.icon,
                    messageView: this.MessageView,
                    footerView: this.FooterView
                });
                alert.show();
            }
        };

        return {
            DialogBox: DialogBox
        };
    })();
});
