define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/notes/writeback/operationConfirmationView',
    'app/applets/notes/writeback/errorView'
], function(Backbone, Marionette, _, moment, ConfirmationView, ErrorView) {
    'use strict';
    var channel = ADK.Messaging.getChannel('notes');
    var LINE_LENGTH = 80;

    var util = {

        NOTE_GROUP_RECENT_TITLES: 'Recent Note Titles',
        NO_PERMISSION_FOR_ADDENDUM: 'You may not VIEW this UNSIGNED Addendum.',

        getUser: function() {
            var site = ADK.UserService.getUserSession().get('site');
            return ADK.UserService.getUserSession().get('duz')[site];
        },
        getUserId: function() {
            return 'urn:va:user:' + ADK.UserService.getUserSession().get('site') + ':' + this.getUser();
        },

        getPermissions: function(model, requestedActions) {
            var usite = ADK.UserService.getUserSession().get('site');
            var uduz = ADK.UserService.getUserSession().get('duz');
            var data = {
                "data": {
                    "items": [model]
                },
                actionNames: requestedActions
            };
            var fetchOptions = {
                resourceTitle: 'evaluate-with-action-names',
                fetchType: 'POST',
                criteria: data,
                onSuccess: function(collection) {
                    var perms = _.chain(collection.models)
                        .filter(function(perm) {
                            return perm.get('hasPermission') === true;
                        })
                        .map(function(perm) {
                            return perm.get('actionName');
                        })
                        .value();
                    model.trigger('asu:permissions:success', perms);
                },
                onError: function(model, response) {
                    model.trigger('asu:permissons:error');
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        setEncounterDisplayName: function(model) {
            var encounterName = model.get('encounterName');
            var encounterDisplayName = null;
            var encounterInfo = null;
            var encounterDate = null;
            var encounterDateStr = null;
            if (encounterName) {
                if (encounterName.length > 16) {
                    // handle encounterName in format "General Medicine05/27/2005 10:00"
                    encounterDateStr = encounterName.substring(encounterName.length - 16);
                    if (encounterDateStr.split('/').length === 3) {
                        encounterInfo = encounterName.substring(0, encounterName.length - 16);
                        encounterDate = moment(encounterDateStr, 'MM/DD/YYYY HH:mm').format('MM/DD/YYYY');
                        encounterDisplayName = encounterInfo.trim() + ': ' + encounterDate;
                    }
                }
                if (!encounterDisplayName && encounterName.length > 12) {
                    // handle encounterName in format "General Medicine May 27, 2005"
                    encounterInfo = encounterName.substring(0, encounterName.length - 12);
                    encounterDateStr = encounterName.substring(encounterName.length - 12);
                    encounterDate = moment(encounterDateStr, 'MMM DD, YYYY').format('MM/DD/YYYY');

                    if (encounterDate.toLowerCase() !== 'invalid date') {
                        encounterDisplayName = encounterInfo.trim() + ': ' + encounterDate;
                    }
                }
            }
            if (!encounterDisplayName) {
                encounterDisplayName = encounterName;
            }
            model.set('encounterDisplayName', encounterDisplayName);
        },
        formatTextContent: function(model) {
            if (model.get('text') && model.get('text')[0]) {
                var text = model.get('text')[0];
                if (text.content) {
                    text.contentPreview = this.format80CharLines(text.content);
                    model.set('contentPreview', text.contentPreview);
                }
            }

            if (model.has('addenda')) {
                _.each(model.get('addenda'), function(addendum) {
                    var addendemText = _.get(addendum, 'text[0]');
                    if (addendemText) {
                        addendemText.contentPreview = this.format80CharLines(addendemText.content);
                    }
                }, this);
            }
            return model;
        },
        format80CharLines: function (content) {
            // Generate the body text
            var textLines = content.split('\n');
            var formattedLines = [];
            for (var j = 0; j < textLines.length; j++) {
                var line = textLines[j].trim();
                while (line.length > LINE_LENGTH) {
                    var maxLine = line.substr(0, LINE_LENGTH);
                    var index = (maxLine.lastIndexOf(' ') + 1) || LINE_LENGTH;
                    var thisLine = maxLine.substr(0, index);
                    formattedLines.push(thisLine);
                    line = line.substring(index);
                }
                formattedLines.push(line);
            }

            return formattedLines.join('\n');
        },
        formatSignatureContent: function(model) {
            // Heal bad data
            if (_.isEmpty(model)) {
                model = new Backbone.model();
            }

            // Show the signature
            if (model.has('clinicians') && model.get('clinicians').length > 0) {
                model.set('signaturePreview', this.getSignature(model.get('clinicians')));
            }

            // Show signatures for addenda
            if (model.has('addenda')) {
                _.each(model.get('addenda'), function(addendum) {
                    var addendumText = _.get(addendum, 'text[0]');
                    if (addendumText && addendumText.clinicians && addendumText.clinicians.length > 0) {
                        addendumText.signaturePreview = this.getSignature(addendumText.clinicians);
                    }
                }, this);
            }
        },
        getSignature: function(clinicians) {
            // Inject any and all signatures by clinician signers into the model argument's signaturePreview field
            var signatures = '';
            _.each(clinicians, function(val, key) {
                var signer = val;
                if (!_.isEmpty(signer) && _.has(signer, 'role') && (signer.role === 'S' || signer.role === 'C')) {
                    var signedDateTime = moment(signer.signedDateTime, 'YYYYMMDDHHmmss').format('MM/DD/YYYY - HH:mm');
                    var signatureSuffix = '';

                    if (signer.signaturePrintedName && signer.signatureTitle) {
                        signatureSuffix = signer.signaturePrintedName + ' ' + signer.signatureTitle;
                    } else {
                        signatureSuffix = signer.signature;
                    }

                    var signedText = '\nSigned: ';

                    if (signer.role === 'C') {
                        signedText = '\nCosigned: ';
                    }

                    signatures += signedText + signedDateTime +
                        '\nBy: ' + signatureSuffix + '\n';
                }
            });

            return signatures;
        },
        detectCosigner: function(model) {
            // Descope
            if (!_.isObject(model)) {
                return 'invalid model argument passed to detectCosigner()';
            }
            var clinicians = model.get('clinicians');
            if (!_.isObject(clinicians)) {
                return 'malformed clinicians object in model argument in detectCosigner()';
            }
            var expectedCosigner = _.findWhere(clinicians, {
                'role': 'EC'
            });
            if (_.isEmpty(expectedCosigner) || _.isEmpty(expectedCosigner.uid) || expectedCosigner.uid.length < 1) {
                return 'undefined or malformed cosigner in detectCosigner()';
            }

            // Simplify
            var currentUserId = ADK.UserService.getUserSession().get('duz')[ADK.UserService.getUserSession().get('site')];
            var expectedCosignerId = _.last(expectedCosigner.uid.split(':'));

            // Set for UI
            if (currentUserId === expectedCosignerId) {
                model.set('userCanCosign', true);
            }
        },
        prepareUnsignedAddendumForPreview: function(unsignedAddendumModel, parentNoteModel) {
            if (!parentNoteModel.has('addenda') || _.isEmpty(parentNoteModel.get('addenda'))) {
                var addenda = [];

                _.each(parentNoteModel.get('text'), function(text, index) {
                    if (index === 0) {
                        return;
                    }
                    var addendum = {'text': []};
                    addendum.text.push(_.clone(text));
                    addenda.push(addendum);
                }, this);

                parentNoteModel.set('addenda', addenda);
            }

            if (parentNoteModel.has('addenda')) {
                var currentAddendum = _.find(parentNoteModel.get('addenda'), {isCurrentAddendum: true});

                if (!currentAddendum) {
                    currentAddendum = _.find(parentNoteModel.get('addenda'), {uid: unsignedAddendumModel.get('uid')});
                }

                if (!currentAddendum) {
                    currentAddendum = {
                        'text': []
                    };

                    parentNoteModel.get('addenda').push(currentAddendum);
                }

                currentAddendum.text[0] = _.clone(unsignedAddendumModel.get('text')[0]);
                currentAddendum.isCurrentAddendum = true;

                if (!currentAddendum.text[0].authorDisplayName) {
                    currentAddendum.text[0].author = ADK.UserService.getUserSession().get('lastname') + ',' + ADK.UserService.getUserSession().get('firstname');
                    currentAddendum.text[0].authorDisplayName = currentAddendum.text[0].author.replace(/\w*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
                }
            }
        },
        previewAddendaAddWarningBanner: function(parentNoteModel) {
            if (parentNoteModel.has('addenda')) {
                var userUid = 'urn:va:user:' + ADK.UserService.getUserSession().get('site') + ':' + ADK.UserService.getUserSession().get('duz')[ADK.UserService.getUserSession().get('site')];

                _.each(parentNoteModel.get('addenda'), function(addendum) {
                    if (addendum.text[0].authorUid !== userUid) {
                        if (addendum.text[0].content.indexOf(this.NO_PERMISSION_FOR_ADDENDUM) > -1) {
                            addendum.text[0].noPermission = true;
                        }
                    }

                    if (addendum.status === 'UNCOSIGNED') {
                        var clinicians = (addendum.clinicians || []);
                        _.each(clinicians, function(clinician) {
                            if (clinician && clinician.role && clinician.uid && clinician.role === 'EC') {
                                if (clinician.uid === userUid) {
                                    addendum.text[0].userCanCosignAddendum = true;
                                } else {
                                    addendum.text[0].userAwareOfCosignRequirement = true;
                                }
                                return;
                            }
                        });
                    }
                }, this);
            }
        },
        formatRelativeTime: function(dateString) {
            if (dateString) {
                // the moment 2.10.5+ way:
                // return moment(dateString, 'YYYYMMDDHHmmss').calendar(null, {
                //     sameDay: '[Today at] HH:mm',
                //     nextDay: '[Tomorrow at] HH:mm',
                //     nextWeek: 'dddd [at] HH:mm',
                //     lastDay: '[Yesterday at] HH:mm',
                //     lastWeek: '[Last] dddd [at] HH:mm'
                // });

                // the moment 2.7 way:
                var calendarString = moment(dateString, 'YYYYMMDDHHmmss').calendar(null, {
                    sameDay: '[Today at] HH:mm'
                });
                return calendarString;
            }
            return '';
        },
        deleteAddendumWithPrompt: function(model, config) {
            config = config || {};
            var self = this;
            var message = 'Are you sure you want to delete?';

            var confirmationConfig = {
                message: message,
                title: 'Delete Addendum',
                title_icon: 'icon-triangle-exclamation',
                yes_callback: function() {
                    self.deleteAddendum(model, config);
                },
                no_callback: function() {
                    if (_.isFunction(config.completeCallback)) {
                        config.completeCallback();
                    }
                }
            };

            var deleteConfirmationView = new ConfirmationView(confirmationConfig);
            deleteConfirmationView.showModal();
        },
        deleteNoteWithPrompt: function(model, config) {
            config = config || {};
            var self = this;
            var message = 'Are you sure you want to delete?';

            var confirmationConfig = {
                message: message,
                title: 'Delete',
                title_icon: 'icon-triangle-exclamation',
                yes_callback: function() {
                    self.deleteNote(model, config);
                },
                no_callback: function() {
                    if (_.isFunction(config.completeCallback)) {
                        config.completeCallback();
                    }
                }
            };

            var deleteConfirmationView = new ConfirmationView(confirmationConfig);
            deleteConfirmationView.showModal();
        },
        deleteAddendum: function(model, config) {
            config = config || {};

            if (model.get('status') === 'UNSIGNED') {
                var criteria = {};

                model.destroy({
                    criteria: criteria,
                    error: function(model, resp) {
                        var message;
                        if (_.isUndefined(config.errorMessage)) {
                            config.errorMessage = 'There was an error deleting your addendum. Contact your System Administrator for assistance.';
                        }
                        if (resp.responseJSON && resp.responseJSON.message) {
                            config.errorMessage += '<br><strong>' + resp.responseJSON.message;
                        }

                        if (!config.silent) {
                            var input = {
                                message: config.errorMessage
                            };

                            var deleteErrorView = new ErrorView(input);
                            deleteErrorView.showModal();
                        }

                        if (_.isFunction(config.errorCallback)) {
                            config.errorCallback();
                        }

                        if (_.isFunction(config.completeCallback)) {
                            config.completeCallback();
                        }
                    },
                    success: function(model, resp) {
                        channel.trigger('addendum:deleted', model);
                        ADK.Messaging.getChannel('tray-tasks').trigger('action:refresh');

                        if (_.isFunction(config.completeCallback)) {
                            config.completeCallback();
                        }

                        if (_.isFunction(config.successCallback)) {
                            config.successCallback();
                        }

                        // channel.trigger('notestray:opening');

                        if (!config.silent) {
                            var deleteAlertView = new ADK.UI.Notification({
                                title: 'Success',
                                message: 'Addendum deleted',
                                type: 'success'
                            });

                            deleteAlertView.show();
                        }
                    }
                });
            } else {
                if (_.isFunction(config.completeCallback)) {
                    config.completeCallback();
                }
            }
        },
        deleteNote: function(model, config) {
            config = config || {};
            var ien = model.get('uid');

            if (model.isNew()) {
                if (_.isFunction(config.completeCallback)) {
                    config.completeCallback();
                }

                if (_.isFunction(config.successCallback)) {
                    config.successCallback();
                }
                return;
            }

            if (model.get('status') === 'UNSIGNED' && ien.length > 0) {
                var criteria = {};

                model.destroy({
                    criteria: criteria,
                    error: function(model, resp) {
                        var message;
                        if (_.isUndefined(config.errorMessage)) {
                            config.errorMessage = 'There was an error deleting your note. Contact your System Administrator for assistance.';
                        }
                        if (resp.responseJSON && resp.responseJSON.message) {
                            config.errorMessage += '<br><strong>' + resp.responseJSON.message;
                        }

                        if (!config.silent) {
                            var input = {
                                message: config.errorMessage
                            };

                            var deleteErrorView = new ErrorView(input);
                            deleteErrorView.showModal();
                        }

                        if (_.isFunction(config.errorCallback)) {
                            config.errorCallback();
                        }

                        if (_.isFunction(config.completeCallback)) {
                            config.completeCallback();
                        }
                    },
                    success: function(model, resp) {
                        channel.trigger('note:deleted', model);
                        ADK.Messaging.getChannel('tray-tasks').trigger('action:refresh');

                        if (_.isFunction(config.completeCallback)) {
                            config.completeCallback();
                        }

                        if (_.isFunction(config.successCallback)) {
                            config.successCallback(resp);
                        }

                        // channel.trigger('notestray:opening');

                        if (!config.silent) {
                            var deleteAlertView = new ADK.UI.Notification({
                                title: 'Success',
                                message: 'Note deleted',
                                type: 'success'
                            });

                            deleteAlertView.show();
                        }
                    }
                });
            } else {
                if (_.isFunction(config.completeCallback)) {
                    config.completeCallback();
                }
            }
        },
        generateDocumentDefUidUnique: function(model, suffix) {
            var fields = [
                model.documentDefUid,
                model.localTitle.replace(/\s/g, '_'), //replace spaces in the title with '_'
                suffix
            ];
            return fields.join('---');
        },
        setLocation: function(model) {
            var url = ADK.ResourceService.buildUrl('operational-data-by-uid-getData', {
                        uid: model.get("locationUid")
                    });
            var urlFetch = new Backbone.Collection();
            urlFetch.url = url;
            urlFetch.fetch({
                        error: function(collection, res) {
                            throw new Error(res);
                        },
                        success: function(result) {
                            var facilityObject = result.at(0);
                            if (_.isUndefined(facilityObject)) return;
                            var facilityName = facilityObject.get("facilityName");
                            if (!_.isUndefined(facilityName)) {
                                model.set("facilityName",facilityName);
                            }
                        }
            });
        }
    };
    return util;
});