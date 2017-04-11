define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'underscore',
    'api/Messaging',
    'bootstrap-notify'
], function(Backbone, Marionette, $, Handlebars, _, Messaging, BootstrapNotify) {
    'use strict';

    // This keeps all of sticky growls currently being displayed on the screen.
    // Format is {<<sticky growl element unique id>>: <<growl title & content string>>, ...}
    var stickyGrowls = {};

    var NotificationAlert = function(options) {
        var alertOptions = _.defaults(options, {
            autoClose: true
        });

        alertOptions.sticky = !alertOptions.autoClose;

        this.show = function() {
            var notify = $.notify;
            notify({
                // options go here
                icon: this.icon || null,
                title: this.title || null,
                message: this.message || ''
            }, {
                // settings go here
                delay: alertOptions.sticky ? '0' : '5000',
                type: (this.type ? 'custom ' + this.type : 'custom basic'),
                onClick: alertOptions.onClick,
                isDuplicateSticky: function() {
                    var isDuplicateSticky = false;
                    if (alertOptions.sticky) {
                        var currentText = this.text().trim();
                        // Compare title & content string
                        var matchingIndex = _.indexOf(_.values(stickyGrowls), currentText);

                        if (matchingIndex > -1) {
                            isDuplicateSticky = true;
                        } else {
                            this.uniqueId();
                            stickyGrowls[this.attr('id')] = currentText;
                        }
                    }
                    return isDuplicateSticky;
                },
                unregisterSticky: function() {
                    if (alertOptions.sticky) {
                        delete stickyGrowls[this.attr('id')];
                    }
                },
                placement: {
                    from: 'top',
                    align: 'right'
                },
                offset: {
                    y: 32,
                    x: 20
                },
                animate: {
                    enter: 'animated bounceIn',
                    exit: 'animated bounceOut'
                },
                z_index: 1060,
                template: '<div data-notify="container" class="growl-alert growl-alert-user col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                    '   <div class="alert-content">' +
                    '       <span data-notify="icon"></span>' +
                    '       <span class="notify-message" role="alertdialog">' +
                    '           <span data-notify="title">{1}</span>' +
                    '           <span data-notify="message">{2}</span>' +
                    '       </span>' +
                    '       <button type="button" class="close" data-notify="dismiss" title="Press enter to close the alert, or wait ten seconds for autodismissal"><i class="fa fa-times"></i></button>' +
                    '       <div class="progress" data-notify="progressbar">' +
                    '           <div class="progress-bar progress-bar-{0} percent-width-0" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>' +
                    '       </div>' +
                    '       <a href="{3}" target="{4}" data-notify="url"></a>' +
                    '   </div>' +
                    '</div>',
                onShown: function() {
                    this.previouslyFocusedItem = this.previouslyFocusedItem || $(':focus:not([data-notify="container"])');
                    $('[data-notify="container"]').uniqueId().focus(); // focus growl alert so screen reader reads it.
                },
                onClosed: function() {
                    if (this.previouslyFocusedItem && $(this.previouslyFocusedItem).length > 0) {
                        $(this.previouslyFocusedItem).focus();
                    }
                    delete this.previouslyFocusedItem;
                }
            });
            return true;
        };
        this.message = alertOptions.message || alertOptions.notificationText || '';
        this.type = alertOptions.type || alertOptions.notificationType || null;
        this.title = alertOptions.title || '';
        this.icon = (alertOptions.icon ? 'fa ' + alertOptions.icon : undefined);
    };

    NotificationAlert.hide = function() {
        $.notifyClose();
    };
    return NotificationAlert;


});