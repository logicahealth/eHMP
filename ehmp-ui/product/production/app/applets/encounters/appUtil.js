define([
    'underscore',
    'backbone'
], function(_, Backbone) {
    'use strict';
    /* global ADK */

    return {
        FILTER_FIELD: 'custom_filter_field',
        getCPTprocedureDetailViewModel: function(view) {
            var recent = _.get(view, 'model.attributes.collection.models[0]', new Backbone.Model());
            var uid = recent.get('uid');

            var result;
            var model;
            //we could probably just look in the aggregate's subcollection but I need a valid test case to proof
            var collection = _.get(view, 'collection.collection');
            if (!_.isUndefined(collection)) {
                model = collection.findWhere({
                    kind: "Visit",
                    uid: uid
                });
                if (!_.isUndefined(model)) {
                    result = model.toJSON();
                } else {
                    result = {
                        fError: true,
                        summary: "Error",
                        errorMsg: "Sorry, there is no detailed information about this event!"
                    };
                }
            }
            return result;
        },
        showDetailView: function(paramObj, channelName) {
            var recent = _.get(paramObj, 'model.attributes.recent[0]', new Backbone.Model());

            var channelObject = _.extend({}, paramObj, {
                model: recent,
                uid: recent.get('uid')
            });
            var channel = ADK.Messaging.getChannel(channelName);
            var response = channel.request('detailView', channelObject);
            var viewDetail = new response.view();
            var modal = new ADK.UI.Modal({
                view: viewDetail,
                options: {
                    size: "large",
                    showLoading: true,
                    title: function() {
                        return _.result(response, 'title') || _.result(viewDetail, 'title');
                    }
                }
            });
            modal.show();

        },
        stripCharacters: function(string) {
            return string.replace(/[\s\\\/()!?*&:;,.^'"<>%]/g, '');
        }
    };
});