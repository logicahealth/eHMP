define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/documents/debugFlag",
    'app/applets/documents/appletHelper',
], function(Backbone, Marionette, _, DEBUG, AppletHelper) {
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

        docInCurrentSite: function(doc) {
            return doc.get('uid').split(':')[3] === ADK.UserService.getUserSession().get('site');
        },

        getSummaryModelText: function(summaryModel) {
            var obj = summaryModel.get('text');
            var text = obj && _.pluck(obj, 'content');
            return text && text.length && text[0];
        },

        getDoc: function (uid, callback) {
            var modalCollection = ADK.PatientRecordService.createEmptyCollection(docFetchOptions);
            this.listenToOnce(modalCollection, 'fetch:success', function() {
                this.stopListening(modalCollection, 'fetch:error');
                return callback(null, modalCollection.models[0]);
            });
            this.listenToOnce(modalCollection, 'fetch:error', function() {
                this.stopListening(modalCollection, 'fetch:success');
                return callback('error', null);
            });
            var docFetchOptions = {
                cache: false,
                pageable: true,
                resourceTitle: 'patient-record-document-view',
                allowAbort: true,
                viewModel: {
                    parse: function(response) {
                        return AppletHelper.parseDocResponse(response);
                    }
                },
                criteria:{
                    filter: 'eq(uid, "' +uid+'")'
                },
            };
            ADK.PatientRecordService.fetchCollection(docFetchOptions, modalCollection);
        },
        showDocError: function() {
            var message = 'Unable to fetch document. Refresh documents to try again.';
            var errorView = new ADK.UI.Notification({
                title: 'Warning',
                message: message,
                type: 'warning'
            });
            errorView.show();
        },
        canAddAddendum: function(model) {
            if (ADK.UserService.hasPermission('sign-note-addendum') && model.get('documentClass') === 'PROGRESS NOTES' && this.docInCurrentSite(model)) {
                //more criteria to be added in US13428, US13621 and US11953
                var permissions = model.get('asuPermissions');
                return _.includes(permissions, 'MAKE ADDENDUM');
            }
            return false;
        },
    };

    return docUtils;
});
