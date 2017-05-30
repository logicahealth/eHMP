define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/system_communication/check'
], function(
    Backbone,
    Marionette,
    _,
    Check
) {
    "use strict";

    var Model = ADK.Collections.BaseCollection.prototype.model.extend({
        parse: function(item) {
            var data = {
                "category": _.get(item, 'category[0].code'),
                "title": _.get(item, 'payload[0].content[0].title'),
                "content": _.get(item, 'payload[0].content[0].contentString'),
                "sender": _.get(item, 'sender.name'),
                "sent": _.get(item, 'sent')
            };
            return data;
        }
    });

    var Collection = ADK.Collections.BaseCollection.extend({
        model: Model,
        initialize: function() {
            ADK.Collections.BaseCollection.prototype.initialize.apply(this, arguments);
            this.fetch.onError = function(error){
                console.error("Failed to retrieve EHMP Announcements. Ensure that the current version of application supports this feature.\n", error);
            };
            this.appVersion = ADK.Messaging.request("appManifest").get('overall_version');
            this.userModel = ADK.UserService.getUserSession();
            this.listenTo(ADK.Messaging, 'app:logged-in', this.updateAnnouncements);
            this.listenTo(ADK.Messaging, 'app:logout', this.reset);
        },
        updateAnnouncements: function() {
            if (_.isEmpty(this.userModel.get('uid'))) {
                this.reset();
                ADK.Messaging.getChannel('system_communication').trigger('unregister:check');
                return;
            }
            ADK.Messaging.getChannel('system_communication').trigger('register:check');
            this.fetch.try(this);
        },
        fetchOptions: function() {
            return {
                type: 'GET',
                cache: true,
                patientData: false,
                resourceTitle: 'ehmp-announcements',
                allowAbort: true,
                timeout: 15000,
                data: {
                    'requester.userId': this.userModel.get('uid'),
                    'requester.ehmpAppVersion': this.appVersion,
                    'category': [
                        'http://ehmp.DNS   /messageCategories/announcements-system',
                        'http://ehmp.DNS   /messageCategories/announcements-terms'
                    ]
                }
            };
        },
        parse: function(response) {
            return _.get(response, 'data.items.communication', response);
        }
    });
    var collection = new Collection();
    ADK.Messaging.getChannel('system_communication').reply('get:announcements', collection);
    collection.updateAnnouncements();
    return collection;
});
