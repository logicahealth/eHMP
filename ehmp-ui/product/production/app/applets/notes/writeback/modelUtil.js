define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/notes/writeback/operationConfirmationView',
    'app/applets/notes/writeback/errorView'
], function(Backbone, Marionette, _, ConfirmationView, ErrorView) {
    'use strict';
    var channel = ADK.Messaging.getChannel('notes');
    var LINE_LENGTH = 80;

    var util = {

        NOTE_GROUP_RECENT_TITLES: 'Recent Note Titles',

        getUser: function() {
            var site = ADK.UserService.getUserSession().get('site');
            return ADK.UserService.getUserSession().get('duz')[site];
        },
        getUserId: function() {
            return 'urn:va:user:' +ADK.UserService.getUserSession().get('site') +':' +this.getUser();
        },

        getPermissions: function(titleModel) {
            var usite = ADK.UserService.getUserSession().get('site');
            var uduz = ADK.UserService.getUserSession().get('duz');
            var data = {
               "data":{
                  "items":[ titleModel ]
               },
               'actionNames': [
                    'SIGNATURE',
                    'EDIT RECORD',
                    'DELETE RECORD',
                    'CHANGE TITLE'
                ],
           };
            var fetchOptions = {
                resourceTitle: 'evaluate-with-action-names',
                fetchType: 'POST',
                criteria: data,
                onSuccess: function(collection) {
                    var perms = _.chain(collection.models)
                        .filter(function(perm) {return perm.get('hasPermission') === true;})
                        .map(function(perm) { return perm.get('actionName');})
                        .value();
                    titleModel.trigger('asu:permissions:success', perms);
                },
                onError: function(model, response) {
                    titleModel.trigger('asu:permissons:error');
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
            if (model.get('text')) {
                var contentPreview = [];
                var text = model.get('text');
                for (var i = 0; i < text.length; i++) {
                    var content = text[i].content;

                    if (!content) {
                        continue;
                    }

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
                    content = formattedLines.join('\n');
                    text[i].contentPreview = content;

                    if (model.get('signerDisplayName') || model.get('signedDateTime')) {
                        content += '\nSigned: ' + moment(model.get('signedDateTime'), 'YYYYMMDDHHmmss').calendar(null, 'MM/DD/YYYY - HH:mm') +
                            '\nBy: ' + model.get('signerDisplayName');
                    } else if (text[i].clinicians) {
                        for (var k = 0; k < text[i].clinicians.length; k++) {
                            var clinician = text[i].clinicians[k];

                            if (clinician.signedDateTime) {
                                content += '\nSigned: ' + moment(clinician.signedDateTime, 'YYYYMMDDHHmmss').calendar(null, 'MM/DD/YYYY - HH:mm') +
                                    '\nBy: ' + clinician.displayName;
                                break;
                            }
                        }
                    }

                    contentPreview.push(content);
                }
                if (contentPreview.length > 1) {
                    model.set('contentPreview', contentPreview.join('\n\n______________________\n\n'));
                } else {
                    model.set('contentPreview', contentPreview[0]);
                }
            }
            return model;
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
        deleteNoteWithPrompt: function(model, config) {
            config = config || {};
            var self = this;
            var message = 'This note cannot be retrieved once it is deleted. Please select Cancel to return back to the form, or Continue to proceed with deleting.';

            var confirmationConfig = {
                message: message,
                title: 'Delete Note',
                title_icon: 'fa-warning color-red',
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
                            config.errorMessage = 'There was an error deleting your note. Please contact your System Administrator for assistance.';
                        }
                        if (resp.responseJSON && resp.responseJSON.message) {
                            config.errorMessage += '<br><b>' + resp.responseJSON.message;
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

                        if (_.isFunction(config.completeCallback)) {
                            config.completeCallback();
                        }

                        if (_.isFunction(config.successCallback)) {
                            config.successCallback();
                        }

                        // channel.trigger('notestray:opening');

                        if (!config.silent) {
                            var deleteAlertView = new ADK.UI.Notification({
                                title: 'Success!',
                                message: 'Deleted Successfully.',
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
        }
    };
    return util;
});