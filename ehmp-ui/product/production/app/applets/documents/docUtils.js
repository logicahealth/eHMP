define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/documents/debugFlag"
], function(Backbone, Marionette, _, DEBUG) {
    "use strict";
    var ERROR_LOG = DEBUG.errorLog;
    var docUtils = {
        // return true if the arrayGroup or any properties contain the docId value
        hasDocIdRecord: function(aGroup, docId) {
            var isDocIdRecord = false;
            if (aGroup && docId) {
                _.each(aGroup, function(item) {
                    var vals = _.values(item);
                    if (_.contains(vals, docId)) {
                        isDocIdRecord = true;
                        return isDocIdRecord;
                    }
                });
                return isDocIdRecord;
            }
            return isDocIdRecord;
        },

        getSummaryModelText: function(summaryModel) {
            var obj = summaryModel.get('text');
            var text = obj && _.pluck(obj, 'content');
            return text && text.length && text[0];
        },

        getDocModelFromUid: function(uid, callback) {
            var model = new Backbone.Model();
            if (!uid || !callback || !_.isFunction(callback)) {
                return model;
            }
            this.callback = callback;
            var fetchOptions = {};
            fetchOptions.pid = ADK.PatientRecordService.getCurrentPatient();
            fetchOptions.onError = function (model, response) {
                            if (DEBUG)  console.log("Documents docUtils fetch Error");
                        };
            fetchOptions.criteria = {
                uid: uid
            };
            fetchOptions.resourceTitle = 'uid';
            this.allDocs = ADK.PatientRecordService.fetchCollection(fetchOptions);
            this.allDocs.on('sync', function() {
                if (this.callback) this.callback(this.allDocs);
            }, this);
        }
    };

    return docUtils;
});
