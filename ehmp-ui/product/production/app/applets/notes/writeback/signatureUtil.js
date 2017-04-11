define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    'use strict';

    var SignModel = ADK.Resources.Writeback.Model.extend({
        methodMap: {
            'create': 'POST'
        },
        getUrl: function(method, options) {
            var url,
                opts = _.extend({
                    'params': this.params
                }, options),
                patient = ADK.PatientRecordService.getCurrentPatient(),
                standardParams = {
                    pid: patient.get('pid')
                },
                params = _.extend({}, standardParams, _.isFunction(opts.params) ? opts.params.apply(this, arguments) : opts.params),
                criteria = options.criteria || {},
                resource = null;

            if (patient.has("acknowledged")) {
                criteria._ack = true;
            }

            switch (method.toLowerCase()) {
                case 'create': //POST
                    resource = 'notes-sign';
                    break;
            }
            url = ADK.ResourceService.buildUrl(resource, criteria);
            url = ADK.ResourceService.replaceURLRouteParams(url, params);
            return url.replace(/\/+/g, '/').replace(/\?$/, ''); //replace multiple /'s with one and remove trailing '?'
        },
        parse: function() {
            return {};
        }
    });

    var signatureUtil = {
        signNote: function(context, successView, errorView) {
            var userSession = ADK.UserService.getUserSession();
            var self = context;
            var signNotesModel = new SignModel();
            var channel = ADK.Messaging.getChannel('notes');
            signNotesModel.set('signatureCode', context.model.get('esignCode'));
            context.model.unset("formStatus");
            signNotesModel.set('notes', new Backbone.Collection(context.model.get('notesChecklist').where({
                'value': true
            })));

            if (_.isEmpty(signNotesModel.get('notes'))) {
                context.model.errorModel.set({
                    notesChecklist: "Select at least one note"
                });
                return;
            }

            context.disableForm();
            var signer = {
                signerUid: userSession.get('duz') && userSession.get('duz')[userSession.get('site')],
                signer: userSession.get('lastname') + ',' + userSession.get('firstname'),
                signerDisplayName: userSession.get('lastname') + ',' + userSession.get('firstname')
            };
            signNotesModel.save(null, {
                parse: false,
                error: function(model, resp) {
                    context.enableForm();
                    var input;
                    try {
                        var response = JSON.parse(resp.responseText);
                        try {
                            var message = response.message;
                            if (message.indexOf('Invalid e-signature.') > -1) {
                                input = {
                                    message: message,
                                    ok_callback: function() {
                                        ADK.UI.Alert.hide();
                                        self.$('#esignCode').focus();
                                    }
                                };
                            }
                        } catch (e2) {
                            // sign error isn't defined
                        }
                    } catch (e) {
                        // Failed to parse response.
                    }

                    var saveErrorView = errorView;

                    if (input) {
                        var ErrorView = ADK.utils.appletUtils.getAppletView('esignature', 'error');
                        saveErrorView = new ErrorView(input);
                    }

                    saveErrorView.showModal();
                },
                success: function(model, resp) {
                    context.enableForm();
                    successView.show();
                    self.workflow.close();

                    try {
                        var signedNotes = resp.data.successes.signedNotes;
                        if (signedNotes.length > 0) {
                            var count = 0;
                            var models = _.map(signedNotes, function(item, index, all) {
                                item.count = count;
                                count = count + 1;
                                item.displayGroup = 'signed';
                                item.id = item.uid;
                                item.app = 'ehmp';
                                item.documentDefUidUnique = item.documentDefUid + '_' + item.localTitle + '_all';
                                return new ADK.UIResources.Writeback.Notes.Model(item);
                            });
                            var newCollection = new Backbone.Collection(models);
                            channel.trigger('note:signed', newCollection);
                        }
                    } catch (e) {
                        // no signedNotes array
                    }
                    // channel.trigger('tray:open');
                }
            });
        },
        addAttributes: function(collection) {
            _.each(collection.models, function(model, index, list) {
                model.set({
                    label: model.get('uid'),
                    name: model.get('uid')
                });
            });
        }
    };

    return signatureUtil;
});