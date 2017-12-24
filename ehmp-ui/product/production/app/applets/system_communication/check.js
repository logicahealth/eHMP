define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/system_communication/views/announcements',
    'app/applets/system_communication/viewedAllBehavior'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    AnnouncementsView,
    ViewedAllBehavior
) {
    "use strict";

    ADK.Messaging.getChannel('system_communication').on('register:check', function() {
        ADK.Checks.register(new ScreenDisplayCheck({
            id: 'system-communication-announcements'
        }));
    });
    ADK.Messaging.getChannel('system_communication').on('unregister:check', function() {
        ADK.Checks.unregister('system-communication-announcements');
    });

    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
            '<button type="button" class="btn btn-default" data-dismiss="modal" data-acknowledge="true" disabled>I Acknowledge</button>'
        )
    });
    var modalOptions = {
        'title': 'System Announcements',
        'size': 'large',
        'backdrop': 'static',
        'draggable': 'false',
        'keyboard': false,
        'footerView': FooterView,
        'callShow': true,
        'blocking': true
    };
    var Modal = ADK.UI.Modal.extend({
        initialize: function () {
            ADK.UI.Modal.prototype.initialize.apply(this, arguments);
            $(window).on('beforeunload.system.communication.announcements', function () {
                /**
                 * de8068 - this causes the system to log the user out 
                 * just like they had clicked cancel or the close buttons
                 */
                ADK.Messaging.trigger('app:logout');
            });
        },
        behaviors: _.defaults({
            ViewedAllBehavior: {
                behaviorClass: ViewedAllBehavior,
                container: '.modal-body',
                event: 'modal-shown'
            }
        }, ADK.UI.Modal.prototype.behaviors),
        events: _.defaults({}, ADK.UI.Modal.prototype.events, {
            'viewed-all': function(e) {
                this.$('button[data-acknowledge="true"]').removeAttr('disabled');
            },
            'click button[data-dismiss="modal"]': function(e) {
                e.preventDefault();
                if (_.isEqual($(e.currentTarget).attr('data-acknowledge'), "true")) {
                    ADK.SessionStorage.set.sessionModel('system_communication', { acknowledgedAnnouncements: true }, 'sessionStorage');
                    this.getOption('callback')();
                    return;
                }
                ADK.Checks.run('navigation', function() {
                    ADK.Messaging.trigger('app:logout');
                }, {
                    screenName: 'logon-screen'
                });
            }
        }),
        onRender: function() {
            this.$('.modal-body').addClass('bottom-padding-no');
        },
        onBeforeDestroy: function () {
            $(window).off('beforeunload.system.communication.announcements');
        }
    });

    var AnnouncementsViewWrapper = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile(
            '<p class="sr-only">Scroll to the end of the announcements to continue to eHMP</p>' +
            '<div class="row"><div class="announcements-wrapping-container container-fluid" tabIndex="-1"></div></div>' +
            '<div class="container-fluid"><div class="row top-padding-md">' +
            '<a href="#" class="return-to-top-link top-padding-xs">Back to top</a>' +
            '</div></div>'
        ),
        regions: {
            'announcementsRegion': '.announcements-wrapping-container'
        },
        onBeforeShow: function() {
            this.showChildView('announcementsRegion', new AnnouncementsView(this.options));
        },
        events: {
            'click a.return-to-top-link': function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.$('> p')[0].scrollIntoView();
                this.$('.announcements-wrapping-container').focus();
            }
        }
    });

    var ScreenDisplayCheck = ADK.Checks.CheckModel.extend({
        initialize: function() {
            ADK.Checks.CheckModel.prototype.initialize.call(this, arguments);
            this.announcementsCollection = ADK.Messaging.getChannel('system_communication').request('get:announcements');
        },
        validate: function(attributes, validateOptions) {
            var savedPreferences = ADK.SessionStorage.get.sessionObject('system_communication', 'sessionStorage') || {};
            var value = _.get(savedPreferences, 'acknowledgedAnnouncements');
            // Null value means that there are no announcements to acknowledge
            if ((_.isBoolean(value) && value) || _.isNull(value)) {
                return;
            }
            return 'User has not acknowledged the system terms and announcements!';
        },
        defaults: {
            label: 'System Announcements Acknowledgement',
            failureMessage: 'User has not acknowledged the system terms and announcements!',
            beforeunload: false,
            group: 'screen-display',
            onInvalid: function(invalidOptions) {
                invalidOptions = invalidOptions || {};
                var options = invalidOptions.options || {};
                var checkConfig = invalidOptions.checkConfig || {};
                var onPassCallback = invalidOptions.onPass || function() {
                    return true;
                };
                var screenDisplayCallback = _.get(options, 'callback', _.noop);
                if (_.has(this.announcementsCollection, 'xhr') && _.isEqual(_.get(this.announcementsCollection, 'xhr.state', _.noop)(), 'pending')) {
                    delete options.callback;
                    ADK.Checks.run('navigation', onPassCallback, { exclude: checkConfig.id });
                    ADK.Messaging.trigger('show:app:loading');
                    this.listenToOnce(this.announcementsCollection, 'sync error', function(collection) { this.fetchComplete(collection, screenDisplayCallback); });
                } else if (!this.announcementsCollection.isEmpty()) {
                    var modalView = new Modal({
                        view: new AnnouncementsViewWrapper({ globalAnnouncementsCollection: this.announcementsCollection }),
                        options: modalOptions,
                        callback: screenDisplayCallback
                    });
                    delete options.callback;
                    ADK.Checks.run('navigation', onPassCallback, { exclude: checkConfig.id });
                    modalView.show();
                    modalView.trigger('modal-shown');
                } else {
                    ADK.SessionStorage.set.sessionModel('system_communication', { acknowledgedAnnouncements: null }, 'sessionStorage');
                    ADK.Checks.run('navigation', onPassCallback, { exclude: checkConfig.id });
                }
            }
        },
        fetchComplete: function(collection, screenDisplayCallback) {
            this.stopListening(this.announcementsCollection, 'sync error');
            ADK.Messaging.trigger('hide:app:loading');
            if (!collection.isEmpty()) {
                var modalView = new Modal({
                    view: new AnnouncementsViewWrapper({ globalAnnouncementsCollection: this.announcementsCollection }),
                    options: modalOptions,
                    callback: screenDisplayCallback
                });
                modalView.show();
                modalView.trigger('modal-shown');
            } else if (_.isFunction(screenDisplayCallback)) {
               screenDisplayCallback();
            }
        }
    });
    return ScreenDisplayCheck;
});
