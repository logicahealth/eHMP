define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'handlebars',
    'hbs!app/applets/notes/subtray/consultTemplate',
    'hbs!app/applets/notes/subtray/consultSubtrayTemplate',
    'app/applets/notes/writeback/errorView'
], function(Backbone, Marionette, _, $, Handlebars, ConsultTemplate, ConsultSubtrayTemplate, ErrorViewModal) {
    'use strict';
    var LINE_LENGTH = 90;
    var consultChannel = ADK.Messaging.getChannel('consult-subtray');
    var subtrayChannel = ADK.Messaging.getChannel('note-subtray');

    var getConsultText = function(consult) {
        var text = consult.name;
        text += consult.associatedCondition ? ' - ' + consult.associatedCondition + '\n' : '';
        text += consult.request ? consult.request + '\n' : '';
        text += consult.comment ? consult.comment + '\n' : '';
        return text;
    };

    var formatConsultString = function(text) {
        text = Handlebars.Utils.escapeExpression(text).replace(/\n/g, "<br />");
        return new Handlebars.SafeString(text);
    };

    /**
     * The list of consults for the patient will be returned from an rdk resource endpoint, containing an identifier for the associated activity, a datetime attribute, a madlib string representing the details of the consult, and potentially a note UID associated with the consult
     * 1) If there is no note UID, then the Consult in the subtray should display a Associate button
     * 2) If there is a note UID and the note UID matches the current note, then the Consult in the subtray should display a Disassociate button
     * 3) If there is a note UID and the note UID does not match the current note, then the Consult in the subtray should display a disabled Associate button
     */
    var setAssociateDisassociateButtonState = function(button, requestEnable, noteModel, consultModel) {
        if (!consultModel.get('noteClinicalObjectUid') || !noteModel.get('uid')) {
            if (requestEnable) {
                button.attr('disabled', false).removeClass('disabled');
            } else {
                button.attr('disabled', true).addClass('disabled');
            }
            button.html('Associate');
            button.attr('title', 'Press enter to associate this consult');
        } else if (noteModel.get('uid') === consultModel.get('noteClinicalObjectUid')) {
            if (requestEnable) {
                button.attr('disabled', false).removeClass('disabled');
            } else {
                button.attr('disabled', true).addClass('disabled');
            }
            button.html('Disassociate');
            button.attr('title', 'Press enter to disassociate this consult');
        } else {
            //Ingore request to enable or disable; disable the button by default
            button.attr('disabled', true).addClass('disabled');
            button.html('Associate');
            button.attr('title', 'Press enter to associate this consult');
        }
    };

    var LoadingView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<h5 class="loading"><i class="fa fa-spinner fa-spin"></i> Loading...</h5>')
    });

    var NoResultsView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div aria-live="assertive"><p class="error-message padding" role="alert">No open consults found.</p></div>'),
        tagName: "p"
    });
    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div aria-live="assertive"><p class="error-message padding" role="alert">{{errorMessage}}</p></div>'),
        initialize: function(options) {
            this.model.set('errorMessage', options.errorMessage);
        },
        tagName: "p"
    });
    var onErrorConsultAssociation = function(){
        var displayMessage = 'There was an error associating/disassociating the consult to the note. Contact the system administrator for assistance.';

        var input = {
                message: displayMessage,
            };
        var associationErrorView = new ErrorViewModal(input);
         associationErrorView.showModal();
    };

    var ConsultDetailView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile("<p>{{formatText}}</p>"),
        templateHelpers: function() {
            return {
                formatText: function() {
                    var text = getConsultText(this);
                    return formatConsultString(text);
                }
            };
        }
    });
    var consultModel = Backbone.Model.extend({
        defaults: {
            createdOn: '',
            name: '',
            associatedCondition: '',
            request: '',
            comment: ''
        }
    });
    var ConsultCollection = Backbone.Collection.extend({
        model: consultModel,
        comparator: function(a, b) {
            var adate = moment(a.get('createdOn'), 'YYYYMMDDHHmmss+SSSS').valueOf();
            var bdate = moment(b.get('createdOn'), 'YYYYMMDDHHmmss+SSSS').valueOf();
            if (adate === bdate) {
                return 0;
            } else {
                return adate > bdate ? -1 : 1;
            }
        },
    });
    var consultView = Backbone.Marionette.ItemView.extend({
        template: ConsultTemplate,
        className: "well well-sm bottom-margin-xs",
        ui: {
            viewConsultButton: '#view-consult-btn',
            associateConsultButton: '#associate-consult-btn'
        },
        events: {
            'click @ui.viewConsultButton': 'launchConsultModal',
            'click @ui.associateConsultButton': 'associateConsult'
        },
        initialize: function() {
            this.isInProcess = false;
            this.listenTo(consultChannel, 'subTray:association:success', function(result) {
                this.onSuccessAssociateConsult(result);
            });
            this.listenTo(consultChannel, 'subTray:association:error', function(error) {
                this.onErrorAssociateConsult(error);
            });
        },
        onBeforeShow: function() {
            var note = subtrayChannel.request('note:model');
            this.listenTo(subtrayChannel, 'note:disabled', function() {
                setAssociateDisassociateButtonState(this.$el.find('button.associate-consult'), false, note, this.model);
            });
            this.listenTo(subtrayChannel, 'note:enabled', function() {
                setAssociateDisassociateButtonState(this.$el.find('button.associate-consult'), true, note, this.model);
            });
        },
        onRender: function() {
            var enabled = subtrayChannel.request('note:ready');
            var note = subtrayChannel.request('note:model');
            if (!enabled) {
                setAssociateDisassociateButtonState(this.$el.find('button.associate-consult'), false, note, this.model);
            } else {
                setAssociateDisassociateButtonState(this.$el.find('button.associate-consult'), true, note, this.model);
            }
            if (this.model.get('noteClinicalObjectUid') && this.model.get('noteClinicalObjectUid') === note.get('uid')) {
                this.$el.addClass('active-note-object');
            } else {
                this.$el.removeClass('active-note-object');
            }
        },
        templateHelpers: function() {
            return {
                formatText: function() {
                    var text = getConsultText(this).replace(/\r/g, '');
                    if (text.length > LINE_LENGTH) {
                        var newAry = [];
                        var currentSize = 0;
                        var toAdd;
                        _.each(text.split('\n'), function(sub) {
                            toAdd = currentSize + sub.length <= LINE_LENGTH ? sub.length : LINE_LENGTH - currentSize;
                            currentSize += toAdd;
                            newAry.push(sub.substring(0, toAdd));
                            if (currentSize == LINE_LENGTH) {
                                return;
                            }
                        });
                        text = newAry.join('\n').trim() + '...';
                    }
                    return formatConsultString(text);
                },
                formatTime: function() {
                    var date = this.createdOn;
                    var fmtDate = moment(date, 'YYYYMMDDHHmmss+SSSS').format('MM/DD/YYYY | HH:mm');
                    return fmtDate;
                }
            };
        },
        launchConsultModal: function(event) {
            event.preventDefault();
            var view = new ConsultDetailView();
            view.model = this.model;

            var modalOptions = {
                'title': 'Consult',
                'size': "medium",
                'backdrop': false
            };

            var modalView = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modalView.show();
        },
        associateConsult: function(event) {
            if (!this.isInProcess) {
                this.isInProcess = true;
                var note = subtrayChannel.request('note:model');
                var Session = ADK.UserService.getUserSession();
                var title = note.get("localTitle").replace(/</g, '(').replace(/>/g, ')').replace(/&/g, ' AND ');
                var options = {
                        resourceTitle: 'activities-signal',
                        fetchType: 'POST',
                        pageable: false,
                        cache: false,
                        onSuccess: function(result) { consultChannel.trigger('subTray:association:success', result);},
                        onError: function(error) { consultChannel.trigger('subTray:association:error',error);},
                        criteria: {
                                    deploymentId: this.model.get('deploymentId'),
                                    processInstanceId: this.model.get('activityInstanceId'),
                                    signalName: null,
                                    parameter: {
                                        signalBody: {
                                            objectType: "signalBody",
                                            noteTitle: title,
                                            noteClinicalObjectUid: note.get("clinicalObject").uid,
                                            comment: "note-consult association",
                                            executionUserId: Session.get("site")+";"+Session.get("duz")[Session.get("site")],
                                            executionUserName: Session.get("lastname") +","+Session.get("firstname")
                                        }
                                    }
                        }
                };
                event.preventDefault();
                if (this.model.get('noteClinicalObjectUid')) {
                    //Call disassociate endpoint
                    //console.log("associateConsult------> disassociate");
                    options.criteria.signalName = "RELEASE.CONSULT";
                    // Disassociation request
                    ADK.ResourceService.fetchCollection(options);
                } else {
                    //console.log("associateConsult------> associate");
                    // call associate endpoint
                    options.criteria.signalName = "CLAIM";
                    // Association request
                    ADK.ResourceService.fetchCollection(options);
                }
        }
    },
    onSuccessAssociateConsult: function(result){
            //prevent other consult views from processing the success call
            if (_.get(result, 'fetchOptions.criteria.processInstanceId') !== this.model.get('activityInstanceId')) {
                return;
            }
            //console.log("RESULT------> ", result);
            consultChannel.trigger('subTray:opened');
            this.isInProcess = false;

            if (_.get(result, 'fetchOptions.criteria.signalName') === 'CLAIM') {
                ADK.Messaging.getChannel('notes').trigger('insert:text', getConsultText(this.model.attributes).replace(/\r/g, ''));
            }
        },
    onErrorAssociateConsult: function(error){
            //console.log("Error------> ", error);
            onErrorConsultAssociation();
            this.isInProcess = false;
        }
    });

    var ConsultCollectionView = Backbone.Marionette.CompositeView.extend({
        template: ConsultSubtrayTemplate,
        childView: consultView,
        emptyView: LoadingView,
        collectionEvents: {
            'consult-get:success': function(collection, response) {
                this.collection.reset(collection.toJSON());
                if (collection.length < 1) {
                    this.emptyView = NoResultsView;
                    this.render();
                }
            },
            'consult-get:error': function(collection, resp) {
                if (resp.responseText.toLowerCase().indexOf('not found') > -1) {
                    this.emptyView = NoResultsView;
                } else {
                    this.emptyViewOptions.errorCode = resp.status;
                    this.emptyViewOptions.errorMessage = 'There was an error fetching your Consults. Error code: ' + resp.status;
                    this.emptyView = ErrorView;
                }
                this.render();
            }
        },
        childViewContainer: '.consult-container',
        className: "modal-content",
        initialize: function() {
            this.collection = new ConsultCollection();
            this.emptyViewOptions = {
                errorMessage: 'There was an error fetching your Consults.'
            };
            this.listenTo(consultChannel, 'subTray:opened', function() {
                this.updateSubtray();
            });
            this.listenTo(consultChannel, 'subTray:closed', function() {
                this.emptyView = LoadingView;
                this.collection.reset();
            });
        },
        updateSubtray: function() {
            this.fetchConsults();
        },
        fetchConsults: function() {
            var self = this;
            var site = ADK.UserService.getUserSession().get('site');
            var fetchOptions = {
                resourceTitle: 'tasks-openconsults',
                fetchType: 'GET',
                cache: false,
                patient: ADK.PatientRecordService.getCurrentPatient(),
                criteria: {
                    icn: ADK.PatientRecordService.getCurrentPatient().get('pid')
                }
            };
            fetchOptions.onError = function(model, resp) {
                self.collection.trigger('consult-get:error', model, resp);
            };
            fetchOptions.onSuccess = function(coll) {
                self.collection.trigger('consult-get:success', coll);
            };
            ADK.PatientRecordService.fetchCollection(fetchOptions);
        }
    });

    return ConsultCollectionView;
});