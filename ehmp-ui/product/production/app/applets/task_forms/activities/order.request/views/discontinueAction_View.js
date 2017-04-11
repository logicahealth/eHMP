define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/order.request/utils'
    ], function(Backbone, Marionette, _, Handlebars, Utils) {
        'use strict';

        var ErrorMessageView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('Unable to save your data at this time due to a system error. Try again later.'),
            tagName: 'p'
        });

        var ErrorFooterView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('{{ui-button "OK" classes="btn-primary" title="Click button to close modal"}}'),
            events: {
                'click .btn-primary': function() {
                    ADK.UI.Alert.hide();
                }
            },
            tagName: 'span'
        });

        var modalFields = [
            {
                control: 'container',
                extraClasses: ['modal-body'],
                items: [{
                    control: 'container',
                    extraClasses: ['container-fluid'],
                    items: [{
                            control: 'container',
                            template: Handlebars.compile('<h4><strong>{{instanceName}}</strong></h4>')
                        },
                        {
                            control: 'container',
                            template: Handlebars.compile('<hr>')
                        },
                        {
                            control: 'textarea',
                            name: 'comment',
                            title: 'Enter a reason to discontinue',
                            label: 'Reason for Discontinue',
                            rows: 3,
                            required: true,
                            maxlength: 200
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['modal-footer'],
                items: [{
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'button',
                            id: 'form-cancel-btn',
                            extraClasses: ['btn-primary', 'btn-sm', 'left-margin-xs'],
                            type: 'button',
                            label: 'Cancel',
                            title: 'Press enter to cancel'
                        }, {
                            control: 'button',
                            disabled: true,
                            extraClasses: ['btn-primary', 'btn-sm'],
                            label: 'Accept',
                            name: 'submit-accept',
                            id: 'submit-accept',
                            title: 'Press enter to submit form'
                        }]
                    }]
                }]
            }];

            return ADK.UI.Form.extend({
                fields: modalFields,
                ui: {
                    'submitBtn': '.submit-accept'
                },
                events: {
                    "click #form-cancel-btn": function(e) {
                        e.preventDefault();
                        ADK.UI.Workflow.hide();
                    },
                    "click #submit-accept": function(e) {
                        var self = this;
                        e.preventDefault();
                        if (this.model.isValid()){
                            var acceptActionModel = new ADK.UIResources.Writeback.Activities.Signal.Model();
                            Utils.buildAcceptActionModel(this.model, acceptActionModel);
                            acceptActionModel.save(null, {
                                success: function() {
                                    var saveAlertView = new ADK.UI.Notification({
                                        title: 'Request Discontinued',
                                        icon: 'fa-check',
                                        message: 'Request discontinued with no errors.'
                                    });
                                    saveAlertView.show();
                                    ADK.UI.Workflow.hide();
                                    ADK.UI.Modal.hide();
                                    ADK.Messaging.getChannel('task_forms').request('activity_detail', {processId: self.model.get('processInstanceId')});
                                },
                                error: function(){
                                    var errorAlertView = new ADK.UI.Alert({
                                        title: 'Save Failed (System Error)',
                                        icon: 'icon-error',
                                        messageView: ErrorMessageView,
                                        footerView: ErrorFooterView
                                    });
                                    errorAlertView.show();
                                }
                            });
                        }
                    }
                },
                modelEvents: {
                    'change:comment': function(){
                        if(this.model.get('comment')){
                            this.ui.submitBtn.trigger('control:disabled', false);
                        } else {
                            this.ui.submitBtn.trigger('control:disabled', true);
                        }
                    }
                }
            });

    });